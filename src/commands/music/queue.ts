import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current queue');

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();

        console.log(`📋 Queue command received from ${interaction.user.tag}`);
        
        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId!);

        if (!queue) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No queue found!')
                ]
            });
        }

        // Check if the queue is still being initialized by checking if it has a current track
        if (!queue.currentTrack && queue.tracks.size === 0) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setTitle('⏳ Queue Loading')
                        .setDescription('The queue is still being initialized. Please try again in a few seconds.')
                ]
            });
        }

        const currentTrack = queue.currentTrack;
        const upcomingTracks = queue.tracks.toArray();

        if (!currentTrack && upcomingTracks.length === 0) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('The queue is empty!')
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Music Queue')
            .setDescription('Here\'s what\'s playing and coming up next!');

        if (currentTrack) {
            embed.addFields({
                name: '🎵 Now Playing',
                value: `**${currentTrack.title}**\nDuration: ${currentTrack.duration}\nRequested by: ${currentTrack.requestedBy?.toString() || 'Unknown'}`
            });
        }

        if (upcomingTracks.length > 0) {
            const tracksList = upcomingTracks
                .slice(0, 10)
                .map((track, index) => `${index + 1}. **${track.title}** (${track.duration})`)
                .join('\n');

            embed.addFields({
                name: '📋 Upcoming Tracks',
                value: tracksList + (upcomingTracks.length > 10 ? `\n...and ${upcomingTracks.length - 10} more tracks` : '')
            });
        }

        embed.setFooter({ 
            text: `Total tracks: ${upcomingTracks.length + (currentTrack ? 1 : 0)} | Queue duration: ${queue.durationFormatted}` 
        });

        console.log('✅ Queue information sent');
        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Queue command error:', error);
        try {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while fetching the queue.')
                ]
            });
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
}
