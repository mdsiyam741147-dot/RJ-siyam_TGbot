const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const LOCKED_AUTHOR_1 = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

function cleanText(text) {
    if (!text) return "";
    return text
        .normalize("NFKC")
        .replace(/[^\x20-\x7E\u0980-\u09FF]/g, "")
        .trim();
}

function drawRoundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

function drawPolygon(ctx, x, y, radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Telegram User Info helper with real username & details
async function getTelegramUser(bot, msg) {
    let targetID = msg.from.id;
    let targetFirstName = msg.from.first_name || "";
    let targetLastName = msg.from.last_name || "";
    let targetName = (targetFirstName + (targetLastName ? ` ${targetLastName}` : "")).trim();
    let targetUsername = msg.from.username ? `@${msg.from.username}` : "Not Available";
    let avatarUrl = null;

    if (msg.reply_to_message && msg.reply_to_message.from) {
        targetID = msg.reply_to_message.from.id;
        let rFirstName = msg.reply_to_message.from.first_name || "";
        let rLastName = msg.reply_to_message.from.last_name || "";
        targetName = (rFirstName + (rLastName ? ` ${rLastName}` : "")).trim();
        targetUsername = msg.reply_to_message.from.username ? `@${msg.reply_to_message.from.username}` : "Not Available";
    }

    try {
        const photos = await bot.getUserProfilePhotos(targetID, { limit: 1 });
        if (photos && photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id;
            const fileLink = await bot.getFileLink(fileId);
            avatarUrl = fileLink;
        }
    } catch (e) {
        avatarUrl = null;
    }

    return { 
        targetID: String(targetID), 
        targetName: targetName || "Telegram User", 
        targetUsername, 
        avatarUrl 
    };
}

async function runDesign1(bot, msg) {
    const chatId = msg.chat.id;
    const waitMsg = await bot.sendMessage(chatId, "⏳ Generating UID Card...", { reply_to_message_id: msg.message_id });

    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const { targetID, targetName, targetUsername, avatarUrl } = await getTelegramUser(bot, msg);
    const imgPath = path.join(cacheDir, `uid_${targetID}_${Date.now()}.png`);

    try {
        const cleanUserName = cleanText(targetName).toUpperCase() || "TELEGRAM USER";
        const ownerName = cleanText("SIYAM HASAN");

        const width = 850;
        const height = 420;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#020204";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        const orbCyan = ctx.createRadialGradient(180, 100, 10, 180, 100, 320);
        orbCyan.addColorStop(0, "rgba(0, 245, 212, 0.25)");
        orbCyan.addColorStop(0.5, "rgba(0, 245, 212, 0.08)");
        orbCyan.addColorStop(1, "transparent");
        ctx.fillStyle = orbCyan;
        ctx.fillRect(0, 0, width, height);

        const orbMagenta = ctx.createRadialGradient(720, 320, 10, 720, 320, 350);
        orbMagenta.addColorStop(0, "rgba(255, 0, 127, 0.22)");
        orbMagenta.addColorStop(0.5, "rgba(255, 0, 127, 0.07)");
        orbMagenta.addColorStop(1, "transparent");
        ctx.fillStyle = orbMagenta;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        ctx.save();
        drawRoundRect(ctx, 25, 25, width - 50, height - 50, 22);
        ctx.fillStyle = "rgba(8, 10, 18, 0.92)";
        ctx.fill();

        ctx.shadowColor = "#00f5d4";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "#00f5d4";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        const hexX = 160;
        const hexY = 210;
        const hexRadius = 110;

        ctx.save();
        drawPolygon(ctx, hexX, hexY, hexRadius + 8, 6);
        const hexGrad = ctx.createLinearGradient(hexX - hexRadius, hexY - hexRadius, hexX + hexRadius, hexY + hexRadius);
        hexGrad.addColorStop(0, "#00f5d4");
        hexGrad.addColorStop(0.5, "#7000ff");
        hexGrad.addColorStop(1, "#ff007f");
        ctx.strokeStyle = hexGrad;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        try {
            if (avatarUrl) {
                const imgRes = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 5000 });
                const avatarImg = await loadImage(Buffer.from(imgRes.data));
                ctx.save();
                drawPolygon(ctx, hexX, hexY, hexRadius, 6);
                ctx.clip();
                ctx.drawImage(avatarImg, hexX - hexRadius, hexY - hexRadius, hexRadius * 2, hexRadius * 2);
                ctx.restore();
            } else {
                throw new Error("No Avatar");
            }
        } catch (e) {
            ctx.save();
            drawPolygon(ctx, hexX, hexY, hexRadius, 6);
            ctx.fillStyle = "#12182e";
            ctx.fill();
            ctx.fillStyle = "#00f5d4";
            ctx.font = "bold 70px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(cleanUserName.charAt(0) || "U", hexX, hexY + 24);
            ctx.restore();
        }

        const contentX = 330;

        ctx.save();
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#8e9bbd";
        ctx.fillText("USER NAME", contentX, 85);

        ctx.font = "bold 32px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(cleanUserName, contentX, 125);

        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#8e9bbd";
        ctx.fillText("TELEGRAM ID", contentX, 190);

        ctx.font = "bold 36px sans-serif";
        ctx.fillStyle = "#00f5d4";
        ctx.fillText(targetID, contentX, 232);

        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#8e9bbd";
        ctx.fillText("SYSTEM OWNER", contentX, 295);

        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#ffee32";
        ctx.fillText(ownerName, contentX, 335);
        ctx.restore();

        const buffer = canvas.toBuffer("image/png");
        await fs.writeFile(imgPath, buffer);

        try {
            await bot.deleteMessage(chatId, waitMsg.message_id);
        } catch (e) {}

        const captionText = 
`╭━❮ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ❯━╮
┃
┣ 👤 𝗡𝗔𝗠𝗘: ${targetName}
┣ 🔗 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘: ${targetUsername}
┣ 🆔 𝗨𝗦𝗘𝗥 𝗜𝗗: ${targetID}
┃
┣ 👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗜𝗬𝗔𝗠 𝗛𝗔𝗦𝗔𝗡
┣ 🤖 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧
╰━═━═━═━═━═━═━═━═━╯`;

        // Inline keyboard button with bold text to copy UID
        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📋 𝗖𝗢𝗣𝗬 𝗨𝗦𝗘𝗥 𝗜𝗗", callback_data: `copy_uid_${targetID}` }]
                ]
            }
        };

        await bot.sendPhoto(chatId, imgPath, {
            caption: captionText,
            reply_to_message_id: msg.message_id,
            ...inlineKeyboard
        });

    } catch (err) {
        console.error("UID Design 1 Error:", err);
        try {
            await bot.deleteMessage(chatId, waitMsg.message_id);
        } catch (e) {}
        await bot.sendMessage(chatId, "❌ ইউআইডি কার্ড তৈরিতে সমস্যা হয়েছে!", { reply_to_message_id: msg.message_id });
    } finally {
        setTimeout(() => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, 5000);
    }
}

