import { SlashCommandBuilder } from 'discord.js';
import { QueryType } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from Spotify, YouTube, or SoundCloud')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('Song name or link')
            .setRequired(true),
    );

export async function execute(interaction: any, client: any) {
    const query = interaction.options.getString('query');
    const player = client.player;

    if (!interaction.member.voice.channel) {
        return interaction.reply({
            content: 'You need to join a voice channel first!',
            ephemeral: true,
        });
    }

    await interaction.deferReply();

    try {
        const queue = await player.nodes.create(interaction.guild, {
            metadata: {
                channel: interaction.channel,
            },
        });

        if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel);
        }


        const result = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO, 
        });

        console.log('Search result:', result);

        if (!result || !result.tracks.length) {
            return interaction.editReply('❌ No results found for your query.');
        }

        const track = result.tracks[0];
        console.log('Attempting to play track:', track);

        queue.addTrack(track);
        if (!queue.isPlaying()) {
            await queue.node.play();
        }

        return interaction.editReply(`🎶 Now playing: **${track.title}**`);
    } catch (error) {
        console.error('Error in /play command:', error);

        return interaction.editReply('❌ Failed to play the requested track. Please try a different query.');
    }
}
