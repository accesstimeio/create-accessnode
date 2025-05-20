# create-accessnode

CLI tool to scaffold AccessNode projects for AccessTime. Clones the AccessNode repo, configures blockchain networks and contract addresses, and generates a node.config.ts file. Supports Light and Full modes for decentralized data querying with Ponder.

## Installation

```bash
pnpm create accessnode
```

## Usage

1. Run the CLI with create-accessnode --project-name=my-node
2. Enter a project name (default: accessnode-app)
3. Select blockchain networks (e.g., Base, Base Sepolia)
4. Provide contract addresses and start blocks for each chain
5. The CLI clones the AccessNode repo and generates node.config.ts

## Next Steps

- Navigate to the project: cd my-node
- Install dependencies: pnpm install
- Run the node:
    - Light mode: pnpm start:light
    - Full mode: pnpm start:full
    - With UI: pnpm start:light:ui or pnpm start:full:ui

## Resources

- [AccessNode Repository](https://github.com/accesstimeio/accessnode)
- [AccessTime Documentation](https://docs.accesstime.io)
- [Ponder Documentation](https://ponder.sh)