"use node";

import { render } from "@react-email/render";
import { v } from "convex/values";
import { Resend } from "resend";
import { WelcomeEmail } from "../emails/welcome";
import { internalAction } from "./_generated/server";

/**
 * Sends the welcome email. Graceful no-op unless the Convex deployment
 * has RESEND_API_KEY set (`npx convex env set RESEND_API_KEY re_…`).
 * EMAIL_FROM defaults to Resend's shared onboarding sender.
 */
export const sendWelcome = internalAction({
  args: {
    brandName: v.string(),
    email: v.string(),
    tagline: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { reason: "RESEND_API_KEY not set", sent: false as const };
    }
    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const resend = new Resend(apiKey);
    const html = await render(
      WelcomeEmail({ brandName: args.brandName, tagline: args.tagline })
    );
    const { error } = await resend.emails.send({
      from,
      html,
      subject: `Записахме те — ${args.brandName}`,
      to: args.email,
    });
    if (error) {
      return { reason: error.message, sent: false as const };
    }
    return { sent: true as const };
  },
});
