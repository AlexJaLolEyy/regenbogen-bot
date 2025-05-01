import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { QueryType } from 'discord-player';
import { player } from '../lib/player.js';

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
    console.log('🔧 /play command triggered');

    const query = interaction.options.getString('query', true);
    const channel = interaction.member?.voice?.channel;

    console.log(`🎧 Voice state: ${channel?.name || 'None'}`);

    if (!channel) {
      return interaction.reply({
        content: '🔊 You need to be in a voice channel to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    let searchResult = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.YOUTUBE,
    });

    console.log(`🔍 YouTube results: ${searchResult?.tracks.length || 0}`);

    if (!searchResult || !searchResult.tracks.length) {
      console.log(`⚠️ YouTube failed. Retrying AUTO...`);

      searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      console.log(`🔍 AUTO results: ${searchResult?.tracks.length || 0}`);
    }

    if (!searchResult || !searchResult.tracks.length) {
      console.log(`❌ No results for: "${query}"`);
      return interaction.editReply('❌ No results found.');
    }

    const track = searchResult.tracks[0];
    console.log(`🎶 Found: ${track.title} | ${track.url}`);

    try {
      const queue = await player.nodes.create(interaction.guild!, {
        metadata: { channel: interaction.channel },
        selfDeaf: true,
        volume: 75
      });

      if (!queue.connection) {
        await queue.connect(channel);
        console.log(`🔗 Connected to VC: ${channel.name}`);
      }

      queue.addTrack(track);

      if (!queue.isPlaying()) {
        await queue.node.play();
        console.log(`▶️ Playing: ${track.title}`);
      }

      return interaction.editReply(`🎶 Added **${track.title}** to the queue.`);
    } catch (err) {
      console.error('❌ Playback error:', err);
      return interaction.editReply('❌ Could not play the track.');
    }
  }
};
