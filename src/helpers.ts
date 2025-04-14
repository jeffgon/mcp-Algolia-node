import { z, type AnyZodObject, type ZodType } from "zod";

type JsonSchemaShared = {
  title?: string;
  description?: string;
};

type JsonSchemaArray = {
  type: "array";
  items: JsonSchema;
};

type JsonSchemaObject = {
  type: "object";
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
};

type JsonSchemaPrimitive = {
  type: "string" | "number" | "integer" | "boolean";
};

export type JsonSchema = JsonSchemaShared &
  (JsonSchemaArray | JsonSchemaObject | JsonSchemaPrimitive);

export function jsonSchemaToZod(jsonSchema: JsonSchema): ZodType {
  let zodSchema: ZodType;

  switch (jsonSchema.type) {
    case "string":
      zodSchema = z.string();
      break;
    case "integer":
      zodSchema = z.number().int();
      break;
    case "array":
      zodSchema = z.array(jsonSchemaToZod(jsonSchema.items));
      break;
    case "object": {
      const { properties, required, additionalProperties } = jsonSchema;

      let objectSchema: AnyZodObject = z.object(
        Object.fromEntries(
          Object.entries(properties ?? {}).map(([key, value]) => {
            let item = jsonSchemaToZod(value);
            if (!required?.includes(key)) {
              item = item.optional();
            }

            return [key, item];
          })
        )
      );

      if (!properties || additionalProperties) {
        objectSchema = objectSchema.passthrough();
      }

      zodSchema = objectSchema;
      break;
    }
    default:
      zodSchema = z.any();
      break;
  }

  if (jsonSchema.description) {
    zodSchema = zodSchema.describe(jsonSchema.description);
  } else if (jsonSchema.title) {
    zodSchema = zodSchema.describe(jsonSchema.title);
  }

  return zodSchema;
}
