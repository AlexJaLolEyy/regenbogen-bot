import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';
import { jokes } from '../../data/jokes';

export const data = new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke')
    .addStringOption(option =>
        option.setName('category')
            .setDescription('Joke category')
            .setRequired(false)
            .addChoices(
                { name: 'General', value: 'general' },
                { name: 'Programming', value: 'programming' },
                { name: 'Dad Jokes', value: 'dad' },
                { name: 'Knock-Knock', value: 'knock-knock' }
            ));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const category = interaction.options.getString('category');
        
        // Filter jokes by category if specified
        const filteredJokes = category 
            ? jokes.filter(joke => joke.category === category)
            : jokes;

        if (filteredJokes.length === 0) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', 'No jokes found in this category!')],
                ephemeral: true
            });
        }

        // Get random joke
        const joke = filteredJokes[Math.floor(Math.random() * filteredJokes.length)];
        if (!joke) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', 'Failed to get a joke!')],
                ephemeral: true
            });
        }

        // Create embed with setup
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎭 Random Joke')
            .setDescription(joke.setup)
            .setFooter({ text: `Category: ${joke.category.charAt(0).toUpperCase() + joke.category.slice(1)}` });

        // Create reveal button
        const revealButton = new ButtonBuilder()
            .setCustomId('reveal_joke')
            .setLabel('Reveal Punchline')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(revealButton);

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        // Create button collector
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 30000 // 30 seconds
        });

        collector.on('collect', async i => {
            if (i.customId === 'reveal_joke') {
                // Update embed with punchline
                const updatedEmbed = EmbedBuilder.from(embed)
                    .setDescription(`${joke.setup}\n\n**${joke.punchline}**`);

                // Disable the button
                revealButton.setDisabled(true);
                const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(revealButton);

                await i.update({
                    embeds: [updatedEmbed],
                    components: [disabledRow]
                });
            }
        });

        collector.on('end', async () => {
            // Disable button if not clicked
            const components = response.components[0]?.components[0];
            if (components && !components.disabled) {
                revealButton.setDisabled(true);
                const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(revealButton);

                await response.edit({
                    embeds: [embed],
                    components: [disabledRow]
                });
            }
        });

    } catch (error) {
        Logger.error('Error in joke command:', error);
        return interaction.reply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while fetching a joke.')],
            ephemeral: true
        });
    }
} 