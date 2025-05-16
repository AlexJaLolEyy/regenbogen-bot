import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Logger } from '../../lib/utils/logger';
import { version } from '../../../package.json';

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Shows information about the bot');

export async function execute(interaction: any) {
    try {
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🌈 Rainbow Bot Info')
            .setDescription('A versatile Discord bot with music, gaming, and general features!')
            .addFields(
                { 
                    name: '📊 Bot Stats', 
                    value: `• Version: ${version}\n• Servers: ${interaction.client.guilds.cache.size}\n• Users: ${interaction.client.users.cache.size}\n• Uptime: ${formatUptime(interaction.client.uptime)}`,
                    inline: false 
                },
                { 
                    name: '🎵 Music Features', 
                    value: '• Play music from YouTube, Spotify, and more\n• Queue management\n• Volume control\n• Playlist support\n• Audio effects',
                    inline: true 
                },
                { 
                    name: '🎮 Gaming Features', 
                    value: '• Coming soon!\n• Game tracking\n• Leaderboards\n• Custom commands',
                    inline: true 
                },
                { 
                    name: '🎲 General Features', 
                    value: '• Polls with multiple choice\n• Dice rolling\n• Jokes and fun commands\n• Server management\n• User information',
                    inline: true 
                }
            )
            .setFooter({ text: 'Made with ❤️ by Alex' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        Logger.success('Info command executed successfully');
    } catch (error) {
        Logger.error('Error in info command:', error);
        await interaction.reply({ content: '❌ An error occurred while fetching bot info.', ephemeral: true });
    }
}

function formatUptime(uptime: number): string {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
} 