import { describe, expect, test } from "bun:test";
import { applyWeightBuffer } from "../../../src/client/polkadotClient";
import type { SubstrateWeight } from "../../../src/types/types";

// A dry-run's own `weight_required` for `registry.setSubnodeOwner` on a fresh subname,
// the call that reverted with empty data when it was submitted with no headroom.
const SUBNODE_WEIGHT: SubstrateWeight = {
  referenceTime: 12_723_920_582n,
  proofSize: 729_766n,
} as SubstrateWeight;

describe("applyWeightBuffer", () => {
  test("scales both components up by 25%", () => {
    expect(applyWeightBuffer(SUBNODE_WEIGHT)).toEqual({
      ref_time: 15_904_900_727n,
      proof_size: 912_207n,
    });
  });

  test("leaves headroom over the measured weight, so a heavier execution still fits", () => {
    const buffered = applyWeightBuffer(SUBNODE_WEIGHT);
    expect(buffered.proof_size).toBeGreaterThan(SUBNODE_WEIGHT.proofSize);
    expect(buffered.ref_time).toBeGreaterThan(SUBNODE_WEIGHT.referenceTime);
  });

  test("stays at zero for a zero weight rather than inventing a floor", () => {
    expect(applyWeightBuffer({ referenceTime: 0n, proofSize: 0n } as SubstrateWeight)).toEqual({
      ref_time: 0n,
      proof_size: 0n,
    });
  });
});
