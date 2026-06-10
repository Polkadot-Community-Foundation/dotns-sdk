import { getAddress, zeroAddress } from "viem";
import type { Deployment, NetworkConfig } from "@/type";

/**
 * Network Configuration
 *
 * Supported blockchain networks and their deployment addresses
 */

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig & Partial<Deployment>> = {
  420420417: {
    chainId: 420420417,
    chainName: "Summit Asset Hub",
    nativeCurrency: {
      name: "Summit",
      symbol: "SUM",
      decimals: 18,
    },
    rpcUrls: ["wss://summit-asset-hub-rpc.polkadot.io"],
    // TODO(summit): set the block explorer URL once known.
    blockExplorerUrls: [],
    dotnsRegistry: "0xFb7AB7E142ED0248D77198CA8722D67C1930D783",
    dotnsRegistrarController: "0xA68a5b2A6be6d014be0dB07c0ed4bacc4A6A570A",
    dotnsResolver: "0xC7f1C3B16BFd0c5910EE37a4a2033f4506AcE94d",
    dotnsReverseResolver: "0x5aa444C6cbA9bd703d1a0B5E5C643FB886F80bB4",
    storeFactory: "0x2947af3CBFb45b89610524a25921C32cB65C4C39",
    dotnsRegistrar: "0xf3969bCBE60463302306663C62A6A8ef91ab9aA5",
    multiCall: getAddress("0x1C1044BEa5bDe0F435436bB52A8340fBE1D59847"),
    popOracle: "0x6331e51C9AfC73BfE12562fd160BA2c66A73f984",
    dotnsContentResolver: "0xf110e5799c3f0adb8ED885C02c45Ecfe7fD86226",
    ethRPCURL: "https://summit-asset-hub-rpc.polkadot.io",
  },
};

/// We using the ALICE as a zero address placeholder for Substrate-based addresses
export const ZERO_SUBSTRATE_ADDRESS = "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV";

export const DEFAULT_NETWORK_ID = 420420417;
export const TOKEN_UNIT = "SUM";
// TODO(summit): set the block explorer URL once known.
export const BLOCK_EXPLORER = "";

export const GAS_LIMIT = 10000000n;
export const MAX_WEIGHT = {
  refTime: BigInt("18446744073709551615"),
  proofSize: BigInt("18446744073709551615"),
};

/**
 * Get the first deployed network from SUPPORTED_NETWORKS
 *
 * @returns The first network with a deployed dotnsRegistry, or undefined
 */
export function getFirstDeployedNetwork(): (NetworkConfig & Partial<Deployment>) | undefined {
  return Object.values(SUPPORTED_NETWORKS).find((network) => network.dotnsRegistry !== zeroAddress);
}
