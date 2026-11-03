"use strict";

const getLegacyBot = require("../core/compat/legacyBot");

class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.cooldowns = new Map();
  }

  async handle(ctx) {
    if (!ctx.message || !ctx.text || !ctx.userId) return false;

    if (this.bot.config.features?.commands === false) return false;

    const prefix = this.bot.config.prefix || ",";
    const text = ctx.text.trim();

    const isPrefixCommand = text.startsWith(prefix);
    const isSlashCommand = text.startsWith("/");

    if (!isPrefixCommand && !isSlashCommand) return false;

    const body = text.slice(isSlashCommand ? 1 : prefix.length).trim();
    if (!body) return false;

    const parts = body.split(/\s+/);
    const commandName = parts.shift().toLowerCase().split("@")[0];
    const args = parts;

    const command = this.bot.commands.get(commandName);
    if (!command) return false;

    if (!(await this.bot.permissions.canUse(ctx))) return true;

    const role = await this.bot.permissions.getRole(ctx);
    const adminOnly = this.bot.config.adminOnly || {};
    const requiredRole = command.config?.role;

    if (
      adminOnly.enabled &&
      !(adminOnly.ignoreCommands || []).includes(commandName) &&
      role < 2
    ) {
      await ctx.reply("তুই আবাল 😜 𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 𝐒𝐈𝐘𝐀𝐌।।");
      return true;
    }

    const roleRequirements = {
      owner: 3,
      admin: 2,
      groupAdmin: 1
    };

    let minimumRole = roleRequirements[requiredRole];

    if (typeof requiredRole === "number") {
      minimumRole = requiredRole;
    }

    if (
      minimumRole !== undefined &&
      role < minimumRole
    ) {
      await ctx.reply("তুই আবাল 😜 𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 𝐒𝐈𝐘𝐀𝐌।");
      return true;
    }

    const cooldownSeconds = Number(
      command.config?.cooldown ??
      this.bot.config.cooldown?.defaultSeconds ??
      1
    );

    const cooldownEnabled =
      this.bot.config.cooldown?.enabled !== false;

    const cooldownKey = `${ctx.userId}:${commandName}`;
    const now = Date.now();
    const lastUsed = this.cooldowns.get(cooldownKey) || 0;
    const remaining = cooldownSeconds * 1000 - (now - lastUsed);

    if (cooldownEnabled && remaining > 0) {
      await ctx.reply(
        `অপেক্ষা করো। ${Math.ceil(remaining / 1000)} সেকেন্ড পর আবার চেষ্টা করো।`
      );
      return true;
    }

    this.cooldowns.set(cooldownKey, now);

    const legacyBot = getLegacyBot(this.bot);

    try {
      if (typeof command.execute === "function") {
        await command.execute(legacyBot, ctx.message, args);
      } else {
        await command.onStart({
          ctx,
          bot: legacyBot,
          args,
          commandName,
          msg: ctx.message
        });
      }
    } catch (error) {
      console.error(`[COMMAND ERROR] ${commandName}:`, error);
      await ctx.reply("কমান্ড চালাতে সমস্যা হয়েছে। সিয়াম কই তুমি 😭");
    }

    return true;
  }
}

module.exports = CommandHandler;
