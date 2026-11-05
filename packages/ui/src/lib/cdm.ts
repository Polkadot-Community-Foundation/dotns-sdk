import type { CdmJson } from "@parity/product-sdk-contracts";
import type { HexString } from "polkadot-api";
import cdmJsonRaw from "../../cdm.json" with { type: "json" };

// `cdm install` up to cdm 0.8.x writes a target-bucketed manifest:
//   { targets: { <hash>: { registry } }, dependencies: { <hash>: {…} }, contracts: { <hash>: {…} } }
// cdm-cli 0.14 writes the flat shape ContractManager reads ({ registry, dependencies, contracts }).
// Normalise at load by lifting the registry-bearing target to the top level, so either works.
type NestedCdm = {
  targets?: Record<string, { registry?: HexString }>;
  dependencies?: Record<string, CdmJson["dependencies"]>;
  contracts?: Record<string, CdmJson["contracts"]>;
};

function flattenCdm(raw: NestedCdm): CdmJson {
  const targetsMap = raw.targets;
  if (!targetsMap) return raw as unknown as CdmJson;
  const keys = Object.keys(targetsMap);
  const target = keys.find((k) => targetsMap[k]?.registry) ?? keys[0];
  if (!target) return raw as unknown as CdmJson;
  return {
    registry: targetsMap[target]?.registry,
    dependencies: raw.dependencies?.[target] ?? {},
    contracts: raw.contracts?.[target] ?? {},
  } as CdmJson;
}

export const cdmJson: CdmJson = flattenCdm(cdmJsonRaw as unknown as NestedCdm);
