import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type DashboardApi } from "../DashboardApi.ts";

export function registerGetApplications(
  server: McpServer,
  dashboardApi: DashboardApi
) {
  server.tool(
    "get-applications-list",
    "Gets a paginated list of Algolia applications for the current user",
    async () => {
      const applications = await dashboardApi.getApplications();

      return {
        content: [
          {
            type: "resource",
            resource: {
              mimeType: "application/json",
              uri: "algolia://applications",
              text: JSON.stringify(applications),
            },
          },
        ],
      };
    }
  );
}
