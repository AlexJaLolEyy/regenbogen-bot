import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Message } from 'discord.js';
import { EmbedUtil } from '../../lib/utils/embed';
import { Logger } from '../../lib/utils/logger';
import { quizQuestions } from '../../data/quiz';

interface QuizState {
    currentQuestion: number;
    score: number;
    questions: typeof quizQuestions;
    startTime: number;
    message?: Message;
    timeout?: NodeJS.Timeout;
    collector?: any;
    answered: boolean;
    questionHistory: {
        question: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
}

const activeQuizzes = new Map<string, QuizState>();

export const data = new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Start a quiz game')
    .addStringOption(option =>
        option.setName('category')
            .setDescription('Quiz category')
            .setRequired(false)
            .addChoices(
                { name: 'General', value: 'general' },
                { name: 'Science', value: 'science' },
                { name: 'History', value: 'history' },
                { name: 'Geography', value: 'geography' },
                { name: 'Entertainment', value: 'entertainment' },
                { name: 'Philosophy', value: 'philosophy' },
                { name: 'Art', value: 'art' },
                { name: 'Literature', value: 'literature' },
                { name: 'Tech', value: 'tech' },
                { name: 'Sports', value: 'sports' },
                { name: 'Language', value: 'language' }
            ))
    .addStringOption(option =>
        option.setName('difficulty')
            .setDescription('Quiz difficulty')
            .setRequired(false)
            .addChoices(
                { name: 'Easy', value: 'easy' },
                { name: 'Medium', value: 'medium' },
                { name: 'Hard', value: 'hard' },
                { name: 'Extreme', value: 'extreme' }
            ));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        // Check if user already has an active quiz
        if (activeQuizzes.has(interaction.user.id)) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', 'You already have an active quiz! Please finish it first.')],
                ephemeral: true
            });
        }

        const category = interaction.options.getString('category');
        const difficulty = interaction.options.getString('difficulty');

        // Filter questions by category and difficulty if specified
        let filteredQuestions = quizQuestions;
        if (category) {
            filteredQuestions = filteredQuestions.filter(q => q.category === category);
        }
        if (difficulty) {
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
        }

        if (filteredQuestions.length === 0) {
            return interaction.reply({
                embeds: [EmbedUtil.error('Error', 'No questions found for the selected category and difficulty!')],
                ephemeral: true
            });
        }

        // Shuffle questions and take first 5
        const questions = filteredQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        // Initialize quiz state
        const quizState: QuizState = {
            currentQuestion: 0,
            score: 0,
            questions,
            startTime: Date.now(),
            answered: false,
            questionHistory: []
        };

        // Store quiz state
        activeQuizzes.set(interaction.user.id, quizState);

        // Show first question
        await showQuestion(interaction, quizState);

    } catch (error) {
        Logger.error('Error in quiz command:', error);
        return interaction.reply({
            embeds: [EmbedUtil.error('Error', 'An error occurred while starting the quiz.')],
            ephemeral: true
        });
    }
}

