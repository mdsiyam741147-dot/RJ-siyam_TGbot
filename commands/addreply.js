const fs = require("fs-extra");
const path = require("path");

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const dataPath = path.join(__dirname, "cache", "custom_data.json");

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

const loadData = () => {
	try {
		if (!fs.existsSync(dataPath)) {
			fs.ensureDirSync(path.dirname(dataPath));
			fs.writeFileSync(dataPath, JSON.stringify({}), "utf8");
			return {};
		}
		const content = fs.readFileSync(dataPath, "utf8");
		return content ? JSON.parse(content) : {};
	} catch (err) {
		return {};
	}
};

const saveData = (data) => {
	try {
		fs.ensureDirSync(path.dirname(dataPath));
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
	} catch (err) {}
};

let customWords = loadData();

module.exports = {
	config: {
		name: "addreply",
		aliases: ["ar", "কথা", "reply", "add", "টিচ"],
		version: "2.8",
		author: LOCKED_AUTHOR,
		countDown: 3,
		role: 0,
		description: {
			bn: "নিজের মতো কাস্টম কথা ও অটো রিপ্লাই সেট করুন"
		},
		category: "tool",
		guide: {
			bn: "addreply add <keyword> - <reply>\naddreply del <keyword>\naddreply list\naddreply clear"
		}
	},

	execute: async (bot, msg, args) => {
		if (module.exports.config.author !== LOCKED_AUTHOR) {
			module.exports.config.author = LOCKED_AUTHOR;
		}

		const chatId = msg.chat.id;
		const messageId = msg.message_id;
		const action = args[0]?.toLowerCase();

		if (action === "del") {
			const key = args.slice(1).join(" ").toLowerCase().trim();
			if (key && customWords[key]) {
				delete customWords[key];
				saveData(customWords);
				const text = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🗑️ 𝐑𝐄𝐏𝐋𝐘 𝐃𝐄𝐋𝐄𝗧𝐄𝐃
» 📌 𝐊𝐞𝐲𝐰𝐨𝐫𝐝: ${key}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
				return bot.sendMessage(chatId, toBold(text), { reply_to_message_id: messageId });
			} else {
				const text = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐊𝐞𝐲𝐰𝐨𝐫𝐝 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
				return bot.sendMessage(chatId, toBold(text), { reply_to_message_id: messageId });
			}
		}

		if (action === "clear") {
			customWords = {};
			saveData(customWords);
			const text = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🧹 𝐀𝐥𝐥 𝐂𝐮𝐬𝐭𝐨𝐦 𝐑𝐞𝐩𝐥𝐢𝐞𝐬 𝐂𝐥𝐞𝐚𝐫𝐞𝐝!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
			return bot.sendMessage(chatId, toBold(text), { reply_to_message_id: messageId });
		}

		if (action === "list") {
			const keys = Object.keys(customWords);
			if (keys.length === 0) {
				const text = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📭 𝐍𝐨 𝐂𝐮𝐬𝐭𝐨𝐦 𝐑𝐞𝐩𝐥𝐢𝐞𝐬 𝐅𝐨𝐮𝐧ดย!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
				return bot.sendMessage(chatId, toBold(text), { reply_to_message_id: messageId });
			}

			let listMsg = `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n📜 𝐂𝐔𝐒𝐓𝐎𝐌 𝐑𝐄𝐏𝐋𝐘 𝐋𝐈𝐒𝐓:\n\n`;
			keys.forEach((k, idx) => {
				listMsg += `${idx + 1}. ${k} ➔ ${customWords[k]}\n`;
			});
			listMsg += `\n───────────────\n» 📊 𝐓𝐨𝐭𝐚𝐥: ${keys.length}\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

			return bot.sendMessage(chatId, toBold(listMsg), { reply_to_message_id: messageId });
		}

		let fullInput = args.join(" ");
		if (action === "add") {
			fullInput = args.slice(1).join(" ");
		}

		if (fullInput.includes("-")) {
			const splitIndex = fullInput.indexOf("-");
			const key = fullInput.substring(0, splitIndex).trim().toLowerCase();
			const reply = fullInput.substring(splitIndex + 1).trim();

			if (key && reply) {
				customWords[key] = reply;
				saveData(customWords);
				const text = 
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🗣️ 𝐀𝐔𝐓𝐎 𝐑𝐄𝐏𝐋𝐘 𝐀𝐃𝐃𝐄𝐃
» 📌 𝐊𝐞𝐲𝐰𝐨𝐫𝐝: ${key}
» 💬 𝐑𝐞𝐩𝐥𝐲: ${reply}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
				return bot.sendMessage(chatId, toBold(text), { reply_to_message_id: messageId });
			}
		}

		const guideText = 
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
━━━━━━━━━━━━━━
📌 𝐀𝐃𝐃𝐑𝐄𝐏𝐋𝐘 𝐆𝐔𝐈𝐃𝐄

» /addreply add <শব্দ> - <উত্তর>
➜ নতুন অটো রিপ্লাই যোগ হবে।

» /addreply del <শব্দ>
➜ নির্দিষ্ট অটো রিপ্লাই ডিলিট হবে।

» /addreply list
➜ সব অটো রিপ্লাইয়ের তালিকা দেখাবে।

» /addreply clear
➜ সব অটো রিপ্লাই একসাথে ডিলিট হবে।

💡 𝐄𝐗𝐀𝐌𝐏𝐋𝐄:
/addreply add hi - হ্যালো কেমন আছো?
━━━━━━━━━━━━━━
🧚‍♀️ 𝐍𝗜𝗝𝗛𝗨𝗠 𝐂𝐇𝗔𝗧𝗕𝗢𝗧`;

		return bot.sendMessage(chatId, toBold(guideText), { reply_to_message_id: messageId });
	},

	onChat: async ({ bot, msg }) => {
		try {
			if (!msg || !msg.text) return;
			const textBody = msg.text.toLowerCase().trim();
			if (!textBody) return;

			if (customWords[textBody]) {
				return bot.sendMessage(msg.chat.id, toBold(customWords[textBody]), { reply_to_message_id: msg.message_id });
			}

			for (const [key, reply] of Object.entries(customWords)) {
				if (key.length >= 2 && textBody.includes(key)) {
					return bot.sendMessage(msg.chat.id, toBold(reply), { reply_to_message_id: msg.message_id });
				}
			}
		} catch (err) {}
	}
};
