"use strict";

const fs = require("fs");
const path = require("path");
const getLegacyBot = require("../core/compat/legacyBot");

function getJsFiles(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const results = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...getJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function loadEvents(bot) {
  const directory = path.join(__dirname, "..", "events");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  bot.eventHandler.events = [];

  const legacyBot = getLegacyBot(bot);

  for (const filePath of getJsFiles(directory)) {
    const file = path.relative(directory, filePath).replace(/\\/g, "/");

    try {
      delete require.cache[require.resolve(filePath)];

      const exported = require(filePath);
      const event = exported?.default || exported;

      if (typeof event === "function") {
        event(legacyBot);
        console.log(`[LEGACY EVENT LOADED] ${file}`);
        continue;
      }

      if (!event || typeof event !== "object") {
        console.warn(`[EVENT SKIPPED] ${file}`);
        continue;
      }

      event.config = { ...(event.config || {}) };

      if (!event.config.name) {
        event.config.name = file.replace(/\.js$/i, "");
      }

      bot.eventHandler.register(event);

      console.log(`[EVENT LOADED] ${event.config.name}`);
    } catch (error) {
      console.error(`[EVENT LOAD ERROR] ${file}:`, error);
    }
  }

  console.log(
    `[EVENTS] ${bot.eventHandler.events.length} object event files loaded.`
  );
}

module.exports = loadEvents;
