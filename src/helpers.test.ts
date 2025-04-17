import { it, describe, expect } from "vitest";
import { expandAllRefs, type JsonSchema, jsonSchemaToZod } from "./helpers.ts";

describe("expandAllRefs", () => {
  it("should expand ref values", () => {
    const result = expandAllRefs({
      foo: {
        $ref: "#/definitions/bar",
      },
      definitions: {
        bar: {
          hakuna: "matata",
        },
      },
    });

    expect(result).toEqual({
      foo: {
        hakuna: "matata",
      },
      definitions: {
        bar: {
          hakuna: "matata",
        },
      },
    });
  });

  it("handles recursive references", () => {
    const result = expandAllRefs({
      bar: {
        foo: {
          $ref: "#/bar",
        },
      },
    });
    // @ts-expect-error - this is a self reference
    expect(result.bar.foo).toEqual(result.bar.foo.foo);
  });
});

describe("jsonSchemaToZod", () => {
  it("should generate a zod schema from a JSON schema", () => {
    const jsonSchema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
      required: ["name"],
    };

    const zodSchema = jsonSchemaToZod(jsonSchema);

    // Expected object
    expect(
      zodSchema.parse({
        name: "John Doe",
        age: 30,
      }),
    ).toEqual({
      name: "John Doe",
      age: 30,
    });

    // Extra properties are dropped
    const parsed = zodSchema.parse({
      name: "John Doe",
      age: 30,
      simba: "nala",
    });
    expect(parsed.simba).toBeUndefined();

    // Missing required property
    expect(() => {
      zodSchema.parse({
        age: 30,
      });
    }).toThrowError();
  });

  it('handles "oneOf" correctly', () => {
    const jsonSchema: JsonSchema = {
      oneOf: [
        {
          type: "string",
        },
        {
          type: "object",
          properties: {
            age: { type: "integer" },
          },
        },
      ],
    };

    const zodSchema = jsonSchemaToZod(jsonSchema);

    expect(zodSchema.parse("Rafiki")).toEqual("Rafiki");
    expect(zodSchema.parse({ age: 35 })).toEqual({ age: 35 });
  });
});
