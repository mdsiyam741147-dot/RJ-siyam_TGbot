const AUTHOR_LOCK = "SIYAM";

module.exports = {
  config: {
    name: "fo",
    aliases: ["repo"],
    version: "4.0",
    author: AUTHOR_LOCK,
    role: 0,
    shortDescription: "Bot Information",
    longDescription: "Shows bot information and owner details with interactive buttons",
    category: "info",
    guide: "fo"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userId = String(msg.from.id);

    // config.js থেকে ওনার বা অ্যাডমিন আইডি চেক করা
    const config = require("../config");
    const isAdmin = userId === String(config.ownerID) || (config.adminIDs && config.adminIDs.map(String).includes(userId));

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/siyam_nu_bot?startgroup=true" },
          { text: "👑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
        ]
      ]
    };

    if (!isAdmin) {
      const nonAdminText = 
`𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» 📉 এই কমান্ড শুধুমাত্র
» 🧚 বস 𝐒𝐈𝐘𝐀𝐌 এর জন্য
» 😾 তুই আবাল 😹🦵 
───────────────
» 👑 𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓 👑`;

      return bot.sendMessage(chatId, nonAdminText, {
        reply_to_message_id: messageId,
        reply_markup: replyMarkup
      });
    }

    const adminText = 
`👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» ✅ ওয়েলকাম বস সিয়াম!
» 🐸 বোট সিস্টেম সম্পূর্ণ সক্রিয় আছে।
───────────────

























































































😻`;

    return bot.sendMessage(chatId, adminText, {
      reply_to_message_id: messageId,
      reply_markup: replyMarkup
    });
  }
};
