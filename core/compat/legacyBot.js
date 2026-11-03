"use strict";

function parseReaction(value) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
}

const positionalKeys = {
  sendMessage: ["chat_id", "text", "options"],
  sendPhoto: ["chat_id", "photo", "options"],
  sendVideo: ["chat_id", "video", "options"],
  sendDocument: ["chat_id", "document", "options"],
  sendAudio: ["chat_id", "audio", "options"],
  sendVoice: ["chat_id", "voice", "options"],
  sendAnimation: ["chat_id", "animation", "options"],
  sendSticker: ["chat_id", "sticker", "options"],
  sendLocation: ["chat_id", "latitude", "longitude", "options"],
  sendVenue: ["chat_id", "latitude", "longitude", "title", "address", "options"],
  sendContact: ["chat_id", "phone_number", "first_name", "options"],
  sendChatAction: ["chat_id", "action", "options"],
  forwardMessage: ["chat_id", "from_chat_id", "message_id", "options"],
  copyMessage: ["chat_id", "from_chat_id", "message_id", "options"],
  sendPoll: ["chat_id", "question", "options"],
  sendDice: ["chat_id", "options"],
  editMessageText: ["text", "options"],
  editMessageCaption: ["caption", "options"],
  deleteMessage: ["chat_id", "message_id"],
  answerCallbackQuery: ["callback_query_id", "options"],
  getChat: ["chat_id"],
  getChatMember: ["chat_id", "user_id"],
  getChatAdministrators: ["chat_id"],
  getChatMemberCount: ["chat_id"],
  getUserProfilePhotos: ["user_id", "options"],
  getFile: ["file_id"],
  banChatMember: ["chat_id", "user_id", "options"],
  unbanChatMember: ["chat_id", "user_id", "options"],
  restrictChatMember: ["chat_id", "user_id", "permissions", "options"],
  promoteChatMember: ["chat_id", "user_id", "options"],
  pinChatMessage: ["chat_id", "message_id", "options"],
  unpinChatMessage: ["chat_id", "message_id"],
  leaveChat: ["chat_id"]
};

const methods = [
  ...Object.keys(positionalKeys),
  "editMessageReplyMarkup",
  "setMessageReaction",
  "sendMediaGroup",
  "sendGame",
  "answerInlineQuery",
  "editMessageLiveLocation",
  "stopMessageLiveLocation",
  "sendInvoice",
  "sendVideoNote"
];

function buildParams(method, args) {
  if (
    args.length === 1 &&
    args[0] &&
    typeof args[0] === "object" &&
    !Buffer.isBuffer(args[0])
  ) {
    const object = { ...args[0] };

    if (method === "setMessageReaction") {
      object.reaction = parseReaction(object.reaction);
    }

    return object;
  }

  if (method === "setMessageReaction") {
    return {
      chat_id: args[0],
      message_id: args[1],
      ...(args[2] || {}),
      ...(args[2]?.reaction !== undefined
        ? { reaction: parseReaction(args[2].reaction) }
        : {})
    };
  }

  if (method === "editMessageReplyMarkup") {
    const [replyMarkup, options = {}] = args;

    return {
      ...options,
      reply_markup: replyMarkup
    };
  }

  if (method === "sendMediaGroup") {
    return {
      chat_id: args[0],
      media: args[1],
      ...(args[2] || {})
    };
  }

  const keys = positionalKeys[method] || [];
  const params = {};

  keys.forEach((key, index) => {
    const value = args[index];

    if (value === undefined || value === null) return;

    if (
      key === "options" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      Object.assign(params, value);
    } else {
      params[key] = value;
    }
  });

  return params;
}

function getLegacyBot(bot) {
  if (bot._legacyBot) return bot._legacyBot;

  const events = new Map();

  const facade = {
    api: bot.api,
    config: bot.config,
    commands: bot.commands,
    permissions: bot.permissions,

    on(eventName, callback) {
      if (typeof callback !== "function") return facade;

      if (!events.has(eventName)) {
        events.set(eventName, []);
      }

      events.get(eventName).push(callback);
      return facade;
    },

    once(eventName, callback) {
      if (typeof callback !== "function") return facade;

      const wrapped = (...args) => {
        facade.off(eventName, wrapped);
        return callback(...args);
      };

      return facade.on(eventName, wrapped);
    },

    off(eventName, callback) {
      events.set(
        eventName,
        (events.get(eventName) || []).filter(fn => fn !== callback)
      );

      return facade;
    },

    removeListener(eventName, callback) {
      return facade.off(eventName, callback);
    },

    removeAllListeners(eventName) {
      if (eventName) {
        events.delete(eventName);
      } else {
        events.clear();
      }

      return facade;
    },

    onText(regex, callback) {
      if (!(regex instanceof RegExp) || typeof callback !== "function") {
        throw new TypeError("onText requires a RegExp and a callback");
      }

      if (!events.has("__text")) {
        events.set("__text", []);
      }

      events.get("__text").push({ regex, callback });
      return facade;
    },

    async getMe() {
      return bot.api.getMe();
    },

    async getFileLink(fileId) {
      return bot.api.getFileLink(fileId);
    },

    async getUserRole(userId, chatId) {
      const owners = bot.config.owner?.ids || [];
      const admins = bot.config.admins || [];
      const mods = bot.config.modIDs || bot.config.modIds || [];

      if (owners.map(String).includes(String(userId))) return 3;
      if (admins.map(String).includes(String(userId))) return 2;
      if (mods.map(String).includes(String(userId))) return 1;

      if (chatId) {
        try {
          const member = await bot.api.getChatMember(chatId, userId);

          if (["creator", "administrator"].includes(member.status)) {
            return 1;
          }
        } catch (_) {}
      }

      return 0;
    },

    async dispatch(update) {
      for (const [eventName, payload] of Object.entries(update || {})) {
        const callbacks = [...(events.get(eventName) || [])];

        for (const callback of callbacks) {
          try {
            await callback(payload);
          } catch (error) {
            console.error(
              `[LEGACY LISTENER ERROR: ${eventName}]`,
              error
            );
          }
        }

        if (
          [
            "message",
            "edited_message",
            "channel_post",
            "edited_channel_post"
          ].includes(eventName)
        ) {
          const text = payload?.text || payload?.caption || "";

          for (const item of events.get("__text") || []) {
            try {
              item.regex.lastIndex = 0;
              const match = item.regex.exec(text);

              if (match) {
                await item.callback(payload, match);
              }
            } catch (error) {
              console.error("[LEGACY onText ERROR]", error);
            }
          }
        }
      }
    }
  };

  for (const method of new Set(methods)) {
    facade[method] = (...args) =>
      bot.api.request(method, buildParams(method, args));
  }

  // Compatibility aliases
  facade.kickChatMember = (...args) =>
    facade.banChatMember(...args);

  facade.getChatMembersCount = (...args) =>
    facade.getChatMemberCount(...args);

  bot._legacyBot = new Proxy(facade, {
    get(target, property) {
      if (property in target) return target[property];

      const value = bot[property];

      return typeof value === "function"
        ? value.bind(bot)
        : value;
    },

    set(target, property, value) {
      if (property in target) {
        target[property] = value;
      } else {
        bot[property] = value;
      }

      return true;
    }
  });

  return bot._legacyBot;
}

module.exports = getLegacyBot;
