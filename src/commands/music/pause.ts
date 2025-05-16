import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing track');

export async function execute(interaction: ChatInputCommandInteraction) {
    console.log(`⏸️ Pause command received from ${interaction.user.tag}`);
    
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId!);

    if (!queue || !queue.isPlaying()) {
        return interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No music is currently playing.')
            ],
            ephemeral: true 
        });
    }

    const currentTrack = queue.currentTrack;
    queue.node.pause();
    console.log('✅ Music paused');

    const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('⏸️ Music Paused')
        .setDescription(`**${currentTrack?.title || 'Unknown Track'}**`)
        .setThumbnail(currentTrack?.thumbnail || null)
        .addFields(
            { name: 'Duration', value: currentTrack?.duration || 'Unknown', inline: true },
            { name: 'Requested by', value: currentTrack?.requestedBy?.toString() || 'Unknown', inline: true }
        )
        .setFooter({ text: 'Use /resume to continue playing! 🎶' });

    return interaction.reply({ embeds: [embed] });
}
