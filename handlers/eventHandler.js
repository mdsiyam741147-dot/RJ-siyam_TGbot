"use strict";

class EventHandler {
  constructor(bot) {
    this.bot = bot;
    this.events = [];
  }

  register(event) {
    this.events.push(event);
  }

  async dispatch(method, ctx) {
    if (this.bot.config.features?.events === false) return;

    for (const event of this.events) {
      if (typeof event[method] !== "function") continue;

      try {
        if (
          method === "onChat" ||
          method === "onAnyEvent" ||
          method === "onReaction"
        ) {
          await event[method](ctx, this.bot);
        } else {
          await event[method]({
            ctx,
            bot: this.bot,
            api: this.bot.api,
            reply: (text, options) => ctx.reply(text, options)
          });
        }
      } catch (error) {
        console.error(
          `[EVENT ERROR] ${event.config?.name || "Unknown"}:`,
          error.stack || error
        );
      }
    }
  }
}

module.exports = EventHandler;
