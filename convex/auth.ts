import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins/magic-link";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth runs inside Convex: the instance is rebuilt per request
 * with the component adapter. Google is wired only when its env vars
 * are set on the deployment, so the module no-ops without them.
 */
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined;
  return betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await requireActionCtx(ctx).runAction(internal.emails.sendMagicLink, {
            email,
            url,
          });
        },
      }),
      convex({ authConfig }),
    ],
    socialProviders,
  });
};

/** Current auth user, or null when signed out. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => await authComponent.safeGetAuthUser(ctx),
});

/** Which optional sign-in methods are configured on this deployment. */
export const providers = query({
  args: {},
  handler: () => ({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
  }),
});
