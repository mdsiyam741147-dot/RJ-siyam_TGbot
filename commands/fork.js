const AUTHOR_LOCK = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

module.exports = {
  config: {
    name: "fork",
    aliases: ["ফ্রক", "গিটহাব"],
    version: "4.0",
    author: AUTHOR_LOCK,
    role: 0,
    shortDescription: "বটের ফোর্ক লিঙ্ক ও আপডেট দেখাবে",
    longDescription: "বটের আপডেট ফোর্ক গিটহাব লিঙ্ক দেখাবে ইনলাইন বাটনসহ।",
    category: "info",
    guide: "fork"
  },

  execute: async function (bot, msg, args) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const mentionTag = "🚨 𝐍𝐄𝐖 𝐅𝐎𝐑𝐊 𝐔𝐏𝐃𝐀𝐓𝐄";
    const messageBody = 
`${mentionTag}
➤ 𝐍𝐞𝐰 𝐅𝐮𝐧 & 𝐔𝐬𝐞𝐟𝐮𝐥 𝐂𝐌𝐃𝐒 
😼 𝐔𝐒𝐄 𝐈𝐓
😁 𝐓𝐇𝐄𝐍 𝐊𝐍𝐎𝐖! 

🔗 𝐆𝐢𝐭𝐇𝐮𝐛
https://github.com/siyamxpro/siyamxpro.git
👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "🤖 𝐀𝐃𝐃 𝐁𝐎𝐓", url: "https://t.me/siyam_nu_bot?startgroup=true" },
          { text: "👑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑", url: "https://t.me/ri_siyam" }
        ]
      ]
    };

    return bot.sendMessage(chatId, messageBody, {
      reply_to_message_id: messageId,
      reply_markup: replyMarkup
    });
  }
};
