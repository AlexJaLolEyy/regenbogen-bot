import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';

// Command categories and their descriptions
const CATEGORIES = {
    general: {
        name: '🎮 General',
        description: 'General purpose commands',
        commands: {
            help: 'Shows this help message',
            poll: 'Create a poll with multiple options',
            coinflip: 'Flip a coin (optional bet on heads/tails)',
            dice: 'Roll dice or generate random numbers'
        }
    },
    fun: {
        name: '🎲 Fun',
        description: 'Fun and entertainment commands',
        commands: {
            joke: 'Get a random joke',
            quiz: 'Start a quiz game'
        }
    }
};

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('Get detailed help for a specific command')
            .setRequired(false)
            .addChoices(
                { name: 'Poll', value: 'poll' },
                { name: 'Coinflip', value: 'coinflip' },
                { name: 'Dice', value: 'dice' },
                { name: 'Joke', value: 'joke' },
                { name: 'Quiz', value: 'quiz' }
            ));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();

        const specificCommand = interaction.options.getString('command');

        if (specificCommand) {
            // Show detailed help for specific command
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`Command: /${specificCommand}`);

            switch (specificCommand) {
                case 'poll':
                    embed.setDescription('Create a poll with multiple options')
                        .addFields(
                            { name: 'Usage', value: '`/poll question:"Your question" option1:"Option 1" option2:"Option 2" [option3-10] [duration] [multiplechoice]`' },
                            { name: 'Options', value: 
                                '• `question`: The poll question\n' +
                                '• `option1-10`: Poll options (2-10 options)\n' +
                                '• `duration`: How long the poll lasts (e.g., "30m", "2h", "1d")\n' +
                                '• `multiplechoice`: Allow multiple votes'
                            },
                            { name: 'Example', value: '`/poll question:"Favorite color?" option1:"Red" option2:"Blue" option3:"Green" duration:"1d"`' }
                        );
                    break;

                case 'coinflip':
                    embed.setDescription('Flip a coin with optional betting')
                        .addFields(
                            { name: 'Usage', value: '`/coinflip [bet]`' },
                            { name: 'Options', value: 
                                '• `bet`: Optional bet on heads or tails'
                            },
                            { name: 'Example', value: '`/coinflip bet:heads`' }
                        );
                    break;

                case 'dice':
                    embed.setDescription('Roll dice or generate random numbers')
                        .addFields(
                            { name: 'Usage', value: '`/dice standard [amount]` or `/dice custom min:number max:number`' },
                            { name: 'Options', value: 
                                '• `standard`: Roll 1-5 standard dice (1-6)\n' +
                                '• `amount`: How many dice to roll (1-5)\n' +
                                '• `custom`: Generate a random number in a range\n' +
                                '• `min`: Minimum number\n' +
                                '• `max`: Maximum number'
                            },
                            { name: 'Examples', value: 
                                '`/dice standard amount:3`\n' +
                                '`/dice custom min:1 max:100`'
                            }
                        );
                    break;

                case 'joke':
                    embed.setDescription('Get a random joke')
                        .addFields(
                            { name: 'Usage', value: '`/joke`' },
                            { name: 'Note', value: 'This command will return a random joke from our collection.' }
                        );
                    break;

                case 'quiz':
                    embed.setDescription('Start a quiz game')
                        .addFields(
                            { name: 'Usage', value: '`/quiz`' },
                            { name: 'Note', value: 'This will start an interactive quiz game with multiple choice questions.' }
                        );
                    break;
            }

            return interaction.editReply({ embeds: [embed] });
        }

        // Show general help with all commands
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📚 Command Help')
            .setDescription('Here are all available commands. Use `/help command:command_name` for detailed information about a specific command.');

        // Add each category
        for (const [category, info] of Object.entries(CATEGORIES)) {
            const commandList = Object.entries(info.commands)
                .map(([cmd, desc]) => `\`/${cmd}\` - ${desc}`)
                .join('\n');

            embed.addFields({
                name: info.name,
                value: commandList,
                inline: false
            });
        }

        // Add footer with tip
        embed.setFooter({ 
            text: 'Tip: Use /help command:command_name for detailed information about a specific command'
        });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        Logger.error('Error in help command:', error);
        return interaction.editReply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while fetching help information.')]
        });
    }
}
