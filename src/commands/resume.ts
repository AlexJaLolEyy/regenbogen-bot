import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the currently paused song');

export async function execute(interaction: any, client: any) {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue || !queue.playing) return interaction.reply('There is no music playing right now!');

    queue.setPaused(false);
    return interaction.reply('▶️ Resumed the song!');
}
