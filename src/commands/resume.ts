import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume paused music'),
  async execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if (!queue || queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No paused music to resume.', ephemeral: true });
    }

    queue.node.resume();
    interaction.reply('▶️ Music resumed.');
  },
};
