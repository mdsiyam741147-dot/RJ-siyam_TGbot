const fs = require("fs");
const path = require("path");

module.exports = {
  name: "clearcache",
  aliases: ["cc", "clean"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 2, // Only Owner
  category: "admin",
  shortDescription: "Clear temporary cache files",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const cacheDir = path.join(__dirname, "../cache");
    
    if (!fs.existsSync(cacheDir)) {
      return bot.sendMessage(chatId, "🧹 **ক্যাশ ফোল্ডার খালি আছে!**", {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });
    }

    try {
      const files = fs.readdirSync(cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(cacheDir, file));
      }

      return bot.sendMessage(chatId, `✅ **সফলভাবে ${files.length}টি ক্যাশ ফাইল মুছে ফেলা হয়েছে!**`, {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });
    } catch (err) {
      return bot.sendMessage(chatId, `❌ **ভুল হয়েছে:** ${err.message}`, {
        reply_to_message_id: messageId
      });
    }
  }
};