async function runDesign2(bot, msg) {
    const chatId = msg.chat.id;
    const { targetID, targetName, targetUsername, avatarUrl } = await getTelegramUser(bot, msg);

    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `uid_${Date.now()}.png`);

    try {
        const width = 820;
        const height = 480;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, "#1c0a16");
        bg.addColorStop(1, "#1a0b1c");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        roundRect(ctx, 20, 20, 780, 440, 26);
        ctx.fillStyle = "rgba(25, 12, 32, 0.9)";
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = "rgba(251, 113, 133, 0.6)";
        ctx.lineWidth = 3;
        roundRect(ctx, 20, 20, 780, 440, 26);
        ctx.stroke();

        const headerGrad = ctx.createLinearGradient(45, 40, 775, 40);
        headerGrad.addColorStop(0, "#fb7185");
        headerGrad.addColorStop(1, "#c084fc");
        ctx.fillStyle = headerGrad;
        roundRect(ctx, 45, 40, 730, 52, 14);
        ctx.fill();

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("TELEGRAM UID CARD", 410, 76);

        const avatarSize = 175;
        const avatarX = 70;
        const avatarY = 120;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        try {
            if (avatarUrl) {
                const imgRes = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 5000 });
                const avatar = await loadImage(Buffer.from(imgRes.data));
                ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            } else {
                throw new Error();
            }
        } catch (e) {
            ctx.fillStyle = "#4a1d3a";
            ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
            ctx.font = "bold 42px Arial";
            ctx.fillStyle = "#f9a8d4";
            ctx.textAlign = "center";
            ctx.fillText("?", avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 16);
        }
        ctx.restore();

        ctx.fillStyle = "rgba(45, 20, 50, 0.85)";
        roundRect(ctx, 290, 115, 480, 100, 16);
        ctx.fill();

        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#f9a8d4";
        ctx.textAlign = "left";
        ctx.fillText("USER NAME", 320, 150);

        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#ffffff";
        const displayName = targetName.length > 20 ? targetName.slice(0, 20) + "..." : targetName;
        ctx.fillText(displayName, 320, 195);

        ctx.fillStyle = "rgba(45, 20, 50, 0.85)";
        roundRect(ctx, 290, 235, 480, 100, 16);
        ctx.fill();

        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#e9d5ff";
        ctx.fillText("USER ID", 320, 270);

        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(targetID, 320, 315);

        ctx.fillStyle = "rgba(50, 20, 55, 0.9)";
        roundRect(ctx, 50, 360, 720, 70, 16);
        ctx.fill();

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("Owner : Siyam Hasan", 410, 405);

        await fs.writeFile(filePath, canvas.toBuffer("image/png"));

        const captionText = 
