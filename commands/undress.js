const axios = require("axios");

const MIDDLEWARE_URL = "https://xrahat-dev-undress.vercel.app/undress";
const AUTHOR_LOCK = "🔰𝐗ʀᴀʜᴀᴛ-ᴅᴇᴠ🔰";

module.exports = {
  config: {
    name: "re",
    version: "1.0",
    role: 2,
    author: AUTHOR_LOCK,
    shortDescription: "AI image edit using undress",
    longDescription: "Reply to an image with /undress to edit it using AI",
    category: "AI",
    guide: "undress"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const replyMessage = msg.reply_to_message;

    if (!replyMessage) {
      return bot.sendMessage(chatId, "❌ Please reply to an image with /undress", { reply_to_message_id: messageId });
    }

    let imageUrl = null;
    if (replyMessage.photo && replyMessage.photo.length > 0) {
      const photo = replyMessage.photo[replyMessage.photo.length - 1];
      const fileLink = await bot.getFileLink(photo.file_id);
      imageUrl = fileLink;
    } else if (replyMessage.document && replyMessage.document.mime_type && replyMessage.document.mime_type.startsWith("image/")) {
      const fileLink = await bot.getFileLink(replyMessage.document.file_id);
      imageUrl = fileLink;
    }

    if (!imageUrl) {
      return bot.sendMessage(chatId, "❌ No image found in the replied message.", { reply_to_message_id: messageId });
    }

    const waitMsg = await bot.sendMessage(chatId, "💦Please wait....", { reply_to_message_id: messageId });

    try {
      const credit = AUTHOR_LOCK;
      const response = await axios.post(
        MIDDLEWARE_URL,
        { imageUrl, credit },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 90000,
        }
      );

      const data = response.data;

      if (!data.success || !data.resultUrl) {
        throw new Error(data.error || "API Error");
      }

      const { resultUrl, captionTemplate } = data;

      try {
        await bot.deleteMessage(chatId, waitMsg.message_id);
      } catch (e) {}

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/siyam_nu_bot?startgroup=true" },
            { text: "👑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
          ]
        ]
      };

      await bot.sendPhoto(
        chatId,
        resultUrl,
        {
          caption: captionTemplate || "✅ Success!",
          reply_to_message_id: messageId,
          reply_markup: replyMarkup
        }
      );

    } catch (error) {
      try {
        await bot.deleteMessage(chatId, waitMsg.message_id);
      } catch (e) {}

      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      return bot.sendMessage(chatId, `⚠️ ${errorMsg}`, { reply_to_message_id: messageId });
    }
  }
};
