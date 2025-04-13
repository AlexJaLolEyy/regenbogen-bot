import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip the current song'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Nothing to skip!', ephemeral: true });
    }

    queue.node.skip();
    return interaction.reply({ content: '⏭️ Skipped to the next song!', ephemeral: true });
  }
};
