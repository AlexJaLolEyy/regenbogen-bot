import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume paused music');

export async function execute(interaction: ChatInputCommandInteraction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if (!queue || queue.node.isPlaying()) {
        return interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No paused music to resume.')
            ],
            ephemeral: true 
        });
    }

    const currentTrack = queue.currentTrack;
    queue.node.resume();

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('▶️ Music Resumed')
        .setDescription(`**${currentTrack?.title || 'Unknown Track'}**`)
        .setThumbnail(currentTrack?.thumbnail || null)
        .addFields(
            { name: 'Duration', value: currentTrack?.duration || 'Unknown', inline: true },
            { name: 'Requested by', value: currentTrack?.requestedBy?.toString() || 'Unknown', inline: true }
        )
        .setFooter({ text: 'Enjoy your music! 🎶' });

    return interaction.reply({ embeds: [embed] });
}
