import { z } from "zod";

export const zodUndefinedModel = z.preprocess(
  (val) => (val !== null && typeof val === "object" && Object.keys(val).length === 0 ? undefined : val),
  z.undefined()
).describe("undefined");

export { z };

