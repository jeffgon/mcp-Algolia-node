import yaml from "yaml";
import fs from "node:fs/promises";
import { z, type ZodType } from "zod";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type DashboardApi } from "../DashboardApi.ts";
import { expandAllRefs, jsonSchemaToZod, type JsonSchema } from "../helpers.ts";
import { isToolAllowed, type ToolFilter } from "../toolFilters.ts";

type Methods = "get" | "post" | "put" | "delete";
type Operation = {
  "x-helper"?: boolean;
  operationId: string;
  summary?: string;
  description?: string;
  parameters?: Array<Parameter>;
  requestBody?: RequestBody;
};

type Path = Record<Methods, Operation>;

type Parameter = {
  in: "query" | "path";
  name: string;
  description?: string;
  required?: boolean;
  schema: JsonSchema;
};

type RequestBody = {
  required?: boolean;
  description?: string;
  content: Record<string, RequestBodyContent>;
};

type RequestBodyContent = {
  schema: JsonSchema;
};

export type OpenApiSpec = {
  info: {
    title: string;
    description: string;
  };
  paths: Record<string, Path>;
  servers: Array<{
    url: string;
    variables?: Record<string, { default: string }>;
  }>;
};

export type RequestMiddleware = (opts: {
  request: Request;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
}) => Promise<Request>;

type OpenApiToolsOptions = {
  server: McpServer;
  dashboardApi: DashboardApi;
  openApiSpec: OpenApiSpec;
  toolFilter?: ToolFilter;
  requestMiddlewares?: Array<RequestMiddleware>;
};

export async function loadOpenApiSpec(path: string): Promise<OpenApiSpec> {
  const openApiSpecContent = await fs.readFile(path, "utf-8");
  const spec = yaml.parse(openApiSpecContent, {});
  return expandAllRefs(spec) as OpenApiSpec;
}

function buildUrlParameters(servers: OpenApiSpec["servers"]) {
  return Object.keys(servers[0].variables || {}).reduce(
    (acc, name) => ({ ...acc, [name]: z.string() }),
    {},
  );
}

export const createApiKeyAuthMiddleware =
  (dashboardApi: DashboardApi): RequestMiddleware =>
  async ({ request, params }) => {
    const apiKey = await dashboardApi.getApiKey(params.applicationId);
    const r = request.clone();

    r.headers.set("x-algolia-application-id", params.applicationId);
    r.headers.set("x-algolia-api-key", apiKey);

    return r;
  };

export async function registerOpenApiTools({
  server,
  dashboardApi,
  openApiSpec,
  toolFilter,
  requestMiddlewares,
}: OpenApiToolsOptions) {
  for (const [path, methods] of Object.entries(openApiSpec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!isToolAllowed(operation.operationId, toolFilter)) continue;

      server.tool(
        operation.operationId,
        operation.summary || operation.description || "",
        {
          ...buildParametersZodSchema(operation),
          ...buildUrlParameters(openApiSpec.servers),
        },
        // @ts-expect-error - the types are hard to satisfy when building tools dynamically. Just trust me bro.
        buildToolCallback({
          path,
          serverBaseUrl: openApiSpec.servers[0].url,
          method: method as Methods,
          parameters: operation.parameters,
          dashboardApi,
          requestMiddlewares,
        }),
      );
    }
  }
}

type ToolCallbackBuildOptions = {
  path: string;
  serverBaseUrl: string;
  method: Methods;
  parameters?: Parameter[];
  dashboardApi: DashboardApi;
  requestMiddlewares?: Array<RequestMiddleware>;
};

function buildToolCallback({
  path,
  serverBaseUrl,
  method,
  parameters = [],
  requestMiddlewares,
}: ToolCallbackBuildOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (params: Record<string, any>) => {
    const { requestBody } = params;

    serverBaseUrl = serverBaseUrl.replace(/{([^}]+)}/g, (_, key) => params[key]);
    const url = new URL(serverBaseUrl);
    url.pathname = path.replace(/{([^}]+)}/g, (_, key) => params[key]);

    for (const parameter of parameters) {
      if (parameter.in !== "query") continue;
      // TODO: throw error if param is required and not in callbackParams
      if (!(parameter.name in params)) continue;
      url.searchParams.set(parameter.name, params[parameter.name]);
    }

    if (method === "get" && requestBody) {
      throw new Error("requestBody is not supported for GET requests");
    }

    const body = requestBody
      ? // Claude likes to send me JSON already serialized as a string...
        isJsonString(requestBody)
        ? requestBody
        : JSON.stringify(requestBody)
      : undefined;

    let request = new Request(url.toString(), { method, body });

    if (requestMiddlewares?.length) {
      for (const middleware of requestMiddlewares) {
        request = await middleware({ request, params });
      }
    }

    const response = await fetch(request);

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  };
}

function isJsonString(json: unknown): json is string {
  if (typeof json !== "string") return false;

  try {
    JSON.parse(json);
    return true;
  } catch {
    // It wasn't valid JSON
  }

  return false;
}

function buildParametersZodSchema(operation: Operation) {
  const parametersSchema: Record<string, ZodType> = {};

  if (operation.parameters) {
    for (const parameter of operation.parameters) {
      parametersSchema[parameter.name] = jsonSchemaToZod(parameter.schema);
    }
  }

  const requestBody = operation.requestBody?.content["application/json"];
  if (requestBody) {
    let requestBodySchema = jsonSchemaToZod(requestBody.schema);

    if (operation.requestBody?.description && !requestBodySchema.description) {
      requestBodySchema = requestBodySchema.describe(operation.requestBody.description);
    }
    parametersSchema["requestBody"] = requestBodySchema;
  }

  return parametersSchema;
}
