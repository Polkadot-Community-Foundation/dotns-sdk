// A dot.li-style gateway serves a name as a subdomain: alice.dot is reachable at
// alice.<gateway>. The dotns UI is itself served from that gateway (e.g.
// dotns.dev-dot.li on devnet, dotns.dot.li on mainnet), so we derive the gateway
// from the current hostname rather than hardcoding it — the same build then emits
// correct "view your name" links on dot.li, dev-dot.li, paseo.li, etc.
const DEFAULT_GATEWAY = "dot.li";

/**
 * The dot.li-style gateway domain the UI is currently served from, e.g.
 * "dev-dot.li". Gateway hosts look like `<label>.<gateway-root>` where the root
 * is a registrable `*.li` domain; we take the last two DNS labels. Falls back to
 * DEFAULT_GATEWAY when not served from a `.li` gateway (localhost, an IP, or a
 * bare `.dot` direct host).
 */
export function currentDotliGateway(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const parts = host.split(".");
  if (parts.length >= 2 && parts[parts.length - 1] === "li") {
    return parts.slice(-2).join(".");
  }
  return DEFAULT_GATEWAY;
}

/** Viewing URL for a name on the gateway the UI is served from, e.g.
 *  ["https://alice.dev-dot.li"] when served on dev-dot.li. */
export function dotliViewUrls(name: string): string[] {
  const stem = name
    .trim()
    .toLowerCase()
    .replace(/\.dot$/, "");
  return [`https://${stem}.${currentDotliGateway()}`];
}
