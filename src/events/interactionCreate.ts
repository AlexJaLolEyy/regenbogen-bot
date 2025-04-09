export const name = 'interactionCreate';
export const once = false;

export async function execute(interaction: any, client: any) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply({
                content: '❌ There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
}
