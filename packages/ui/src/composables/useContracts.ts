import {
  ContractManager,
  createContract,
  type AbiEntry,
  type Contract,
  type ContractDef,
  type TxOptions,
} from "@parity/product-sdk-contracts";
import { devnet_asset_hub } from "@parity/product-sdk-descriptors/devnet-asset-hub";
import type { HexString, SS58String } from "polkadot-api";
import { labelStoreAbi } from "@/lib/abis/labelStore";
import { userStoreAbi } from "@/lib/abis/userStore";
import { cdmJson } from "@/lib/cdm";
import { getChainClient } from "@/composables/useTypedAPI";
import { useNetworkStore } from "@/store/useNetworkStore";
import { signerManager } from "@/store/useWalletStore";
import { ZERO_SUBSTRATE_ADDRESS } from "@/utils";

// Default options applied to every contract write (.tx()) in this app.
//
// `storageDepositLimit`: the SDK's buildReviveCall runs its dry-run internally
// and, with no override, uses the *exact* storage_deposit with no buffer — which
// reverts as Revive.ContractReverted when chain state grows between dry-run and
// execution (e.g. `register()` deploying a fresh LabelStore proxy). The OG
// ReviveClientWrapper used `max(floor, dryRun * 1.2)`, but the SDK exposes no
// buffer hook, so we pass a fixed, generous ceiling instead.
//
// 10_000_000_000_000n = 10^13 planck = 1000 PAS at the chain's 10 native
// decimals. It's a *cap*, not a charge — refundable, and only the actual (small)
// deposit is reserved, so the headroom is safe. (Follow-up: request an SDK
// storage-deposit buffer/multiplier so we can drop this magic number.)
//
// `waitFor`: "finalized" mirrors the prior signSubmitAndWatch behavior of
// resolving only after block finalization (not just inclusion).
export const WRITE_TX_DEFAULTS: Pick<TxOptions, "storageDepositLimit" | "waitFor"> = {
  storageDepositLimit: 10_000_000_000_000n,
  waitFor: "finalized",
};

// Per-user store proxies whose LOGIC ABI is not published to the CDM registry
// (only the StoreFactory + beacon are — see src/lib/abis/labelStore.ts). The
// proxy address is resolved at call time via StoreFactory; the ABI is vendored.
const PROXY_ABIS: Record<string, AbiEntry[]> = {
  "@dotns/label-store": labelStoreAbi,
  "@dotns/user-store": userStoreAbi,
};

let managerPromise: Promise<ContractManager> | null = null;

export async function getContractManager(): Promise<ContractManager> {
  if (!managerPromise) {
    managerPromise = (async () => {
      const chain = await getChainClient();
      // Live address resolution: contract addresses are pulled from the on-chain
      // CDM meta-registry (robust to redeploys), ABIs from the installed snapshot.
      // registryOrigin is the read-only dry-run origin for the registry lookup.
      const manager = await ContractManager.fromLiveClient(
        cdmJson,
        chain.raw.assetHub,
        devnet_asset_hub,
        {
          signerManager,
          registryOrigin: ZERO_SUBSTRATE_ADDRESS as SS58String,
        },
      );
      if (!manager.ok) throw manager.error;
      return manager.value;
    })();
  }
  return managerPromise;
}

export async function getContract(library: string): Promise<Contract<ContractDef>> {
  const m = await getContractManager();
  return m.getContract(library);
}

// Per-user beacon proxies (LabelStore) — address resolved at call time via
// StoreFactory, ABI from PROXY_ABIS (vendored) or the cdm.json snapshot.
export async function getProxyContract(
  library: string,
  address: HexString,
): Promise<Contract<ContractDef>> {
  const m = await getContractManager();
  const abi = PROXY_ABIS[library] ?? getAbi(library);
  return createContract(m.getRuntime(), address, abi, { signerManager });
}

export const getEscrowContract = (): Promise<Contract<ContractDef>> =>
  getContract("@dotns/name-escrow");

export const getPopControllerContract = (): Promise<Contract<ContractDef>> =>
  getContract("@dotns/pop-controller");

export const getPopResolverContract = (): Promise<Contract<ContractDef>> =>
  getContract("@dotns/pop-resolver");

// Live escrow address, e.g. as the spender a name owner approves before release.
export async function getEscrowAddress(): Promise<HexString> {
  const m = await getContractManager();
  return m.getAddress("@dotns/name-escrow");
}

export function getAbi(library: string): AbiEntry[] {
  const entry = cdmJson.contracts?.[library];
  if (!entry) {
    throw new Error(`Library ${library} not in cdm.json`);
  }
  return entry.abi;
}

function destroyContractManager(): void {
  managerPromise = null;
}

const isNoActiveFollow = (err: unknown): boolean =>
  (err instanceof Error ? err.message : String(err)).includes("No active follow");

// Recovery ladder for transient/dead chainHead_follow subscriptions, mirrored
// from useTransactionStore.ethCall. Three attempts: original → 250ms wait +
// retry → reset chain client + manager + retry. PAPI v2's typed API doesn't
// auto-recover from a dropped follow, which fires after host modals pause the
// WebView.
export async function withContractRecovery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err1) {
    if (!isNoActiveFollow(err1)) throw err1;
    await new Promise((r) => setTimeout(r, 250));
    try {
      return await fn();
    } catch (err2) {
      if (!isNoActiveFollow(err2)) throw err2;
      console.warn("[useContracts] chainHead disjoint, resetting client + manager");
      useNetworkStore().resetClient();
      destroyContractManager();
      return await fn();
    }
  }
}

// A read that must never reject: runs `fn` through withContractRecovery and, if
// it still fails, logs under `label` and returns `fallback`. The canonical shape
// for every non-throwing on-chain read.
export function safeRead<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  return withContractRecovery(fn).catch((error) => {
    console.warn(label, error);
    return fallback;
  });
}
