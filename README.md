# Algolia NodeJS MCP implementation

## Installation

You need at least Node 22

```sh
npm i
```

## Claude MCP configuration

```json
{
  "mcpServers": {
    "algolia-mcp": {
      "command": "<PATH_TO_BIN>/node",
      "args": ["--experimental-strip-types", "<PATH_TO_PROJECT>/src/app.ts"]
    }
  }
}
```
