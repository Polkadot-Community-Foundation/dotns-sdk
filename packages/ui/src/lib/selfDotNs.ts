// Copyright (C) Parity Technologies (UK) Ltd.
// SPDX-License-Identifier: Apache-2.0

// The dotNS identifier this app is served under — passed to HostProvider's
// `productAccount` option so the host derives the per-dapp product account
// scoped to this domain (see `useWalletStore`).
//
// Derived from the serving host, matching the cross-product convention:
//   - `<name>.dot.li` gateway URLs map back to `<name>.dot`
//   - an in-host `<name>.dot` host is used as-is
//   - localhost dev uses the loopback host (e.g. `localhost:5173`)
//   - otherwise fall back to the canonical `dotns.dot`
export function getSelfDotNs(): string {
  if (typeof window === "undefined") return "dotns.dot";
  const host = window.location.hostname;
  if (host === "localhost") return window.location.host;
  if (host.endsWith(".dot.li")) return host.slice(0, -3);
  if (host.endsWith(".dot")) return host;
  return "dotns.dot";
}
