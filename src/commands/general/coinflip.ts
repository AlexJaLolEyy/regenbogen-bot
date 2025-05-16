import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';

export const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin')
    .addStringOption(option =>
        option.setName('bet')
            .setDescription('What you think the result will be (heads/tails)')
            .setRequired(false)
            .addChoices(
                { name: 'Heads', value: 'heads' },
                { name: 'Tails', value: 'tails' }
            ));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();

        const bet = interaction.options.getString('bet');
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = bet ? bet === result : null;

        // Create initial embed with spinning animation
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🪙 Flipping Coin...')
            .setDescription('The coin is spinning in the air...')
            .setThumbnail('https://media.giphy.com/media/3o7TKqnN349PBUtGFK/giphy.gif');

        const message = await interaction.editReply({ embeds: [embed] });

        // Wait 2 seconds to simulate coin flip
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update embed with result
        const resultEmbed = new EmbedBuilder()
            .setColor(won === null ? '#FFD700' : won ? '#00FF00' : '#FF0000')
            .setTitle('Coin Flip Result')
            .setDescription(
                result === 'heads' 
                    ? '🪙 The coin landed on **HEADS**!'
                    : '🪙 The coin landed on **TAILS**!'
            );

        if (bet) {
            resultEmbed.addFields({
                name: 'Your Bet',
                value: `You bet on **${bet.toUpperCase()}**\n${won ? '🎉 You won!' : '😢 You lost!'}`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [resultEmbed] });

    } catch (error) {
        Logger.error('Error in coinflip command:', error);
        return interaction.editReply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while flipping the coin.')]
        });
    }
} 