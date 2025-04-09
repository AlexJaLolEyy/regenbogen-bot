export const name = 'ready';
export const once = true;

export function execute(client: any) {
    console.log(`Logged in as ${client.user.tag}!`);
}
