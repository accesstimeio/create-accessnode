#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import pico from "picocolors";
import prettier from "prettier";
import { execa } from "execa";
import { CHAINS } from "../src/chain";

const REPO_URL = "https://github.com/accesstimeio/accessnode";

async function main() {
  const args = process.argv.slice(2);
  const cliProjectName = args.find((arg) => arg.startsWith("--project-name="));
  let projectName: string | undefined = cliProjectName?.split("=")[1];

  if (!projectName) {
    const res = await prompts({
      type: "text",
      name: "name",
      message: "Enter your project name:",
      initial: "accessnode-app",
    });
    projectName = res.name.trim();
  }

  const projectPath = path.resolve(process.cwd(), projectName!);

  // Step 1: Clone repo
  console.log(pico.blue("⏳ Cloning repository..."));
  await execa("git", ["clone", REPO_URL, projectName!]);

  // Step 2: Choose chains
  const { selectedChains } = await prompts({
    type: "multiselect",
    name: "selectedChains",
    message: "Select chains to support:",
    choices: CHAINS.map((c) => ({ title: c.name, value: c.id })),
    min: 1,
  });

  const contractNetworkConfig: Record<
    string,
    { address: string[]; startBlock: Record<string, number> }
  > = {};

  for (const chainId of selectedChains) {
    const { addresses } = await prompts({
      type: "text",
      name: "addresses",
      message: `Enter contract addresses for ${chainId} (comma-separated):`,
    });

    const addressList = addresses
      .split(",")
      .map((a: string) => a.trim().toLowerCase())
      .filter(Boolean);

    // Ask for start block at the chain level
    const { startBlock } = await prompts({
      type: "number",
      name: "startBlock",
      message: `Enter start block for ${chainId}:`,
    });

    contractNetworkConfig[chainId] = {
      address: addressList,
      startBlock,
    };
  }

  // Step 3: Generate config content
  const selectedNetworkConfigs = Object.fromEntries(
    selectedChains.map((id: string) => {
      const chain = CHAINS.find((c) => c.id === id)!;
      return [id, chain.config];
    }),
  );

  const rawConfig = `
    import { createNodeConfig } from "./src/types";
    import { http } from "viem";

    export default createNodeConfig({
      networks: ${JSON.stringify(selectedNetworkConfigs, null, 2).replaceAll(
    /"http\((.*?)\)"/g,
    (_, env) => `http(${env})`,
  )},
      contracts: {
        AccessTime: {
          network: ${JSON.stringify(contractNetworkConfig, null, 2)}
        }
      }
    });
  `;

  const formattedConfig = await prettier.format(rawConfig, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(projectPath, "node.config.ts"), formattedConfig);

  console.log();
  console.log(pico.green("✅ Project created at:"), pico.bold(projectPath));
  console.log(pico.green("✅ Configuration written to node.config.ts"));
  console.log();

  // Step 4: Cleanup git and re-init
  console.log(pico.blue("🔧 Resetting git history..."));
  fs.rmSync(path.join(projectPath, ".git"), { recursive: true, force: true });
  await execa("git", ["init"], { cwd: projectPath });
  await execa("git", ["add", "."], { cwd: projectPath });
  await execa("git", ["commit", "-m", "chore: update config"], { cwd: projectPath });
  console.log(pico.green("✅ Git repository initialized."));

  // Step 5: Ensure pnpm is installed
  console.log(pico.blue("🔍 Checking pnpm..."));
  let pnpmInstalled = true;
  try {
    await execa("pnpm", ["--version"]);
  } catch {
    pnpmInstalled = false;
  }

  if (!pnpmInstalled) {
    console.log(pico.yellow("📦 pnpm not found. Installing..."));
    await execa("npm", ["install", "-g", "pnpm"]);
    console.log(pico.green("✅ pnpm installed globally."));
  }

  // Step 6: Install dependencies
  console.log(pico.blue("📦 Installing dependencies with pnpm..."));
  await execa("pnpm", ["install"], { cwd: projectPath });
  console.log(pico.green("✅ Dependencies installed."));

  console.log();
  console.log(pico.green("🚀 Setup complete! Happy hacking!"));
}

main().catch((err) => {
  console.error(pico.red("❌ Error:"), err.message);
  process.exit(1);
});
