"use strict";

const fs = require("fs");
const path = require("path");

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

function loadCommands(bot) {
  const directory = path.join(__dirname, "..", "commands");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  bot.commands.clear();

  for (const filePath of getJsFiles(directory)) {
    const file = path.relative(directory, filePath).replace(/\\/g, "/");

    try {
      delete require.cache[require.resolve(filePath)];

      const exported = require(filePath);
      const command = exported?.default || exported;

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
        ...(Array.isArray(command.aliases) ? command.aliases : []),
        ...(Array.isArray(command.config?.aliases)
          ? command.config.aliases
          : [])
      ].map(String);

      command.config = {
        ...(command.config || {}),
        name: String(name),
        aliases
      };

      for (const item of [name, ...aliases]) {
        const key = String(item).toLowerCase();

        if (bot.commands.has(key) && bot.commands.get(key) !== command) {
          console.warn(
            `[COMMAND DUPLICATE] "${key}" from ${file}; later file ignored`
          );
          continue;
        }

        bot.commands.set(key, command);
      }

      console.log(`[COMMAND LOADED] ${name} (${file})`);
    } catch (error) {
      console.error(`[COMMAND LOAD ERROR] ${file}:`, error);
    }
  }

  console.log(`[COMMANDS] ${bot.commands.size} command names loaded.`);
}

module.exports = loadCommands;
