import { loadOpenApiSpec, type OpenApiSpec } from "../tools/registerOpenApi.ts";
import { operationId as GetUserInfoOperationId } from "../tools/registerGetUserInfo.ts";
import { operationId as GetApplicationsOperationId } from "../tools/registerGetApplications.ts";
import * as specs from "../openApiSpecs.ts";
import { type CliFilteringOptions, getToolFilter, isToolAllowed } from "../toolFilters.ts";

const API_SPECS_PATHS = Object.values(specs);

export type ListToolsOptions = CliFilteringOptions & {
  all: boolean;
};

export async function listTools(opts: ListToolsOptions): Promise<void> {
  const toolFilter = opts.all ? undefined : getToolFilter(opts);

  const dashboardApiTools = [GetUserInfoOperationId, GetApplicationsOperationId].filter((id) =>
    isToolAllowed(id, toolFilter),
  );
  if (dashboardApiTools.length > 0) {
    displayGroup("Dashboard API", dashboardApiTools);
  }

  for (const specPath of API_SPECS_PATHS) {
    const spec = await loadOpenApiSpec(specPath);
    const toolIds = extractToolIds(spec).filter((id) => isToolAllowed(id, toolFilter));

    if (toolIds.length > 0) {
      displayGroup(spec.info.title, toolIds);
    }
  }
}

function displayGroup(title: string, operationIds: string[]): void {
  console.log(title);
  console.log(`> ${operationIds.join(", ")}\n`);
}

function extractToolIds(spec: OpenApiSpec): string[] {
  return Object.values(spec.paths)
    .flatMap((path) => Object.values(path))
    .filter((operation) => !operation["x-helper"])
    .map((operation) => operation.operationId);
}
