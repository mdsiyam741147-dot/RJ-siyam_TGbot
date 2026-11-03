"use strict";

const fs = require("fs");
const path = require("path");
const TelegramBot = require("./core/bot");

let botInstance = null;

function readConfig() {
  const privateConfig = path.join(__dirname, "config.json");
  const exampleConfig = path.join(__dirname, "config.example.json");

  const configPath = fs.existsSync(privateConfig)
    ? privateConfig
    : exampleConfig;

  if (!fs.existsSync(configPath)) {
    throw new Error(
      "config.json or config.example.json not found"
    );
  }

  const config = JSON.parse(
    fs.readFileSync(configPath, "utf8")
  );

  if (process.env.TELEGRAM_BOT_TOKEN) {
    config.botToken = process.env.TELEGRAM_BOT_TOKEN;
  }

  if (config.enabled !== true) {
    throw new Error("Telegram bot is disabled");
  }

  if (
    !config.botToken ||
    config.botToken.includes("YOUR_TELEGRAM") ||
    config.botToken.includes("PASTE_YOUR")
  ) {
    throw new Error(
      "Telegram Bot Token is missing. Set botToken in private config.json or TELEGRAM_BOT_TOKEN environment variable."
    );
  }

  return config;
}

async function startTelegram() {
  if (botInstance) {
    return botInstance;
  }

  const bot = new TelegramBot(readConfig());

  await bot.start();

  botInstance = bot;

  return bot;
}

async function stopTelegram() {
  if (!botInstance) return;

  const bot = botInstance;
  botInstance = null;

  await bot.stop();
}

module.exports = {
  startTelegram,
  stopTelegram
};
