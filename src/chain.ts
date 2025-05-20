export const CHAINS = [
  {
    id: "base",
    name: "Base",
    config: {
      chainId: 8453,
      transport: "http(process.env.ACCESSNODE_RPC_URL_8453)",
      maxRequestsPerSecond: 15,
    },
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    config: {
      chainId: 84532,
      transport: "http(process.env.ACCESSNODE_RPC_URL_84532)",
      maxRequestsPerSecond: 15,
    },
  },
];
