const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

const AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "love2",
    aliases: ["match", "pair", "প্রেম"],
    version: "3.1",
    author: AUTHOR,
    role: 0,
    category: "fun"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
      if (module.exports.config.author !== AUTHOR) {
        return bot.sendMessage(chatId, "⛔ This file is locked!\nAuthor change detected.", { reply_to_message_id: messageId });
      }

      let name1 = msg.from.first_name || "User 1";
      let name2 = "User 2";

      if (msg.reply_to_message && msg.reply_to_message.from) {
        name2 = msg.reply_to_message.from.first_name || "User 2";
      } else if (args.length > 0) {
        name2 = args.join(" ");
      }

      const percentage = Math.floor(Math.random() * 56) + 45;
      const totalBlocks = 10;
      const filledBlocks = Math.round((percentage / 100) * totalBlocks);
      const progressBar = "█".repeat(filledBlocks) + "░".repeat(totalBlocks - filledBlocks);

      let matchBadge = "✨ DESTINED SOULMATES ✨";
      let comment = "💞 সেরা জুটি! এদের আত্মায় আত্মায় মিলন।";

      const width = 900;
      const height = 520;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const bg = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 500);
      bg.addColorStop(0, "#2d001e");
      bg.addColorStop(0.6, "#0f000b");
      bg.addColorStop(1, "#030005");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(255, 0, 128, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 40, width - 80, height - 80, 25);
      ctx.fill();
      ctx.stroke();

      let img1 = await loadImage("https://i.imgur.com/2dfL88M.png");
      let img2 = await loadImage("https://i.imgur.com/2dfL88M.png");

      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 240, 95, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img1, 105, 145, 190, 190);
      ctx.restore();

      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(200, 240, 97, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(700, 240, 95, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img2, 605, 145, 190, 190);
      ctx.restore();

      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(700, 240, 97, 0, Math.PI * 2, true);
      ctx.stroke();

      ctx.fillStyle = "#12000e";
      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 80, 175, 160, 130, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 46px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${percentage}%`, width / 2, 235);

      ctx.fillStyle = "#ff007f";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("MATCH RATE", width / 2, 275);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("💞 CYBER LOVE COMPATIBILITY 💞", width / 2, 90);

      const imgPath = path.join(__dirname, "cache", `love_hd_${Date.now()}.png`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      const msgText = `» 👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
💘 𝗖𝗬𝗕𝗘𝗥 𝗟𝗢𝗩𝗘 𝗠𝗔𝗧𝗖𝗛 
───────────────
👤 ${name1}  ✕  👤 ${name2}

🔥 মিলের পরিমাণ: ${percentage}%
📊 [${progressBar}]
🏷️ স্ট্যাটাস: ${matchBadge}

» ${comment}
───────────────
» 🧚‍♀️ 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      return bot.sendPhoto(chatId, imgPath, {
        caption: msgText,
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: `https://t.me/${config.botUsername}?startgroup=true` },
              { text: "👑 𝐎𝐖𝐍𝐄𝐑", url: `https://t.me/${config.ownerUsername}` }
            ]
          ]
        }
      }, () => fs.unlinkSync(imgPath));

    } catch (e) {
      console.error(e);
      return bot.sendMessage(chatId, "❌ আল্ট্রা লাভ কার্ড তৈরি করতে সমস্যা হয়েছে!", { reply_to_message_id: messageId });
    }
  }
};
