"use strict";

const fs = require("fs");
const path = require("path");
const getLegacyBot = require("../core/compat/legacyBot");

function loadEvents(bot) {
  const directory = path.join(__dirname, "..", "events");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  bot.eventHandler.events = [];

  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith(".js"));

  const legacyBot = getLegacyBot(bot);

  for (const file of files) {
    const filePath = path.join(directory, file);

    try {
      delete require.cache[require.resolve(filePath)];

      const event = require(filePath);

      if (typeof event === "function") {
        event(legacyBot);
        console.log(`[LEGACY EVENT LOADED] ${file}`);
        continue;
      }

      if (!event || typeof event !== "object") {
        console.warn(`[EVENT SKIPPED] ${file}`);
        continue;
      }

      if (!event.config) event.config = {};
      if (!event.config.name) {
        event.config.name = path.basename(file, ".js");
      }

      bot.eventHandler.register(event);

      console.log(`[EVENT LOADED] ${event.config.name}`);
    } catch (error) {
      console.error(`[EVENT LOAD ERROR] ${file}:`, error);
    }
  }

  console.log(`[EVENTS] ${bot.eventHandler.events.length} object event files loaded.`);
}

module.exports = loadEvents;
