import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { isGuildLoading } from '../../lib/music/player';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';
import { player } from '../../lib/music/player';

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('The song to play')
            .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();

        if (!interaction.guild) {
            return interaction.editReply({ 
                embeds: [EmbedUtil.error('Error', 'This command can only be used in a server!')]
            });
        }

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.voice.channel) {
            return interaction.editReply({ 
                embeds: [EmbedUtil.error('Error', 'You need to be in a voice channel to use this command!')]
            });
        }

        // Check if the guild is in a loading state
        if (isGuildLoading(interaction.guildId!)) {
            return interaction.editReply({ 
                embeds: [EmbedUtil.warning('Please Wait', 'The player is still processing the previous request. Please try again in a few seconds.')]
            });
        }

        const query = interaction.options.getString('query', true);

        const { track } = await player.play(member.voice.channel, query, {
            nodeOptions: {
                metadata: interaction,
                selfDeaf: true,
                volume: 100,
                leaveOnEnd: true,
                leaveOnEndCooldown: 30000,
                leaveOnStop: true,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 30000
            }
        });

        const embed = EmbedUtil.success('Added to Queue', `**${track.title}**`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested by', value: interaction.user.toString(), inline: true }
            )
            .setFooter({ text: 'Enjoy your music! 🎶' });

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        Logger.error('Error in play command:', error);
        try {
            return interaction.editReply({ 
                embeds: [EmbedUtil.error('Error', 'An error occurred while trying to play the track.')]
            });
        } catch (e) {
            Logger.error('Failed to send error message:', e);
        }
    }
}
