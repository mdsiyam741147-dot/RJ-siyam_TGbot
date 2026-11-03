module.exports = {
  name: "pin",
  aliases: ["pinmsg"],
  version: "1.0.0",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 1, // Admin & Owner
  category: "group",
  shortDescription: "Pin a replied message in group",

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId, "⚠️ **যে মেসেজটি পিন করতে চান সেটিতে রিপ্লাই করে `/pin` লিখুন!**", {
        reply_to_message_id: messageId,
        parse_mode: "Markdown"
      });
    }

    try {
      await bot.pinChatMessage(chatId, msg.reply_to_message.message_id);
      return bot.sendMessage(chatId, "📌 **মেসেজটি সফলভাবে পিন করা হয়েছে!**", {
        reply_to_message_id: messageId
      });
    } catch (err) {
      return bot.sendMessage(chatId, "❌ **পিন করতে ব্যর্থ! বটের পারমিশন আছে কিনা চেক করুন।**", {
        reply_to_message_id: messageId
      });
    }
  }
};
