import type { Interaction } from 'discord.js';
import { client } from '../index.js';

export const event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

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
