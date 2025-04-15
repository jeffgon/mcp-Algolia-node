#!/usr/bin/env -S node --experimental-strip-types --no-warnings=ExperimentalWarning

import { Command } from "commander";
import { type StartServerOptions } from "./commands/start-server.ts";

const program = new Command("algolia-mcp");

program
  .command("start-server", { isDefault: true })
  .description("Starts the Algolia MCP server")
  .option<string[]>(
    "-t, --allow-tools <tools>",
    "Comma separated list of tool ids",
    (val) => val.split(",").map((s) => s.trim()),
    [
      "getUserInfo",
      "getApplications",
      "listIndices",
      "getSettings",
      "searchSingleIndex",
      "getTopSearches",
      "getTopHits",
      "getNoResultsRate",
    ],
  )
  .action(async (opts: StartServerOptions) => {
    const { startServer } = await import("./commands/start-server.ts");
    await startServer(opts);
  });

program
  .command("authenticate")
  .description("Authenticate with Algolia")
  .action(async () => {
    const { authenticate } = await import("./commands/authenticate.ts");
    await authenticate();
  });

program
  .command("logout")
  .description("Remove all stored credentials")
  .action(async () => {
    const { logout } = await import("./commands/logout.ts");
    await logout();
  });

program
  .command("list-tools")
  .description("List all available tools")
  .action(async () => {
    const { listTools } = await import("./commands/list-tools.ts");
    await listTools();
  });

program.parse();
