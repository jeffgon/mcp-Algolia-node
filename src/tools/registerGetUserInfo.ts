import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type DashboardApi } from "../DashboardApi.ts";

export function registerGetUserInfo(
  server: McpServer,
  dashboardApi: DashboardApi
) {
  server.tool(
    "get-user-info",
    "Get information about the user in the Algolia system",
    async () => {
      const user = await dashboardApi.getUser();

      return {
        content: [
          {
            type: "resource",
            resource: {
              mimeType: "application/json",
              uri: "algolia://user",
              text: JSON.stringify(user),
            },
          },
        ],
      };
    }
  );
}
