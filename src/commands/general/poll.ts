import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, MessageReaction, User, Message } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';

const activePolls = new Map<string, {
    messageId: string;
    channelId: string;
    options: string[];
    votes: Map<string, Set<string>>;
    multipleChoice: boolean;
    endTime: number;
    creatorId: string;
}>();

export const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
        option.setName('question')
            .setDescription('The poll question')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('option1')
            .setDescription('First option')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('option2')
            .setDescription('Second option')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('option3')
            .setDescription('Third option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option4')
            .setDescription('Fourth option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option5')
            .setDescription('Fifth option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option6')
            .setDescription('Sixth option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option7')
            .setDescription('Seventh option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option8')
            .setDescription('Eighth option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option9')
            .setDescription('Ninth option')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('option10')
            .setDescription('Tenth option')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('multiplechoice')
            .setDescription('Allow users to vote for multiple options')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('duration')
            .setDescription('Duration (e.g., "30m" for 30 minutes, "2h" for 2 hours, "1d" for 1 day)')
            .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply();

        const question = interaction.options.getString('question', true);
        const multipleChoice = interaction.options.getBoolean('multiplechoice') ?? false;
        
        const options: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const option = interaction.options.getString(`option${i}`);
            if (option) options.push(option);
        }

        if (options.length < 2) {
            return interaction.editReply({
                embeds: [EmbedUtil.error('Error', 'You need to provide at least 2 options for the poll!')]
            });
        }

        const durationStr = interaction.options.getString('duration') ?? '1h';
        const duration = parseDuration(durationStr);
        if (!duration) {
            return interaction.editReply({
                embeds: [EmbedUtil.error('Error', 'Invalid duration format. Use format like "30m", "2h", or "1d"')]
            });
        }

        const endTime = Date.now() + duration;
        const endDate = new Date(endTime);

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📊 Poll')
            .setDescription(`**${question}**\n\n${multipleChoice ? '*(Multiple choice poll)*' : ''}`)
            .addFields(
                options.map((option, index) => ({
                    name: `${getEmoji(index)} ${option}`,
                    value: '0 votes',
                    inline: false
                }))
            )
            .setFooter({ 
                text: `Poll by ${interaction.user.tag} • ${multipleChoice ? 'React to vote' : 'React once to vote'} • Ends at ${endDate.toLocaleString()}`
            });

        const pollMessage = await interaction.editReply({ embeds: [embed] });

        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(getEmoji(i));
        }

        const pollId = `${interaction.guildId}-${pollMessage.id}`;
        const votes = new Map<string, Set<string>>();
        options.forEach(opt => votes.set(opt, new Set<string>()));
        
        const pollData = {
            messageId: pollMessage.id,
            channelId: interaction.channelId,
            options,
            votes,
            multipleChoice,
            endTime,
            creatorId: interaction.user.id
        };
        activePolls.set(pollId, pollData);

        await interaction.followUp({ 
            content: 'Don\'t forget to vote on your poll! Click the reactions to cast your vote.',
            ephemeral: true 
        });

        const filter = (reaction: MessageReaction, user: User) => {
            return !user.bot && options.some((_, index) => reaction.emoji.name === getEmoji(index));
        };

        const collector = pollMessage.createReactionCollector({ 
            filter,
            time: duration
        });

        collector.on('collect', async (reaction, user) => {
            const poll = activePolls.get(pollId);
            if (!poll) return;

            const optionIndex = options.findIndex((_, i) => getEmoji(i) === reaction.emoji.name);
            if (optionIndex === -1) return;

            const option = options[optionIndex];
            if (!option) return;

            const userVotes = poll.votes.get(option);
            if (!userVotes) return;

            if (userVotes.has(user.id)) {
                userVotes.delete(user.id);
                await reaction.users.remove(user.id);
            } else {
                if (!poll.multipleChoice) {
                    for (const [opt, votes] of poll.votes.entries()) {
                        if (opt !== option && votes.has(user.id)) {
                            votes.delete(user.id);
                            const otherReaction = pollMessage.reactions.cache.get(getEmoji(options.indexOf(opt)));
                            if (otherReaction) {
                                await otherReaction.users.remove(user.id);
                            }
                        }
                    }
                }
                userVotes.add(user.id);
            }

            await updatePollEmbed(pollMessage, poll);
        });

        collector.on('end', async () => {
            const poll = activePolls.get(pollId);
            if (!poll) return;

            await updatePollEmbed(pollMessage, poll, true);
            activePolls.delete(pollId);
        });

    } catch (error) {
        Logger.error('Error in poll command:', error);
        return interaction.editReply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while creating the poll.')]
        });
    }
}

function getEmoji(index: number): string {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[index] || '❓';
}

function parseDuration(durationStr: string): number | null {
    const match = durationStr.match(/^(\d+)([mhd])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    if (!amount || !unit) return null;
    
    const num = parseInt(amount);
    if (isNaN(num)) return null;

    switch (unit) {
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'd': return num * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

async function updatePollEmbed(message: Message, poll: {
    options: string[];
    votes: Map<string, Set<string>>;
    multipleChoice: boolean;
    endTime: number;
    creatorId: string;
}, isFinal: boolean = false) {
    try {
        if (!message.embeds[0]) return;
        const embed = EmbedBuilder.from(message.embeds[0]);
        if (!embed) return;
        
        let totalVotes = 0;
        const voteCounts = new Map<string, number>();
        
        poll.options.forEach((option) => {
            const votes = poll.votes.get(option)?.size ?? 0;
            voteCounts.set(option, votes);
            totalVotes += votes;
        });

        poll.options.forEach((option, index) => {
            const votes = voteCounts.get(option) ?? 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const progressBar = createProgressBar(percentage);
            
            const field = embed.data.fields?.[index];
            if (field) {
                field.value = `${progressBar} ${votes} vote${votes !== 1 ? 's' : ''} (${percentage}%)`;
            }
        });

        if (isFinal) {
            embed.setFooter({ text: 'Poll ended' });
        } else {
            const endDate = new Date(poll.endTime);
            const userTag = message.interaction?.user.tag || 'Unknown';
            embed.setFooter({ 
                text: `Poll by ${userTag} • ${poll.multipleChoice ? 'React to vote' : 'React once to vote'} • Ends at ${endDate.toLocaleString()}`
            });
        }

        await message.edit({ embeds: [embed] });
    } catch (error) {
        Logger.error('Error updating poll embed:', error);
    }
}

function createProgressBar(percentage: number): string {
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    return `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}]`;
}
