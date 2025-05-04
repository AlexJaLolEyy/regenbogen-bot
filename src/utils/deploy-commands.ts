import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

console.log('✅ Environment variables validated');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

console.log('🔍 Loading commands...');
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = await import(filePath);

    if (command?.data) {
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
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
