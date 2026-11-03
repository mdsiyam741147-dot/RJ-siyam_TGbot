"use strict";

const listeners = new WeakMap();

const methodNames = [
  "sendMessage", "sendPhoto", "sendVideo", "sendDocument",
  "sendAudio", "sendVoice", "sendAnimation", "sendSticker",
  "sendLocation", "sendVenue", "sendContact", "sendChatAction",
  "forwardMessage", "copyMessage", "editMessageText",
  "editMessageCaption", "editMessageReplyMarkup", "deleteMessage",
  "answerCallbackQuery", "getChat", "getChatMember",
  "getChatAdministrators", "getChatMemberCount",
  "getUserProfilePhotos", "getFile", "banChatMember",
  "unbanChatMember", "restrictChatMember", "promoteChatMember",
  "pinChatMessage", "unpinChatMessage", "leaveChat"
];

const argumentKeys = {
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
  sendChatAction: ["chat_id", "action"],
  forwardMessage: ["chat_id", "from_chat_id", "message_id", "options"],
  copyMessage: ["chat_id", "from_chat_id", "message_id", "options"],
  editMessageText: ["text", "options"],
  editMessageCaption: ["options"],
  editMessageReplyMarkup: ["options"],
  deleteMessage: ["chat_id", "message_id"],
  answerCallbackQuery: ["callback_query_id", "options"],
  getChat: ["chat_id"],
  getChatMember: ["chat_id", "user_id"],
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

function makeParams(method, args) {
  if (args.length === 1 && args[0] && typeof args[0] === "object") {
    return { ...args[0] };
  }

  const keys = argumentKeys[method] || [];
  const params = {};

  keys.forEach((key, index) => {
    const value = args[index];
    if (value === undefined) return;

    if (key === "options" && value && typeof value === "object") {
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
  listeners.set(bot, events);

  const facade = {
    api: bot.api,
    config: bot.config,
    commands: bot.commands,
    permissions: bot.permissions,

    on(eventName, callback) {
      if (typeof callback !== "function") return facade;

      if (!events.has(eventName)) events.set(eventName, []);
      events.get(eventName).push(callback);

      return facade;
    },

    once(eventName, callback) {
      const wrapper = (...args) => {
        facade.off(eventName, wrapper);
        return callback(...args);
      };

      return facade.on(eventName, wrapper);
    },

    off(eventName, callback) {
      const list = events.get(eventName) || [];
      events.set(eventName, list.filter(fn => fn !== callback));
      return facade;
    },

    removeListener(eventName, callback) {
      return facade.off(eventName, callback);
    },

    removeAllListeners(eventName) {
      if (eventName) events.delete(eventName);
      else events.clear();
      return facade;
    },

    onText(regex, callback) {
      if (!events.has("__text")) events.set("__text", []);
      events.get("__text").push({ regex, callback });
      return facade;
    },

    async getMe() {
      return bot.api.getMe();
    },

    async getUserRole(userId, chatId) {
      const ownerIds = bot.config.owner?.ids || [];
      const adminIds = bot.config.admins || [];
      const modIds = bot.config.modIDs || bot.config.modIds || [];

      if (ownerIds.map(String).includes(String(userId))) return 3;
      if (adminIds.map(String).includes(String(userId))) return 2;
      if (modIds.map(String).includes(String(userId))) return 1;

      if (chatId) {
        try {
          const member = await bot.api.getChatMember(chatId, userId);
          if (["creator", "administrator"].includes(member.status)) return 1;
        } catch (_) {}
      }

      return 0;
    },

    async dispatch(update) {
      const names = Object.keys(update || {});

      for (const name of names) {
        const payload = update[name];
        const callbacks = events.get(name) || [];

        for (const callback of callbacks) {
          try {
            await callback(payload);
          } catch (error) {
            console.error(`[LEGACY LISTENER ERROR: ${name}]`, error);
          }
        }

        if (name === "message" || name === "edited_message") {
          const text = payload?.text || payload?.caption || "";

          for (const item of events.get("__text") || []) {
            try {
              const match = text.match(item.regex);
              if (match) await item.callback(payload, match);
            } catch (error) {
              console.error("[LEGACY onText ERROR]", error);
            }
          }
        }
      }
    }
  };

  for (const method of methodNames) {
    facade[method] = (...args) => {
      const params = makeParams(method, args);

      if (method === "answerCallbackQuery" && typeof args[1] === "string") {
        params.text = args[1];
      }

      if (method === "getChatMemberCount") {
        return bot.api.request("getChatMemberCount", params);
      }

      return bot.api.request(method, params);
    };
  }

  facade.kickChatMember = (...args) => facade.banChatMember(...args);

  bot._legacyBot = new Proxy(facade, {
    get(target, property) {
      if (property in target) return target[property];

      const value = bot[property];
      return typeof value === "function" ? value.bind(bot) : value;
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
