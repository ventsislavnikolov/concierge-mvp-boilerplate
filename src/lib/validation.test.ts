import { describe, expect, it } from "vitest";
import { leadSchema } from "./validation";

describe("leadSchema", () => {
  it("accepts a valid email with no phone", () => {
    const result = leadSchema.safeParse({ email: "a@b.co" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = leadSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("treats an empty phone string as undefined", () => {
    const result = leadSchema.parse({ email: "a@b.co", phone: "" });
    expect(result.phone).toBeUndefined();
  });

  it("keeps a valid phone number", () => {
    const result = leadSchema.parse({ email: "a@b.co", phone: "+359 88 123" });
    expect(result.phone).toBe("+359 88 123");
  });

  it("rejects a phone with letters", () => {
    const result = leadSchema.safeParse({ email: "a@b.co", phone: "call me" });
    expect(result.success).toBe(false);
  });
});
