import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { QueryType } from 'discord-player';
import { player } from '../index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube or Spotify')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true);

    const channel = interaction.member?.voice?.channel;
    if (!channel) {
      return interaction.reply({
        content: '🔊 You need to be in a voice channel to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO
    });

    if (!searchResult || !searchResult.tracks.length) {
      return interaction.editReply('❌ No results found.');
    }

    const queue = await player.nodes.create(interaction.guild!, {
      metadata: {
        channel: interaction.channel
      },
      selfDeaf: true,
      volume: 75
    });

    if (!queue.connection) await queue.connect(channel);

    queue.addTrack(searchResult.tracks[0]);
    if (!queue.isPlaying()) await queue.node.play();

    interaction.editReply(`🎶 Added **${searchResult.tracks[0].title}** to the queue.`);
  }
};
