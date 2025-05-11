import type { Interaction } from 'discord.js';
import { client } from '../lib/client';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load commands
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

console.log('🔍 Loading commands...');
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = await import(filePath);
    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Command file "${file}" missing data or execute function`);
    }
  } catch (err) {
    console.error(`❌ Failed to load command "${file}":`, err);
  }
}
console.log(`📊 Total commands loaded: ${client.commands.size}`);

export const event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction) {
    console.log(`🔧 Interaction received: ${interaction.isChatInputCommand() ? interaction.commandName : 'non-command'}`);
    console.log(`📝 Interaction type: ${interaction.type}`);
    console.log(`👤 User: ${interaction.user.tag}`);
    console.log(`🏰 Guild: ${interaction.guild?.name || 'DM'}`);

    if (!interaction.isChatInputCommand()) {
      console.log('❌ Not a chat input command, ignoring');
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️ Command "${interaction.commandName}" not found in client.commands`);
      console.log(`📊 Available commands: ${Array.from(client.commands.keys()).join(', ')}`);
      return;
    }

    console.log(`🎯 Executing command: ${interaction.commandName}`);
    try {
      await command.execute(interaction);
      console.log(`✅ Command ${interaction.commandName} executed successfully`);
    } catch (error) {
      console.error('❌ Error executing command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ There was an error while executing this command.',
          ephemeral: true
        });
      }
    }
  }
};
