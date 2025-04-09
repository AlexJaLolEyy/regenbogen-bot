import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the song queue');

export async function execute(interaction: any, client: any) {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue || !queue.playing) {
        return interaction.reply('There is no music playing right now!');
    }

    const tracks = queue.tracks.map((track, i) => `${i + 1}. **${track.title}**`);
    const currentTrack = queue.current;

    return interaction.reply({
        content: `🎶 Now Playing: **${currentTrack.title}**\n\n**Queue:**\n${tracks.join('\n')}`,
        flags: MessageFlags.Ephemeral,
    });
}
