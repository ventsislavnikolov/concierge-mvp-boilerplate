import { Api, Bot, webhookCallback } from "grammy";
import { internal } from "./_generated/api";
import { httpAction, internalAction } from "./_generated/server";

/**
 * Telegram bot module (grammY). Fully dormant without env; activate on
 * the CONVEX deployment:
 *
 *   npx convex env set TELEGRAM_BOT_TOKEN <from @BotFather>
 *   npx convex env set TELEGRAM_WEBHOOK_SECRET <random string>
 *   npx convex env set TELEGRAM_CHAT_ID <group id>   (for notifications)
 *
 * Then point Telegram at the Convex-hosted webhook:
 *
 *   https://api.telegram.org/bot<TOKEN>/setWebhook
 *     ?url=https://<deployment>.convex.site/telegram/webhook
 *     &secret_token=<TELEGRAM_WEBHOOK_SECRET>
 *
 * Get the group chat id by adding the bot to the group and calling
 * getUpdates, or via @RawDataBot.
 */

/** Incoming updates: /start + one example command reading Convex data. */
export const webhook = httpAction(async (ctx, request) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response("Telegram is not configured", { status: 503 });
  }
  const bot = new Bot(token);
  bot.command("start", (c) =>
    c.reply("Здрасти! Аз съм ботът на отбора. Пробвай /list.")
  );
  bot.command("list", async (c) => {
    const items = await ctx.runQuery(internal.demo.listItems, {});
    await c.reply(formatList(items.map((item) => item.text)));
  });
  const handle = webhookCallback(bot, "std/http", {
    secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
  });
  try {
    return await handle(request);
  } catch {
    // Telegram retries non-2xx aggressively; a failed handler (e.g. bad
    // token) should not cause an endless retry storm.
    return new Response("ok");
  }
});

/**
 * The documented "post the updated list to the group when data changes"
 * function — scheduled from demo.add / demo.remove. Sends a fresh
 * message per change; for a pinned-style single message, store the
 * message_id in a table and switch sendMessage → editMessageText.
 */
export const notifyListChanged = internalAction({
  args: {},
  handler: async (ctx) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!(token && chatId)) {
      return { reason: "Telegram env not set", sent: false as const };
    }
    const items = await ctx.runQuery(internal.demo.listItems, {});
    try {
      await new Api(token).sendMessage(
        chatId,
        formatList(items.map((item) => item.text))
      );
      return { sent: true as const };
    } catch (error) {
      return {
        reason: error instanceof Error ? error.message : "send failed",
        sent: false as const,
      };
    }
  },
});

function formatList(texts: string[]): string {
  if (texts.length === 0) {
    return "📋 Списъкът е празен.";
  }
  const lines = texts.map((text, index) => `${index + 1}. ${text}`);
  return `📋 Списък (${texts.length}):\n${lines.join("\n")}`;
}
