import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Join the waitlist. Idempotent per email: re-joining returns the
 * existing lead so double submits never create duplicates.
 */
export const join = mutation({
  args: {
    email: v.string(),
    locale: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      return { alreadyJoined: true, leadId: existing._id };
    }
    const leadId = await ctx.db.insert("leads", args);
    return { alreadyJoined: false, leadId };
  },
});

/**
 * All leads, newest first. Consumed by the admin table (#14) — will be
 * auth-gated when Better Auth lands (#9).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").order("desc").collect();
    return leads;
  },
});
