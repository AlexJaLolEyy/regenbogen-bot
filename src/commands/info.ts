import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { player } from '../lib/player';

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get bot information');

export async function execute(interaction: CommandInteraction) {
    try {
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();

        console.log(`🔍 Info command received from ${interaction.user.tag}`);
        
        const guildCount = interaction.client.guilds.cache.size;
        const queueCount = player.queues.cache.size;
        const extractorCount = player.extractors.store.size;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🤖 Bot Information')
            .setDescription('Here\'s some information about the bot!')
            .addFields(
                { name: '🏰 Guilds', value: guildCount.toString(), inline: true },
                { name: '🎵 Active Queues', value: queueCount.toString(), inline: true },
                { name: '🔌 Extractors', value: extractorCount.toString(), inline: true },
                { name: '🔄 Player Status', value: '✅ Ready', inline: true },
                { name: '⏱️ Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: '📊 Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true }
            )
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Info command error:', error);
        try {
            return interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while fetching bot information.')
                ]
            });
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
} 