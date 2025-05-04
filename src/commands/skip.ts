import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { isGuildLoading } from '../lib/player';

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song');

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

        const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guildId!);

        if (!queue || !queue.isPlaying()) {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('There is no song playing to skip!')
                ]
            });
        }

        const currentTrack = queue.currentTrack;
        const success = queue.node.skip();

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('⏭️ Skipped')
                .setDescription(`Skipped **${currentTrack?.title}**`)
                .setFooter({ text: 'Requested by ' + interaction.user.username });

            return interaction.editReply({ embeds: [embed] });
        } else {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('Failed to skip the current song.')
                ]
            });
        }
    } catch (error) {
        console.error('Error in skip command:', error);
        try {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while trying to skip the track.')
                ]
            });
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
}
