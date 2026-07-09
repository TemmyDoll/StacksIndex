# StacksIndex

> Sample project for the LAB Open Source Builders Fund. This is a reference archetype showing what a Bitcoin Developer Tooling submission can look like. It is intentionally minimal so builders can see the shape of a fundable project without copying production code.

A lightweight open indexer for Stacks smart contracts. Fetches contract state, decodes events, and provides a queryable interface for developers building on Stacks.

## Why this exists

Building applications on Stacks means constantly reading contract state, tracking events, and reconstructing history. Most builders end up writing the same indexing plumbing over and over. StacksIndex is the reference implementation that lets any Stacks builder skip that work and focus on what they are actually building.

## Focus area alignment

This project aligns with the **Bitcoin Developer Tooling** track of the LAB Open Source Builders Fund. It reduces friction for other builders working on Stacks and Bitcoin infrastructure, which is exactly what the fund exists to support.

## What it does

- Fetches transaction and contract state from Hiro API and public Stacks nodes
- Decodes Clarity contract events into typed structures
- Stores indexed state in local PostgreSQL for querying
- Exposes a simple REST interface for downstream applications
- Supports plugin adapters for custom event decoders

## Architecture

The indexer runs three coordinated services:

1. **Ingester** polls the Stacks chain for new blocks and transactions
2. **Decoder** parses Clarity values into typed events using contract ABI
3. **Query API** exposes indexed data through REST endpoints

Each service can scale independently. The decoder is pluggable so builders can add custom logic for their contracts without forking the whole indexer.

## Getting started

```bash
git clone https://github.com/YOUR-ORG/stacksindex
cd stacksindex
npm install
cp .env.example .env
# Fill in HIRO_API_URL and DATABASE_URL
npm run migrate
npm run start
```

## Running against a specific contract

```bash
npm run index -- --contract SP2ABCD.my-contract --from-block 100000
```

## Development

```bash
npm test              # Run test suite
npm run lint          # Check code style
npm run build         # Build for production
```

## Roadmap

- v0.1: Ingester and decoder for basic Clarity events
- v0.2: Query API with pagination and filters
- v0.3: WebSocket subscriptions for live events
- v0.4: Plugin registry for community-contributed decoders

## Contributing

Contributions welcome. See CONTRIBUTING.md for guidelines. Priority areas: additional event decoders, adapters for specific contract patterns, integration tests against live testnet.

## License

MIT

## Fund attribution

Built as a sample archetype for the [LAB Open Source Builders Fund](https://artizen.fund/index/mf/lab-open-source-builders-fund).
