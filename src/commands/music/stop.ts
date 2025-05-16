import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('🛑 Stop playback and clear the queue');

export async function execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if (!queue || !queue.node.isPlaying()) {
        return interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Nothing is playing!')
            ],
            ephemeral: true 
        });
    }

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🛑 Playback Stopped')
        .setDescription('The queue has been cleared and playback has been stopped.')
        .setFooter({ text: 'Use /play to start playing music again! 🎶' });

    queue.delete();
    return interaction.reply({ embeds: [embed] });
}
