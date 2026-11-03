const axios = require('axios'); 
const config = require("../config");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.4",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "other"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    let Shaon;
    try {
      const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
      Shaon = apis.data.imgur;
    } catch {
      return bot.sendMessage(chatId, "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐈𝐦𝐠𝐮𝐫 𝐀𝐏𝐈 𝐥𝐢𝐧𝐤!", { reply_to_message_id: messageId });
    }

    const reply = msg.reply_to_message;
    if (!reply || (!reply.photo && !reply.video && !reply.document)) {
      return bot.sendMessage(
        chatId,
        "𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐞 image 𝐨𝐫 𝐯𝐢𝐝𝐞𝐨 𝐰𝐢𝐭𝐡 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐈𝐦𝐠𝐮𝐫...!✅",
        { reply_to_message_id: messageId }
      );
    }

    try {
      let fileId = "";
      if (reply.photo) {
        fileId = reply.photo[reply.photo.length - 1].file_id;
      } else if (reply.video) {
        fileId = reply.video.file_id;
      } else if (reply.document) {
        fileId = reply.document.file_id;
      }

      const fileLink = await bot.getFileLink(fileId);
      const upload = await axios.get(`${Shaon}/imgur?link=${encodeURIComponent(fileLink)}`);
      const link = upload.data.uploaded.image || "❌ 𝐍𝐨 𝐥𝐢𝐧𝐤 𝐫𝐞𝐜𝐞𝐢𝐯𝐞𝐝";

      const messageToSend = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑`;

      return bot.sendMessage(chatId, messageToSend, {
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔗 𝐂𝐎𝐏𝗬 𝗟𝗜𝗡𝗞", url: link }
            ],
            [
              { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: `https://t.me/${config.botUsername}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${config.ownerUsername}` }
            ]
          ]
        }
      });
    } catch (e) {
      return bot.sendMessage(chatId, "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐩𝐥𝐨𝐚𝐝", { reply_to_message_id: messageId });
    }
  }
};
