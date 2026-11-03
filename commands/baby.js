const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

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
    name: "baby",
    aliases: ["bay", "bbe", "babe", "sam"],
    version: "6.9.0",
    author: "dipto",
    role: 0,
    category: "chat",
    shortDescription: "better then all sim simi",

    execute: async (bot, msg, args) => {
        const link = `${await baseApiUrl()}/baby`;
        const dipto = args.join(" ").toLowerCase();
        const uid = String(msg.from.id);
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        let command, comd, final;

        try {
            if (!args[0]) {
                const ran = ["Bolo baby", "নি*ঝু*ম", "type help baby", "type /baby hi"];
                const sent = await bot.sendMessage(chatId, toBold(ran[Math.floor(Math.random() * ran.length)]), { reply_to_message_id: messageId });
                if (global.activeReplies) {
                    global.activeReplies.set(sent.message_id, { commandName: "baby", author: uid });
                }
                return;
            }

            if (args[0] === 'remove') {
                const fina = dipto.replace("remove ", "");
                const res = await axios.get(`${link}?remove=${fina}&senderID=${uid}`);
                return bot.sendMessage(chatId, toBold(res.data.message || "Done"), { reply_to_message_id: messageId });
            }

            if (args[0] === 'rm' && dipto.includes('-')) {
                const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
                const res = await axios.get(`${link}?remove=${fi}&index=${f}`);
                return bot.sendMessage(chatId, toBold(res.data.message || "Done"), { reply_to_message_id: messageId });
            }

            if (args[0] === 'list') {
                if (args[1] === 'all') {
                    const data = (await axios.get(`${link}?list=all`)).data;
                    return bot.sendMessage(chatId, toBold(`Total Teach = ${data.length || 0}`), { reply_to_message_id: messageId });
                } else {
                    const d = (await axios.get(`${link}?list=all`)).data;
                    return bot.sendMessage(chatId, toBold(`Total Teach = ${d.length || "api off"}\nTotal Response = ${d.responseLength || "api off"}`), { reply_to_message_id: messageId });
                }
            }

            if (args[0] === 'msg') {
                const fuk = dipto.replace("msg ", "");
                const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
                return bot.sendMessage(chatId, toBold(`Message ${fuk} = ${d}`), { reply_to_message_id: messageId });
            }

            if (args[0] === 'edit') {
                const commandText = dipto.split(/\s*-\s*/)[1];
                if (!commandText || commandText.length < 2) return bot.sendMessage(chatId, toBold('Invalid format! Use edit [YourMessage] - [NewReply]'), { reply_to_message_id: messageId });
                const res = await axios.get(`${link}?edit=${args[1]}&replace=${commandText}&senderID=${uid}`);
                return bot.sendMessage(chatId, toBold(`Changed ${res.data.message || ""}`), { reply_to_message_id: messageId });
            }

            if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
                [comd, command] = dipto.split(/\s*-\s*/);
                final = comd.replace("teach ", "");
                if (!command || command.length < 2) return bot.sendMessage(chatId, toBold('Invalid format!'), { reply_to_message_id: messageId });
                const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${chatId}`);
                const tex = re.data.message;
                return bot.sendMessage(chatId, toBold(`Replies added ${tex}\nTeachs: ${re.data.teachs}`), { reply_to_message_id: messageId });
            }

            if (args[0] === 'teach' && args[1] === 'amar') {
                [comd, command] = dipto.split(/\s*-\s*/);
                final = comd.replace("teach ", "");
                if (!command || command.length < 2) return bot.sendMessage(chatId, toBold('Invalid format!'), { reply_to_message_id: messageId });
                const res = await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`);
                return bot.sendMessage(chatId, toBold(`Replies added ${res.data.message || ""}`), { reply_to_message_id: messageId });
            }

            if (args[0] === 'teach' && args[1] === 'react') {
                [comd, command] = dipto.split(/\s*-\s*/);
                final = comd.replace("teach react ", "");
                if (!command || command.length < 2) return bot.sendMessage(chatId, toBold('Invalid format!'), { reply_to_message_id: messageId });
                const res = await axios.get(`${link}?teach=${final}&react=${command}`);
                return bot.sendMessage(chatId, toBold(`Replies added ${res.data.message || ""}`), { reply_to_message_id: messageId });
            }

            if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('whats my name')) {
                const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
                const sent = await bot.sendMessage(chatId, toBold(data), { reply_to_message_id: messageId });
                if (global.activeReplies) {
                    global.activeReplies.set(sent.message_id, { commandName: "baby", author: uid });
                }
                return;
            }

            const apiRes = await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`);
            const d = apiRes.data.reply;
            const sentMsg = await bot.sendMessage(chatId, toBold(d), { reply_to_message_id: messageId });
            
            if (global.activeReplies) {
                global.activeReplies.set(sentMsg.message_id, {
                    commandName: "baby",
                    author: uid
                });
            }

        } catch (e) {
            console.log(e);
            bot.sendMessage(chatId, toBold("Error occurred."), { reply_to_message_id: messageId });
        }
    },

    onReply: async ({ bot, msg, Reply }) => {
        if (!msg || !msg.text) return;
        try {
            const uid = String(msg.from.id);
            const chatId = msg.chat.id;
            const text = msg.text.trim();
            
            const apiRes = await axios.get(`https://noobs-api.top/dipto/baby?text=${encodeURIComponent(text)}&senderID=${uid}&font=1`);
            const a = apiRes.data.reply;
            
            const sentMsg = await bot.sendMessage(chatId, toBold(a), { reply_to_message_id: msg.message_id });
            
            if (global.activeReplies) {
                global.activeReplies.set(sentMsg.message_id, {
                    commandName: "baby",
                    author: uid
                });
            }
        } catch (err) {
            console.log(err);
        }
    },

    onChat: async ({ bot, msg }) => {
        try {
            if (!msg || !msg.text) return;
            
            
            if (msg.text.startsWith("/")) return;

            const body = msg.text.toLowerCase();
            const chatId = msg.chat.id;
            const uid = String(msg.from.id);

        
            if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("hi") || body.startsWith("jan") || body.startsWith("বট") || body.startsWith("janu")) {
                const arr = body.replace(/^\S+\s*/, "").trim();
                
                if (!arr) {
                    const randomReplies = ["🤌🤱🥺", "Yes, I am here", "What's up?", "মেয়ে হলে বস সিয়াম কে KISS দে 😒", "অবহেলা করিস না যখন নিজেকে বদলে ফেলবো", "চুমু খাওয়ার বয়স টা চকলেট খেয়ে উড়িয়ে দিল সিয়াম বস", "Bolo jaan ki korte pari"];
                    const replyStr = randomReplies[Math.floor(Math.random() * randomReplies.length)];
                    
                    const sentMsg = await bot.sendMessage(chatId, toBold(replyStr), { reply_to_message_id: msg.message_id });
                    if (global.activeReplies) {
                        global.activeReplies.set(sentMsg.message_id, {
                            commandName: "baby",
                            author: uid
                        });
                    }
                    return;
                }

                const res = await axios.get(`https://noobs-api.top/dipto/baby?text=${encodeURIComponent(arr)}&senderID=${uid}&font=1`);
                const a = res.data.reply;
                
                const sentMsg = await bot.sendMessage(chatId, toBold(a), { reply_to_message_id: msg.message_id });
                if (global.activeReplies) {
                    global.activeReplies.set(sentMsg.message_id, {
                        commandName: "baby",
                        author: uid
                    });
                }
            }
        } catch (err) {}
    }
};
