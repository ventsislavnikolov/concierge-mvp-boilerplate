import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";
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

/** Same list for server-side consumers (Telegram bot) — no session. */
export const listItems = internalQuery({
  args: {},
  handler: async (ctx) =>
    await ctx.db.query("demoItems").order("desc").take(50),
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
    const id = await ctx.db.insert("demoItems", { text });
    // Group-posting example: the bot mirrors list changes to Telegram
    // (no-op unless the Telegram env is configured).
    await ctx.scheduler.runAfter(0, internal.telegram.notifyListChanged, {});
    return id;
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
    await ctx.scheduler.runAfter(0, internal.telegram.notifyListChanged, {});
  },
});
