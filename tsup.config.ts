import { defineConfig } from "tsup";
import { dependencies } from "./package.json";

export default defineConfig({
  name: "create-accessnode",
  bundle: true,
  clean: true,
  entry: ["bin/cli.ts"],
  external: Object.keys(dependencies),
  format: ["esm", "cjs"],
  platform: "node",
});
