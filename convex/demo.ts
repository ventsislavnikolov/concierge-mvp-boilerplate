import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * The copyable realtime pattern: schema → mutation → subscription → UI.
 * Convex queries ARE live subscriptions — every client with this query
 * mounted re-renders on any change, no extra wiring. Rename demoItems
 * to your real list (match roster, todos…) and keep the shape.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.query("demoItems").order("desc").take(50);
  },
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const text = args.text.trim();
    if (!text) {
      return null;
    }
    return await ctx.db.insert("demoItems", { text });
  },
});

export const remove = mutation({
  args: { id: v.id("demoItems") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
