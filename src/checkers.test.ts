import { z } from "zod";
import { isDocument, isLocalValue } from "./checkers";

// The zod schemas the hand-written guards replaced, kept here as the reference they must
// agree with on every input.
const documentSchema = z.object({
  documentId: z.string(),
  projectId: z.string(),
  rootContainer: z.string().optional(),
  preview: z.object({}).optional(),
  config: z.optional(z.object({})),
});

const localValueSchema = z.object({
  value: z.any(),
  widgetId: z.string(),
});

class Plain {
  widgetId = "w";
  documentId = "d";
  projectId = "p";
}

const nonObjects: Array<[string, unknown]> = [
  ["undefined", undefined],
  ["null", null],
  ["string", "x"],
  ["number", 1],
  ["boolean", true],
  ["function", () => ({ widgetId: "w" })],
  ["array", [{ widgetId: "w" }]],
  ["date", new Date(0)],
  ["map", new Map([["widgetId", "w"]])],
  ["set", new Set(["w"])],
  ["promise", Promise.resolve({ widgetId: "w" })],
  ["thenable", { then: () => undefined, catch: () => undefined, widgetId: "w", documentId: "d", projectId: "p" }],
];

const documents: Array<[string, unknown]> = [
  ...nonObjects,
  ["minimal", { documentId: "d", projectId: "p" }],
  ["all fields", { documentId: "d", projectId: "p", rootContainer: "r", preview: {}, config: { a: 1 } }],
  ["extra keys", { documentId: "d", projectId: "p", other: 1 }],
  ["optional keys undefined", { documentId: "d", projectId: "p", rootContainer: undefined, preview: undefined, config: undefined }],
  ["missing projectId", { documentId: "d" }],
  ["numeric documentId", { documentId: 1, projectId: "p" }],
  ["String object id", { documentId: new String("d"), projectId: "p" }],
  ["rootContainer number", { documentId: "d", projectId: "p", rootContainer: 1 }],
  ["rootContainer null", { documentId: "d", projectId: "p", rootContainer: null }],
  ["preview null", { documentId: "d", projectId: "p", preview: null }],
  ["preview array", { documentId: "d", projectId: "p", preview: [] }],
  ["preview string", { documentId: "d", projectId: "p", preview: "x" }],
  ["config date", { documentId: "d", projectId: "p", config: new Date(0) }],
  ["config map", { documentId: "d", projectId: "p", config: new Map() }],
  ["config class instance", { documentId: "d", projectId: "p", config: new Plain() }],
  ["class instance", new Plain()],
  ["null prototype", Object.assign(Object.create(null), { documentId: "d", projectId: "p" })],
];

const localValues: Array<[string, unknown]> = [
  ...nonObjects,
  ["value and widgetId", { value: 1, widgetId: "w" }],
  ["missing value", { widgetId: "w" }],
  ["undefined value", { value: undefined, widgetId: "w" }],
  ["null value", { value: null, widgetId: "w" }],
  ["object value", { value: { $res: true, xl: 1 }, widgetId: "w" }],
  ["missing widgetId", { value: 1 }],
  ["numeric widgetId", { value: 1, widgetId: 1 }],
  ["null widgetId", { value: 1, widgetId: null }],
  ["String object widgetId", { value: 1, widgetId: new String("w") }],
  ["extra keys", { value: 1, widgetId: "w", other: true }],
  ["class instance", new Plain()],
  ["null prototype", Object.assign(Object.create(null), { widgetId: "w" })],
];

describe("isDocument", () => {
  test.each(documents)("agrees with the zod schema: %s", (_name, input) => {
    expect(isDocument(input)).toBe(documentSchema.safeParse(input).success);
  });
});

describe("isLocalValue", () => {
  test.each(localValues)("agrees with the zod schema: %s", (_name, input) => {
    expect(isLocalValue(input)).toBe(localValueSchema.safeParse(input).success);
  });
});
