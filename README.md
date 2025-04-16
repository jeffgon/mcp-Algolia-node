# Algolia NodeJS MCP implementation

## Getting Started

### Installation

You need at least Node 22

```sh
git clone https://github.com/algolia/mcp-node
cd mcp-node
npm i
```

### Claude MCP configuration

```json
{
  "mcpServers": {
    "algolia-mcp": {
      "command": "<PATH_TO_BIN>/node",
      "args": [
        "--experimental-strip-types",
        "--no-warnings=ExperimentalWarning",
        "<PATH_TO_PROJECT>/src/app.ts"
      ]
    }
  }
}
```

### Advanced

If you want to restrict or allow more operationIds, you can pass more options (see CLI usage below)

```json
{
  "mcpServers": {
    "algolia-mcp": {
      "command": "<PATH_TO_BIN>/node",
      "args": [
        "--experimental-strip-types",
        "--no-warnings=ExperimentalWarning",
        "<PATH_TO_PROJECT>/src/app.ts",
        "-t getSettings"
      ]
    }
  }
}
```

## CLI

### List available commands

```sh
Usage: algolia-mcp [options] [command]

Options:
  -h, --help              display help for command

Commands:
  start-server [options]  Starts the Algolia MCP server
  authenticate            Authenticate with Algolia
  logout                  Remove all stored credentials
  list-tools              List all available tools
  help [command]          display help for command
```

### Server options

```sh
Usage: algolia-mcp start-server [options]

Starts the Algolia MCP server

Options:
  -o, --allow-tools <tools>  Comma separated list of tool ids (default:
                             ["listIndices","getSettings","searchSingleIndex","getTopSearches","getTopHits","getNoResultsRate"])
  -h, --help                 display help for command
```

## What can I ask for?

Algolia Node MCP lets you interact with your Algolia apps and indices. Here are some example prompts to get you started:

### Account

- "What is the email address associated to my account?"

### Apps

- "List all my apps Algolia apps."
- "List all the apps that I own."
- "What's the ID for app Latency?"

### Search

- "Search all items in the products index of app Latency where brand = 'Nike' and price < 100."

### AB Testing

- "Do I have any AB Tests currently running on application <APPLICATION_ID>?"

### Analytics

- "I have an index named <index_name> on application <application_id>, can you generate a graph for no results rate in DE region over the past month? Please use react and recharts."

### Monitoring

- "Are there any incidents going on at Algolia currently?"
