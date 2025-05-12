import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';

// Dice face representations
const DICE_FACES: { [key: number]: string } = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
};

// Dice ASCII art
const DICE_ASCII: { [key: number]: string } = {
    1: '┌─────┐\n│     │\n│  ●  │\n│     │\n└─────┘',
    2: '┌─────┐\n│ ●   │\n│     │\n│   ● │\n└─────┘',
    3: '┌─────┐\n│ ●   │\n│  ●  │\n│   ● │\n└─────┘',
    4: '┌─────┐\n│ ● ● │\n│     │\n│ ● ● │\n└─────┘',
    5: '┌─────┐\n│ ● ● │\n│  ●  │\n│ ● ● │\n└─────┘',
    6: '┌─────┐\n│ ● ● │\n│ ● ● │\n│ ● ● │\n└─────┘'
};

export const data = new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice or generate a random number')
    .addSubcommand(subcommand =>
        subcommand
            .setName('standard')
            .setDescription('Roll a standard dice (1-6)')
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('How many dice to roll (1-5)')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(5)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('custom')
            .setDescription('Generate a random number in a custom range')
            .addIntegerOption(option =>
                option.setName('min')
                    .setDescription('Minimum number')
                    .setRequired(true)
                    .setMinValue(-1000000)
                    .setMaxValue(1000000))
            .addIntegerOption(option =>
                option.setName('max')
                    .setDescription('Maximum number')
                    .setRequired(true)
                    .setMinValue(-1000000)
                    .setMaxValue(1000000)));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        let results: number[] = [];
        let title = '';
        let description = '';

        if (subcommand === 'standard') {
            const amount = interaction.options.getInteger('amount') ?? 1;
            results = Array.from({ length: amount }, () => Math.floor(Math.random() * 6) + 1);
            title = '🎲 Dice Roll';
            description = `You rolled ${amount} dice${amount > 1 ? 's' : ''}!`;
        } else {
            const min = interaction.options.getInteger('min', true);
            const max = interaction.options.getInteger('max', true);
            
            if (min >= max) {
                return interaction.editReply({
                    embeds: [EmbedUtil.error('Invalid Range', 'The minimum number must be less than the maximum number.')]
                });
            }

            results = [Math.floor(Math.random() * (max - min + 1)) + min];
            title = '🎯 Random Number';
            description = `Random number between ${min} and ${max}`;
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(title)
            .setDescription(description);

        if (subcommand === 'standard') {
            // Add dice faces and ASCII art
            const diceDisplay = results.map(r => DICE_FACES[r]).join(' ');
            const asciiDisplay = results.map(r => DICE_ASCII[r]).join('\n');
            
            embed.addFields(
                { name: 'Dice Faces', value: diceDisplay, inline: true },
                { name: 'Results', value: results.map(r => `**${r}**`).join(', '), inline: true }
            );

            if (results.length > 1) {
                const sum = results.reduce((a, b) => a + b, 0);
                embed.addFields({ name: 'Total', value: `**${sum}**`, inline: true });
            }

            // Add ASCII art in code block
            embed.addFields({ name: 'Dice Display', value: '```\n' + asciiDisplay + '\n```' });
        } else {
            // For custom range, just show the result
            embed.addFields({
                name: 'Result',
                value: `**${results[0]}**`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        Logger.error('Error in dice command:', error);
        return interaction.editReply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while rolling the dice.')]
        });
    }
}
