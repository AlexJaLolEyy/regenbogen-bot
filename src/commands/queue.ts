import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📜 Show the current queue'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.tracks.size) {
      return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
    }

    const tracks = queue.tracks.toArray().slice(0, 10);
    const trackList = tracks.map((track, i) => `${i + 1}. **${track.title}**`).join('\n');

    return interaction.reply({
      embeds: [{
        title: '📜 Current Queue',
        description: trackList,
        color: 0x00AE86,
      }],
      ephemeral: true
    });
  }
};
