const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const config = require("../config");

module.exports = {
  config: {
    name: "kola",
    version: "2.9.3",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    category: "fun"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetName = "User";
    if (msg.reply_to_message && msg.reply_to_message.from) {
      targetName = msg.reply_to_message.from.first_name || "User";
    }

    try {
      const imgLink = "https://i.imgur.com/iNV52mX.jpeg"; 
      const filePath = path.join(cacheDir, `kola_siyam_${Date.now()}.png`);

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage("https://i.imgur.com/2dfL88M.png")
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      const pfpWidth = 130;
      const pfpHeight = 170;
      const x = (canvas.width / 2) - (pfpWidth / 2) + 25;
      const y = (canvas.height / 2) - (pfpHeight / 2) - 110;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x + pfpWidth / 2, y + pfpHeight / 2, pfpWidth / 2, pfpHeight / 2, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetPfp, x, y, pfpWidth, pfpHeight);
      ctx.restore();

      ctx.beginPath();
      ctx.ellipse(x + pfpWidth / 2, y + pfpHeight / 2, pfpWidth / 2, pfpHeight / 2, 0, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const finalCaption =
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 😂 ঐ দেখ মামা এরে 
» 🫡 চিনতে পারস কি না!
» 🙆 নাম: ${targetName}
» 💃 ইজ্জতের তো আর 
» 😹 কিছুই বাকি নাই!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      await bot.sendPhoto(chatId, filePath, {
        caption: finalCaption,
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

    } catch (e) {
      console.error("KOLA ERROR:", e);
      return bot.sendMessage(chatId, "❌ ঝামেলা হইছে, কলা খাওয়ানো গেল না!", { reply_to_message_id: messageId });
    }
  }
};
