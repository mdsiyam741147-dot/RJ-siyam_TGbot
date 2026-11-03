const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

module.exports = {
  config: {
    name: "gay",
    version: "3.2",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "fun"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderID = String(msg.from.id);

    let targetName = "User";
    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetName = msg.reply_to_message.from.first_name || "User";
    } else if (msg.entities) {
      const mentionEntity = msg.entities.find(e => e.type === "text_mention" || e.type === "mention");
      if (mentionEntity) {
        targetName = "Mentioned User";
      }
    }

    try {
      const waitMsg = await bot.sendMessage(chatId, 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🛠️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞...
» ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐚 𝐦𝐨𝐦𝐞𝐧𝐭
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`, { reply_to_message_id: messageId });

      const backgroundURL = "https://i.ibb.co/Ld1J2cx6/598832374d5c.png";
      const [bgImg, defaultPfp] = await Promise.all([
        loadImage(backgroundURL),
        loadImage("https://i.imgur.com/2dfL88M.png")
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const drawCirclePFP = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      drawCirclePFP(defaultPfp, 400, 170, 60); 
      drawCirclePFP(defaultPfp, 210, 180, 60);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `gay_${senderID}_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      const responseMsg = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🤷 ওমাগো মাদার চোদ গে😹
» 👤 𝐍𝐚𝐦𝐞: ${targetName}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      await bot.sendPhoto(chatId, filePath, {
        caption: responseMsg,
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: `https://t.me/${config.botUsername}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${config.ownerUsername}` }
            ]
          ]
        }
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      try { await bot.deleteMessage(chatId, waitMsg.message_id); } catch(e) {}

    } catch (e) {
      console.error(e);
      return bot.sendMessage(chatId, "❌ 𝐄𝐫𝐫𝐨𝐫: 𝐈𝐦𝐚𝐠𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐤𝐨𝐫𝐚 𝐬𝐨𝐦𝐯𝐨𝐛 𝐡𝐨𝐲𝐧𝐢.", { reply_to_message_id: messageId });
    }
  }
};
