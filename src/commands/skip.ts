import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the currently playing song');

export async function execute(interaction: any, client: any) {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue || !queue.playing) return interaction.reply('There is no music playing right now!');

    queue.skip();
    return interaction.reply('⏭️ Skipped the current song!');
}