async function showQuestion(interaction: ChatInputCommandInteraction, state: QuizState) {
    // Clean up previous question's timeouts and collectors
    if (state.timeout) {
        clearTimeout(state.timeout);
    }
    if (state.collector) {
        state.collector.stop();
    }

    // Reset answered state
    state.answered = false;

    const question = state.questions[state.currentQuestion];
    if (!question) return;

    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`Question ${state.currentQuestion + 1} of ${state.questions.length}`)
        .setDescription(question.question)
        .addFields(
            { name: 'Category', value: question.category.charAt(0).toUpperCase() + question.category.slice(1), inline: true },
            { name: 'Difficulty', value: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1), inline: true },
            { name: 'Score', value: `${state.score}/${state.currentQuestion}`, inline: true }
        );

    // Create answer buttons
    const buttons = question.options.map((option, index) => 
        new ButtonBuilder()
            .setCustomId(`answer_${index}`)
            .setLabel(option)
            .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttons);

    // If this is the first question, use reply, otherwise edit the existing message
    if (!state.message) {
        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
        state.message = response;
    } else {
        await state.message.edit({
            embeds: [embed],
            components: [row]
        });
    }

    // Create button collector
    const collector = state.message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 30000 // 30 seconds
    });

    state.collector = collector;

    collector.on('collect', async i => {
        if (state.answered) return;
        state.answered = true;

        const customId = i.customId;
        if (!customId) return;

        const answerIndex = parseInt(customId.split('_')[1]);
        if (isNaN(answerIndex)) return;

        const isCorrect = answerIndex === question.correctAnswer;

        // Update score
        if (isCorrect) state.score++;

        // Add to question history
        state.questionHistory.push({
            question: question.question,
            userAnswer: question.options[answerIndex],
            correctAnswer: question.options[question.correctAnswer],
            isCorrect
        });

        // Disable all buttons
        buttons.forEach(button => button.setDisabled(true));
        
        // Update button styles
        const selectedButton = buttons[answerIndex];
        const correctButton = buttons[question.correctAnswer];
        
        if (selectedButton) {
            selectedButton.setStyle(isCorrect ? ButtonStyle.Success : ButtonStyle.Danger);
        }
        if (correctButton) {
            correctButton.setStyle(ButtonStyle.Success);
        }

        const resultEmbed = EmbedBuilder.from(embed)
            .setDescription(`${question.question}\n\n${isCorrect ? '✅ Correct!' : '❌ Wrong!'} The correct answer was: **${question.options[question.correctAnswer]}**`);

        if (question.explanation) {
            resultEmbed.addFields({ name: 'Explanation', value: question.explanation });
        }

        await i.update({
            embeds: [resultEmbed],
            components: [row]
        });

        // Wait 3 seconds before showing next question
        state.timeout = setTimeout(async () => {
            state.currentQuestion++;
            if (state.currentQuestion < state.questions.length) {
                await showQuestion(interaction, state);
            } else {
                await showResults(interaction, state);
            }
        }, 3000);
    });

    collector.on('end', async () => {
        if (!state.answered && state.message?.components[0]?.components[0]?.disabled === false) {
            // Time's up
            const timeUpEmbed = EmbedBuilder.from(embed)
                .setDescription(`${question.question}\n\n⏰ Time's up! The correct answer was: **${question.options[question.correctAnswer]}**`);

            if (question.explanation) {
                timeUpEmbed.addFields({ name: 'Explanation', value: question.explanation });
            }

            // Add to question history
            state.questionHistory.push({
                question: question.question,
                userAnswer: "Time's up",
                correctAnswer: question.options[question.correctAnswer],
                isCorrect: false
            });

            // Disable all buttons
            buttons.forEach(button => button.setDisabled(true));
            
            // Show correct answer
            const correctButton = buttons[question.correctAnswer];
            if (correctButton) {
                correctButton.setStyle(ButtonStyle.Success);
            }

            await state.message?.edit({
                embeds: [timeUpEmbed],
                components: [row]
            });

            // Wait 3 seconds before showing next question
            state.timeout = setTimeout(async () => {
                state.currentQuestion++;
                if (state.currentQuestion < state.questions.length) {
                    await showQuestion(interaction, state);
                } else {
                    await showResults(interaction, state);
                }
            }, 3000);
        }
    });
}

async function showResults(interaction: ChatInputCommandInteraction, state: QuizState) {
    // Clean up any remaining timeouts
    if (state.timeout) {
        clearTimeout(state.timeout);
    }
    if (state.collector) {
        state.collector.stop();
    }

    const duration = Math.round((Date.now() - state.startTime) / 1000);
    const percentage = Math.round((state.score / state.questions.length) * 100);

    // Get category and difficulty from first question
    const firstQuestion = state.questions[0];
    if (!firstQuestion) return;

    const category = firstQuestion.category.charAt(0).toUpperCase() + firstQuestion.category.slice(1);
    const difficulty = firstQuestion.difficulty.charAt(0).toUpperCase() + firstQuestion.difficulty.slice(1);

    // Create main results embed
    const mainEmbed = new EmbedBuilder()
        .setColor(percentage >= 70 ? '#00FF00' : percentage >= 40 ? '#FFD700' : '#FF0000')
        .setTitle('Quiz Complete!')
        .setDescription(`You scored **${state.score}/${state.questions.length}** (${percentage}%)`)
        .addFields(
            { name: 'Time Taken', value: `${duration} seconds`, inline: true },
            { name: 'Category', value: category, inline: true },
            { name: 'Difficulty', value: difficulty, inline: true }
        );

    // Create detailed results embed
    const detailsEmbed = new EmbedBuilder()
        .setColor(percentage >= 70 ? '#00FF00' : percentage >= 40 ? '#FFD700' : '#FF0000')
        .setTitle('Question Details')
        .setDescription('Here\'s how you did on each question:');

    // Add each question to the details embed
    state.questionHistory.forEach((q, index) => {
        detailsEmbed.addFields({
            name: `Question ${index + 1}`,
            value: `**Q:** ${q.question}\n**Your Answer:** ${q.userAnswer} ${q.isCorrect ? '✅' : '❌'}\n**Correct Answer:** ${q.correctAnswer}`
        });
    });

    // Send both embeds
    await state.message?.edit({
        embeds: [mainEmbed, detailsEmbed],
        components: []
    });

    // Clean up
    activeQuizzes.delete(interaction.user.id);
} 