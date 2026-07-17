import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Store one quiz answer, linked to the lead. Idempotent per
 * (lead, question): re-answering replaces the previous answer.
 */
export const answer = mutation({
  args: {
    answer: v.string(),
    leadId: v.id("leads"),
    questionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("quizAnswers")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    const previous = existing.find((a) => a.questionId === args.questionId);
    if (previous) {
      await ctx.db.patch(previous._id, { answer: args.answer });
      return previous._id;
    }
    return await ctx.db.insert("quizAnswers", args);
  },
});
