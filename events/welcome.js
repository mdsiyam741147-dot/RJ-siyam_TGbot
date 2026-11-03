const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require("axios");

const backgroundImages = [
    "https://i.imgur.com/XVRFwns.jpeg",
    "https://i.imgur.com/DXXvgjb.png",
    "https://i.imgur.com/LwoDuzZ.jpeg",
    "https://i.imgur.com/mtSrSYh.jpeg",
    "https://i.imgur.com/IVvEBc4.jpeg",
    "https://i.imgur.com/uJcd1bf.jpeg"
];

const backgroundCache = new Map();

async function loadBackgroundImage(url) {
    if (backgroundCache.has(url)) return backgroundCache.get(url);
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const img = await loadImage(Buffer.from(response.data));
        backgroundCache.set(url, img);
        return img;
    } catch (error) {
        return null;
    }
}

async function drawProfileImage(ctx, imageUrl, x, y, size, borderColor) {
    const radius = size / 2;
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const img = await loadImage(Buffer.from(response.data));
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, size, size);
        ctx.restore();
        return true;
    } catch (error) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#374151';
        ctx.fill();
        ctx.fillStyle = borderColor;
        ctx.font = `bold ${radius * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('U', x, y);
        return false;
    }
}

async function createWelcomeCard(userImg, userName, threadName) {
    const width = 1200;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    const selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    const background = await loadBackgroundImage(selectedBackground);
    if (background) {
        ctx.drawImage(background, 0, 0, width, height);
    } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
    }
    
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, width, height);

    await drawProfileImage(ctx, userImg, width / 2, 220, 180, "#10b981");

    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(threadName, width / 2, 380);

    const welcomeGradient = ctx.createLinearGradient(width / 2 - 180, 400, width / 2 + 180, 400);
    welcomeGradient.addColorStop(0, "#3b82f6");
    welcomeGradient.addColorStop(0.5, "#10b981");
    welcomeGradient.addColorStop(1, "#ec4899");
    
    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = welcomeGradient;
    ctx.fillText("WELCOME", width / 2, 480);

    ctx.font = 'bold 45px sans-serif';
    ctx.fillStyle = "#10b981";
    ctx.fillText(userName, width / 2, 550);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("NIJHUM CHATBOT BY SIYAM-HASAN", width / 2, 630);

    return canvas.toBuffer();
}

module.exports = function (bot) {
    bot.on('message', async (msg) => {
        try {
            if (!msg.new_chat_members || msg.new_chat_members.length === 0) return;

            const chatId = msg.chat.id;
            const threadName = msg.chat.title || "Group";

            for (const newMember of msg.new_chat_members) {
                const userName = newMember.first_name + (newMember.last_name ? ` ${newMember.last_name}` : "");
                const userId = newMember.id;

                let avatarUrl = "https://i.imgur.com/7Qk8k6c.png";
                try {
                    const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
                    if (photos && photos.total_count > 0) {
                        const fileId = photos.photos[0][0].file_id;
                        const fileLink = await bot.getFileLink(fileId);
                        avatarUrl = fileLink;
                    }
                } catch (e) {}

                const cacheDir = path.join(__dirname, "..", "cache");
                await fs.ensureDir(cacheDir);
                const tempPath = path.join(cacheDir, `welcome_${userId}_${Date.now()}.png`);

                try {
                    const imageBuffer = await createWelcomeCard(avatarUrl, userName, threadName);
                    await fs.writeFile(tempPath, imageBuffer);

                    const captionText = 
`🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏 🌸
━━━━━━━━━━━━━━━━━━━━
🌷 𝐍𝐚𝐦𝐞: ${userName}
🏷️ 𝐆𝐫𝐨𝐮𝐩: ${threadName}
👑 𝐎𝐖𝐍𝐄𝐑: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
━━━━━━━━━━━━━━━━━━━━
𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊`;

                    await bot.sendPhoto(chatId, tempPath, {
                        caption: captionText,
                        reply_to_message_id: msg.message_id
                    });

                } catch (error) {
                    console.error("Telegram Welcome Error:", error);
                    await bot.sendMessage(chatId, `🌸 Welcome ${userName} to ${threadName}! Have fun! 😊`);
                } finally {
                    setTimeout(() => {
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    }, 10000);
                }
            }
        } catch (err) {
            console.error("Welcome Event Error:", err.message);
        }
    });
};
