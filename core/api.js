"use strict";

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const UPLOAD_FIELDS = new Set([
  "photo", "video", "document", "audio", "voice", "animation",
  "sticker", "thumbnail", "cover", "certificate"
]);

class TelegramAPI {
  constructor(token) {
    if (!token) throw new Error("Telegram bot token is missing");
    this.token = token;
    this.baseURL = `https://api.telegram.org/bot${token}`;
    this.fileBaseURL = `https://api.telegram.org/file/bot${token}`;
  }

  async request(method, params = {}, signal = null) {
    const payload = { ...params };
    const openedStreams = [];

    for (const [key, value] of Object.entries(payload)) {
      if (
        UPLOAD_FIELDS.has(key) &&
        typeof value === "string" &&
        fs.existsSync(value) &&
        fs.statSync(value).isFile()
      ) {
        const stream = fs.createReadStream(value);
        payload[key] = stream;
        openedStreams.push(stream);
      }
    }

    const hasUpload = Object.values(payload).some(value =>
      Buffer.isBuffer(value) || (value && typeof value.pipe === "function")
    );

    try {
      let response;

      if (hasUpload) {
        const form = new FormData();

        for (const [key, value] of Object.entries(payload)) {
          if (value === undefined || value === null) continue;

          if (Buffer.isBuffer(value)) {
            form.append(key, value, { filename: `${key}.bin` });
          } else if (value && typeof value.pipe === "function") {
            const filename = value.path
              ? path.basename(String(value.path))
              : `${key}.bin`;
            form.append(key, value, { filename });
          } else if (typeof value === "object") {
            form.append(key, JSON.stringify(value));
          } else {
            form.append(key, String(value));
          }
        }

        response = await axios.post(`${this.baseURL}/${method}`, form, {
          headers: form.getHeaders(),
          timeout: 70000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          signal
        });
      } else {
        response = await axios.post(`${this.baseURL}/${method}`, payload, {
          timeout: 70000,
          signal
        });
      }

      if (!response.data?.ok) {
        throw new Error(
          `Telegram API Error: ${response.data?.description || "Unknown error"}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (error.response?.data?.description) {
        throw new Error(`Telegram API Error: ${error.response.data.description}`);
      }
      throw error;
    } finally {
      for (const stream of openedStreams) {
        if (!stream.destroyed) stream.destroy();
      }
    }
  }

  getMe() {
    return this.request("getMe");
  }

  getFile(fileId) {
    return this.request("getFile", { file_id: fileId });
  }

  async getFileLink(fileId) {
    const file = await this.getFile(fileId);
    if (!file?.file_path) {
      throw new Error("Telegram did not return file_path");
    }
    return `${this.fileBaseURL}/${file.file_path}`;
  }

  setMessageReaction(chatId, messageId, options = {}) {
    const params = typeof chatId === "object"
      ? { ...chatId }
      : { chat_id: chatId, message_id: messageId, ...options };

    if (typeof params.reaction === "string") {
      try {
        params.reaction = JSON.parse(params.reaction);
      } catch (_) {}
    }

    return this.request("setMessageReaction", params);
  }

  getUserProfilePhotos(userId, options = {}) {
    return this.request("getUserProfilePhotos", {
      user_id: userId,
      ...options
    });
  }

  deleteWebhook(dropPendingUpdates = false) {
    return this.request("deleteWebhook", {
      drop_pending_updates: dropPendingUpdates
    });
  }

  getUpdates(offset, timeout, signal) {
    return this.request("getUpdates", {
      offset,
      timeout,
      allowed_updates: [
        "message",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "business_connection",
        "business_message",
        "edited_business_message",
        "deleted_business_messages",
        "message_reaction",
        "message_reaction_count",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_member",
        "chat_join_request",
        "chat_boost",
        "removed_chat_boost"
      ]
    }, signal);
  }

  sendMessage(chatId, text, options = {}) {
    return this.request("sendMessage", {
      chat_id: chatId,
      text,
      ...options
    });
  }

  answerCallbackQuery(callbackQueryId, text = "", options = {}) {
    if (text && typeof text === "object") {
      options = text;
      text = options.text || "";
    }

    return this.request("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...options,
      ...(text ? { text } : {})
    });
  }

  getChatMember(chatId, userId) {
    return this.request("getChatMember", {
      chat_id: chatId,
      user_id: userId
    });
  }

  getChat(chatId) {
    return this.request("getChat", { chat_id: chatId });
  }
}

module.exports = TelegramAPI;
