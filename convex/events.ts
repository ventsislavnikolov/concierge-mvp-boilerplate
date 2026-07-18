import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * First-party funnel events (joins are counted from the leads table).
 * Kept next to PostHog on purpose: the admin funnel stays readable
 * without any analytics key or external API.
 */
export const track = mutation({
  args: {
    name: v.union(v.literal("visit"), v.literal("form_start")),
    payload: v.optional(v.record(v.string(), v.string())),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("events", args);
  },
});

/** Funnel counts: visits → form starts → joins. Signed-in users only. */
export const funnel = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const visits = await ctx.db
      .query("events")
      .withIndex("by_name", (q) => q.eq("name", "visit"))
      .collect();
    const formStarts = await ctx.db
      .query("events")
      .withIndex("by_name", (q) => q.eq("name", "form_start"))
      .collect();
    const leads = await ctx.db.query("leads").collect();
    return {
      formStarts: formStarts.length,
      joins: leads.length,
      visits: visits.length,
    };
  },
});
