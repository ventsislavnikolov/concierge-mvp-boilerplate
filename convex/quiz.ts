import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth"; // module:admin

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

// module:admin
/**
 * Answer counts per (question, option id) for the admin dashboard.
 * Answers store option ids, so counts aggregate across locales.
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const answers = await ctx.db.query("quizAnswers").collect();
    const counts: Record<string, Record<string, number>> = {};
    for (const entry of answers) {
      const question = counts[entry.questionId] ?? {};
      question[entry.answer] = (question[entry.answer] ?? 0) + 1;
      counts[entry.questionId] = question;
    }
    return { counts, total: answers.length };
  },
});
// end-module:admin
