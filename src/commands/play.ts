import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { isGuildLoading } from '../lib/player';

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
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('This command can only be used in a server!')
                ]
            });
        }

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.voice.channel) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('You need to be in a voice channel to use this command!')
                ]
            });
        }

        // Check if the guild is in a loading state
        if (isGuildLoading(interaction.guildId!)) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setTitle('⏳ Please Wait')
                        .setDescription('The player is still processing the previous request. Please try again in a few seconds.')
                ]
            });
        }

        const query = interaction.options.getString('query', true);
        const player = useMainPlayer();

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

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Added to Queue')
            .setDescription(`**${track.title}**`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested by', value: interaction.user.toString(), inline: true }
            )
            .setFooter({ text: 'Enjoy your music! 🎶' });

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in play command:', error);
        try {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while trying to play the track.')
                ]
            });
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
}
