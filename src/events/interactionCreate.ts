import type { Interaction } from 'discord.js';
import { client } from '../lib/client';

export const event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction) {
    console.log(`🔧 Interaction received: ${interaction.isChatInputCommand() ? interaction.commandName : 'non-command'}`);

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️ Command "${interaction.commandName}" not found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ Error executing command:', error);
      await interaction.reply({
        content: '❌ There was an error while executing this command.',
        ephemeral: true
      });
    }
  }
};
