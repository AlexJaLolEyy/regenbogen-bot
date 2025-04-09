import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear the queue');

export async function execute(interaction: any, client: any) {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue || !queue.playing) return interaction.reply('There is no music playing right now!');

    queue.destroy();
    return interaction.reply('⏹️ Stopped playback and cleared the queue!');
}
