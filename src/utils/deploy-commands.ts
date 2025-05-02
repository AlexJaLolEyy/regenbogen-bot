import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const { default: command } = await import(filePath);

    if (command?.data) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`⚠️ Command file "${file}" does not export a valid command.`);
    }
  } catch (err) {
    console.error(`❌ Failed to import command "${file}":`, err);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

try {
  console.log('🔁 Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
    { body: commands }
  );
  console.log('✅ Slash commands registered successfully.');
} catch (error) {
  console.error('❌ Failed to register commands:', error);
}
