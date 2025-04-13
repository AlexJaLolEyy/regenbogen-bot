import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing track'),
  async execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    queue.node.pause();
    interaction.reply('⏸️ Music paused.');
  },
};
