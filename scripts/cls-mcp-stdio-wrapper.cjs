#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

process.env.TRANSPORT = process.env.TRANSPORT || "stdio";

// Keep stdout reserved for MCP JSON-RPC frames. cls-mcp-server prints a startup
// line with console.log in stdio mode, which breaks strict MCP clients.
console.log = (...args) => console.error(...args);

function findClsMcpEntrypoint() {
  try {
    return require.resolve("cls-mcp-server/dist/index.js");
  } catch (_error) {
    // Fall through to the npx cache scan below.
  }

  const npxCacheDir = path.join(os.homedir(), ".npm", "_npx");
  const candidates = [];

  if (fs.existsSync(npxCacheDir)) {
    for (const entry of fs.readdirSync(npxCacheDir)) {
      candidates.push(
        path.join(npxCacheDir, entry, "node_modules", "cls-mcp-server", "dist", "index.js")
      );
    }
  }

  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  if (existing) {
    return existing;
  }

  throw new Error(
    "Cannot find cls-mcp-server. Run `npx -y cls-mcp-server@latest --help` once to populate the npm cache."
  );
}

require(findClsMcpEntrypoint());
