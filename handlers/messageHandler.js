"use strict";

const TelegramContext = require("../core/context");
const getLegacyBot = require("../core/compat/legacyBot");

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
  }

  async handle(update) {
    const ctx = new TelegramContext(this.bot, update);
    const legacyBot = getLegacyBot(this.bot);

    if (
      ctx.from?.is_bot &&
      this.bot.config.security?.blockBots !== false
    ) {
      return;
    }

    await legacyBot.dispatch(update);

    if (update.message_reaction) {
      if (this.bot.config.features?.onReaction !== false) {
        await this.bot.eventHandler.dispatch("onReaction", ctx);
      }

      return;
    }

    if (ctx.message) {
      const uniqueCommands = new Set(this.bot.commands.values());

      for (const command of uniqueCommands) {
        if (typeof command.onChat !== "function") continue;

        try {
          await command.onChat({
            bot: legacyBot,
            msg: ctx.message
          });
        } catch (error) {
          console.error("[COMMAND onChat ERROR]", error);
        }
      }

      if (this.bot.config.features?.onAnyEvent !== false) {
        await this.bot.eventHandler.dispatch("onAnyEvent", ctx);
      }

      if (this.bot.config.features?.onChat !== false) {
        await this.bot.eventHandler.dispatch("onChat", ctx);
      }

      if (
        ctx.message.new_chat_members ||
        ctx.message.left_chat_member
      ) {
        if (this.bot.config.features?.onEvent !== false) {
          await this.bot.eventHandler.dispatch("onEvent", ctx);
        }
      }

      await this.bot.commandHandler.handle(ctx);
      return;
    }

    if (ctx.callbackQuery) {
      const uniqueCommands = new Set(this.bot.commands.values());
      const query = ctx.callbackQuery;

      if (this.bot.config.features?.callbacks !== false) {
        for (const command of uniqueCommands) {
          try {
            if (typeof command.handleCallback === "function") {
              await command.handleCallback(legacyBot, query);
            }

            if (typeof command.onCallbackQuery === "function") {
              await command.onCallbackQuery(legacyBot, query);
            }
          } catch (error) {
            console.error("[COMMAND CALLBACK ERROR]", error);
          }
        }

        await this.bot.eventHandler.dispatch("onCallback", ctx);
      }

      try {
        await ctx.answerCallback();
      } catch (error) {
        if (
          !/query is too old|query_id_invalid|already answered/i.test(
            error.message || ""
          )
        ) {
          console.error(
            "[CALLBACK ANSWER ERROR]",
            error.message
          );
        }
      }
    }
  }
}

module.exports = MessageHandler;
