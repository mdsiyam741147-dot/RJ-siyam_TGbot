"use strict";

const fs = require("fs");
const path = require("path");

function loadCommands(bot) {
  const directory = path.join(__dirname, "..", "commands");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  bot.commands.clear();

  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(directory, file);

    try {
      delete require.cache[require.resolve(filePath)];

      const command = require(filePath);

      if (!command || typeof command !== "object") {
        console.warn(`[COMMAND SKIPPED] ${file}`);
        continue;
      }

      const name = command.name || command.config?.name;

      const hasHandler =
        typeof command.execute === "function" ||
        typeof command.onStart === "function";

      if (!name || !hasHandler) {
        console.warn(`[COMMAND SKIPPED] ${file}`);
        continue;
      }

      const aliases = [
        ...(command.aliases || []),
        ...(command.config?.aliases || [])
      ];

      const names = [name, ...aliases];

      command.config = {
        ...(command.config || {}),
        name,
        aliases
      };

      for (const item of names) {
        bot.commands.set(String(item).toLowerCase(), command);
      }

      console.log(`[COMMAND LOADED] ${name}`);
    } catch (error) {
      console.error(`[COMMAND LOAD ERROR] ${file}:`, error);
    }
  }

  console.log(`[COMMANDS] ${bot.commands.size} command names loaded.`);
}

module.exports = loadCommands;
