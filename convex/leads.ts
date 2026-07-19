import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth"; // module:admin

/**
 * Join the waitlist. Idempotent per email: re-joining returns the
 * existing lead so double submits never create duplicates. New leads
 * get the welcome email (no-op unless RESEND_API_KEY is set).
 */
export const join = mutation({
  args: {
    brandName: v.string(),
    email: v.string(),
    locale: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    tagline: v.string(),
  },
  handler: async (ctx, args) => {
    const { brandName, tagline, ...lead } = args;
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", lead.email))
      .unique();
    if (existing) {
      return { alreadyJoined: true, leadId: existing._id };
    }
    const leadId = await ctx.db.insert("leads", lead);
    await ctx.scheduler.runAfter(0, internal.emails.sendWelcome, {
      brandName,
      email: lead.email,
      tagline,
    });
    return { alreadyJoined: false, leadId };
  },
});

// module:admin
/** All leads, newest first. Signed-in users only (admin table, #14). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const leads = await ctx.db.query("leads").order("desc").collect();
    return leads;
  },
});
// end-module:admin
