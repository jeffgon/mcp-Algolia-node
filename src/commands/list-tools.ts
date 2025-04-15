import { loadOpenApiSpec, type OpenApiSpec } from "../tools/registerOpenApi.ts";
import { operationId as GetUserInfoOperationId } from "../tools/registerGetUserInfo.ts";
import { operationId as GetApplicationsOperationId } from "../tools/registerGetApplications.ts";

const API_SPECS_PATHS = [
  new URL("../../data/search.yml", import.meta.url).pathname,
  new URL("../../data/analytics.yml", import.meta.url).pathname,
];

export async function listTools(): Promise<void> {
  displayGroup("Dashboard API", [GetUserInfoOperationId, GetApplicationsOperationId]);

  for (const specPath of API_SPECS_PATHS) {
    const spec = await loadOpenApiSpec(specPath);
    const operationIds = extractOperationIds(spec);
    displayGroup(spec.info.title, operationIds);
  }
}

function displayGroup(title: string, operationIds: string[]): void {
  console.log(title);
  console.log(`\t${operationIds.join(", ")}`);
  console.log("\n---\n");
}

function extractOperationIds(spec: OpenApiSpec): string[] {
  return Object.values(spec.paths)
    .flatMap((path) => Object.values(path))
    .filter((operation) => !operation["x-helper"])
    .map((operation) => operation.operationId);
}
