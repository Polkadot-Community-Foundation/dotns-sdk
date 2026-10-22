<template>
  <div class="space-y-8">
    <div>
      <p class="text-sm font-medium text-dot-accent mb-2">Protocol</p>
      <h1 class="text-4xl font-serif text-dot-text-primary mb-4">Architecture</h1>
      <p class="text-lg text-dot-text-secondary leading-relaxed">
        DotNS is built from
        <span class="text-dot-text-primary font-medium">8 smart contracts</span>
        deployed on Paseo AssetHub. Each one has a single responsibility, and together they cover
        registration, resolution, content management, and proof-of-personhood pricing.
      </p>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-dot-text-primary">Deployed Contracts</h2>
      <p class="text-dot-text-secondary text-sm">
        Each contract is live on the Paseo AssetHub testnet at the address shown below.
      </p>
      <div class="space-y-3">
        <div
          v-for="contract in contracts"
          :key="contract.name"
          class="p-4 border border-dot-border rounded-lg bg-dot-surface"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-medium text-dot-text-primary">{{ contract.name }}</p>
              <p class="text-xs text-dot-text-tertiary mt-1">{{ contract.description }}</p>
            </div>
          </div>
          <p class="mt-2 text-xs font-mono text-dot-accent break-all">{{ contract.address }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-dot-text-primary">Contract Relationships</h2>
      <p class="text-dot-text-secondary text-sm leading-relaxed">
        During registration and resolution the Controller coordinates each step, while the Registry
        holds the definitive record of who owns each name.
      </p>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-dot-text-primary">Registration Flow</h2>
      <div class="space-y-3">
        <div
          v-for="(step, i) in flowSteps"
          :key="i"
          class="flex items-start gap-4 p-4 border border-dot-border rounded-lg bg-dot-surface"
        >
          <div
            class="w-8 h-8 rounded-lg bg-dot-surface-secondary text-dot-text-primary flex items-center justify-center text-sm font-bold shrink-0"
          >
            {{ i + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-dot-text-primary">{{ step.title }}</p>
            <p class="text-xs text-dot-text-secondary mt-1">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-dot-text-primary">Resolution Flow</h2>
      <p class="text-dot-text-secondary text-sm leading-relaxed">
        Once registered, name lookup is straightforward. The
        <span class="font-mono text-dot-accent">Registry</span>
        maps each node (a unique hash that identifies a name) to its owner and resolver address.
        Query the <span class="font-mono text-dot-accent">Resolver</span> to convert a name to an
        address, the <span class="font-mono text-dot-accent">ReverseResolver</span> to convert an
        address back to a name, and the
        <span class="font-mono text-dot-accent">ContentResolver</span>
        to read profile records and content hashes.
      </p>
    </div>

    <DocCallout variant="info" title="Modular design">
      Each contract can be upgraded independently. The Registry is the only contract that stores
      ownership data &mdash; resolvers hold no state of their own and can be replaced without
      migrating names.
    </DocCallout>

    <div class="border-t border-dot-border pt-6 flex justify-between text-sm">
      <RouterLink
        to="/docs/getting-started"
        class="text-dot-text-tertiary hover:text-dot-text-primary"
      >
        &larr; Getting Started
      </RouterLink>
      <RouterLink to="/docs/protocol/naming" class="text-dot-accent hover:text-dot-accent-hover">
        The .dot Namespace &rarr;
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import DocCallout from "@/components/docs/DocCallout.vue";

const contracts = [
  {
    name: "DotnsRegistry",
    description: "Central record of who owns each name and which resolver handles it.",
    address: "0xb052E5EfC5ADEff1f21d48DEfb5169Cb394A1a73",
  },
  {
    name: "DotnsRegistrar",
    description: "ERC721 NFT contract that represents permanent .dot name ownership.",
    address: "0xc609e0c2DAB4433d55a32FB098Db8788C1956302",
  },
  {
    name: "DotnsRegistrarController",
    description:
      "Coordinates the commit-reveal registration flow, including pricing and proof-of-personhood checks.",
    address: "0x59dcF8BfFFa7239243785C3fC336D8Bb22312e8c",
  },
  {
    name: "DotnsResolver",
    description: "Converts a .dot name into an on-chain address (forward resolution).",
    address: "0xFcB74C073a2d14dc65B178Bb873f4dE51318DDC2",
  },
  {
    name: "DotnsReverseResolver",
    description: "Converts an address back to its primary .dot name (reverse resolution).",
    address: "0x736e067290AE71f841399575ABfc8b2BAA5Eed7E",
  },
  {
    name: "DotnsContentResolver",
    description: "Stores profile text records (Twitter, GitHub, etc.) and IPFS content hashes.",
    address: "0x7e75491ecfb04900EB05ee63CABA2B33900aABB5",
  },
  {
    name: "PopRules",
    description: "Classifies names by length and sets pricing based on proof-of-personhood status.",
    address: "0xD5Ee34610F06f7FF4668aB4fabE2393B65a43AE7",
  },
  {
    name: "StoreFactory",
    description:
      "Deploys per-user stores: a protocol-managed LabelStore for the registration ledger and a user-claimed UserStore for arbitrary records.",
    address: "0x5Df012daA06cA2602DA153309C2E3A83284Cb879",
  },
];

const flowSteps = [
  {
    title: "Controller consults PopRules",
    description:
      "The Controller calls PopRules to classify the name and determine the registration price from the user's proof-of-personhood tier.",
  },
  {
    title: "Controller calls Registrar to mint NFT",
    description:
      "The Registrar mints an ERC721 token (NFT) that represents ownership of the .dot name. The token ID comes from the name's node hash.",
  },
  {
    title: "Registrar updates Registry",
    description:
      "The Registrar writes the owner and resolver addresses into the Registry for the newly registered name.",
  },
  {
    title: "Label written to the LabelStore",
    description:
      "The owner's protocol-managed LabelStore records the registered label as a permanent, locked entry, building the address's lifetime-of-ownership ledger.",
  },
  {
    title: "Resolvers become queryable",
    description:
      "The Resolver, ReverseResolver, and ContentResolver can now answer queries for the newly registered name.",
  },
];
</script>
