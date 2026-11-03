const axios = require('axios');
const baseApiUrl = "https://noobs-api.top/dipto/baby";

function toBold(str) {
    if (!str) return "";
    const boldMap = {
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
        'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
        'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
        'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
        'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟩', '8': '𝟴', '9': '𝟵'
    };
    return str.split('').map(c => boldMap[c] || c).join('');
}

module.exports = {
    config: {
        name: "bot",
        aliases: ["mbot", "milonbot"],
        version: "10.0.0",
        author: "Milon",
        countDown: 0,
        role: 0,
        description: "High-speed bot with extra dialogues and fixed mentions",
        category: "fun",
        guide: { en: "{pn} [text]" }
    },

    execute: async (bot, msg, args, usersData) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const senderID = String(msg.from.id);

        try {
            let name = "User";
            if (usersData && typeof usersData.getName === "function") {
                name = await usersData.getName(senderID).catch(() => "User");
            } else if (msg.from.first_name) {
                name = msg.from.first_name;
            }

            if (!args[0]) {
                const responseText = `「 ${name} 」\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি?`;
                const sent = await bot.sendMessage(chatId, toBold(responseText), { reply_to_message_id: messageId });
                if (global.activeReplies) {
                    global.activeReplies.set(sent.message_id, { commandName: "bot", author: senderID });
                }
                return;
            }

            if (args[0] === 'teach') {
                const [q, a] = args.slice(1).join(" ").split(/\s*-\s*/);
                if (!q || !a) return bot.sendMessage(chatId, toBold("⚠️ Format: /bot teach ask - reply"), { reply_to_message_id: messageId });
                const { data } = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${senderID}`);
                return bot.sendMessage(chatId, toBold(`✅ Added: ${data.message || "Done"}`), { reply_to_message_id: messageId });
            }

            const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(args.join(" "))}&senderID=${senderID}&font=1`);
            const sentMsg = await bot.sendMessage(chatId, toBold(data.reply), { reply_to_message_id: messageId });
            
            if (global.activeReplies) {
                global.activeReplies.set(sentMsg.message_id, { commandName: "bot", author: senderID });
            }
        } catch (e) {
            bot.sendMessage(chatId, toBold("API Busy!"), { reply_to_message_id: messageId });
        }
    },

    onReply: async ({ bot, msg }) => {
        if (!msg || !msg.text) return;
        try {
            const senderID = String(msg.from.id);
            const chatId = msg.chat.id;
            const text = msg.text.trim();

            const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`);
            const sentMsg = await bot.sendMessage(chatId, toBold(data.reply), { reply_to_message_id: msg.message_id });
            
            if (global.activeReplies) {
                global.activeReplies.set(sentMsg.message_id, { commandName: "bot", author: senderID });
            }
        } catch (err) {}
    },

    onChat: async ({ bot, msg, usersData }) => {
        try {
            if (!msg || !msg.text) return;
            if (msg.text.startsWith("/")) return;

            const body = msg.text.toLowerCase();
            const chatId = msg.chat.id;
            const messageId = msg.message_id;
            const senderID = String(msg.from.id);

            if (body.startsWith("bot") || body.startsWith("বট")) {
                const text = body.replace(/^(bot|বট)\s*/i, "").trim();

                let name = "User";
                if (usersData && typeof usersData.getName === "function") {
                    name = await usersData.getName(senderID).catch(() => "User");
                } else if (msg.from.first_name) {
                    name = msg.from.first_name;
                }

                if (!text) {
                    const randomReplies = [
                        "𝗵𝗲 𝗯𝗼𝘁 𝗯𝗼𝘁 𝗰𝗵𝗶𝗹𝗹 𝗯𝗿𝗼!", "I love you 💝", "আমি সিয়াম বস এর সাথে বিজি আছি",
                        "আমার বস সিয়াম কে একটা GF দাও", "জান তোমার নানি রে আমার হাতে তুলে দিবা",
                        "সিয়াম বস'এর হবু বউ রে কেও দেখছো?", "জান হাঙ্গা করবা",
                        "ইসস এতো ডাকো কেনো লজ্জা লাগে তো", "তাকাই আছো কেন চুমু দিবা",
                        "বেশি Bot Bot করলে leave নিবো কিন্তু", "তোর বাড়ি কি কিশোরগঞ্জ, পোড়াবাড়িয়া গ্রাম",
                        "মেয়ে হলে বস সিয়াম কে KISS দে", "চুমু খাওয়ার বয়স টা চকলেট খেয়ে উড়িয়ে দিলো সিয়াম বস",
                        "আহ শোনা আমার আমাকে এতো ডাকছো কেনো আসো বুকে আসো", "জান বাল ফালাইবা",
                        "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু", "দিনশেষে পরের BOW সুন্দর",
                        "সুন্দর মাইয়া মানেই আমার বস সিয়াম এর বউ", "হা জানু , এইদিক এ আসো কিস দেই",
                        "আরে আমি মজা করার mood এ নাই", "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো",
                        "আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস সিয়াম কে দান করেন",
                        "ও মিম ও মিম তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম", "অনুমতি দিলে কল দিতাম",
                        "জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি",
                        "বস সিয়াম এর সাথে কথা বলবো এখন , ডিস্টার্ব করিস না", "বেশি বেশি বকবক করলে তোকে ব্লক মেরে দেবো কিন্তু",
                        "জানু তোমার জন্য আমার মনটা আই ঢাই করে", "ওই যে দেখো সিয়াম বস যাচ্ছে , এক বালতি প্রেম দিয়ে দাও"
                    ];
                    const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];
                    const responseText = `「 ${name} 」\n\n${rand}`;

                    const sent = await bot.sendMessage(chatId, toBold(responseText), { reply_to_message_id: messageId });
                    if (global.activeReplies) {
                        global.activeReplies.set(sent.message_id, { commandName: "bot", author: senderID });
                    }
                    return;
                }

                const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`);
                const sentMsg = await bot.sendMessage(chatId, toBold(data.reply), { reply_to_message_id: messageId });
                
                if (global.activeReplies) {
                    global.activeReplies.set(sentMsg.message_id, { commandName: "bot", author: senderID });
                }
            }
        } catch (err) {}
    }
};
