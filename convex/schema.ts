import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    payload: v.optional(v.record(v.string(), v.string())),
    sessionId: v.optional(v.string()),
  }).index("by_name", ["name"]),
  leads: defineTable({
    email: v.string(),
    locale: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
  }).index("by_email", ["email"]),

  quizAnswers: defineTable({
    answer: v.string(),
    leadId: v.id("leads"),
    questionId: v.string(),
  }).index("by_lead", ["leadId"]),
});
