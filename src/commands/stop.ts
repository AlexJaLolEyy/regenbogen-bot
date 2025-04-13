import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('🛑 Stop playback and clear the queue'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    queue.delete();
    return interaction.reply({ content: '🛑 Stopped playback and cleared the queue.', ephemeral: true });
  }
};