`╭━❮ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ❯━╮
┃
┣ 👤 𝗡𝗔𝗠𝗘: ${targetName}
┣ 🔗 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘: ${targetUsername}
┣ 🆔 𝗨𝗦𝗘𝗥 𝗜𝗗: ${targetID}
┃
┣ 👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗜𝗬𝗔𝗠 𝗛𝗔𝗦𝗔𝗡
┣ 🤖 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧
╰━═━═━═━═━═━═━═━═━╯`;

        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📋 𝗖𝗢𝗣𝗬 𝗨𝗦𝗘𝗥 𝗜𝗗", callback_data: `copy_uid_${targetID}` }]
                ]
            }
        };

        await bot.sendPhoto(chatId, filePath, {
            caption: captionText,
            reply_to_message_id: msg.message_id,
            ...inlineKeyboard
        });

        setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 10000);

    } catch (err) {
        console.log(err);
        return bot.sendMessage(chatId, "❌ UID card generate korte problem hoise.", { reply_to_message_id: msg.message_id });
    }
}

const userLastSelection = new Map();

module.exports = {
    config: {
        name: "uid",
        aliases: ["uid2", "ইউআইডি", "useid"],
        version: "7.0",
        author: LOCKED_AUTHOR_1,
        role: 0,
        description: "Get user profile card with unique design",
        category: "user"
    },

    execute: async function (bot, msg, args) {
        const userID = msg.from.id;
        const availableDesigns = [1, 2];
        const lastDesign = userLastSelection.get(userID);

        let eligibleDesigns = availableDesigns;
        if (lastDesign !== undefined) {
            eligibleDesigns = availableDesigns.filter(d => d !== lastDesign);
        }

        const selectedDesign = eligibleDesigns[Math.floor(Math.random() * eligibleDesigns.length)];
        userLastSelection.set(userID, selectedDesign);

        if (selectedDesign === 1) {
            await runDesign1(bot, msg);
        } else {
            await runDesign2(bot, msg);
        }
    }
};
