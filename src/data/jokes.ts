export interface Joke {
    setup: string;
    punchline: string;
    category: 'general' | 'programming' | 'dad' | 'knock-knock';
}

export const jokes: Joke[] = [
    {
        setup: "Why don't scientists trust atoms?",
        punchline: "Because they make up everything!",
        category: "general"
    },
    {
        setup: "Why did the scarecrow win an award?",
        punchline: "Because he was outstanding in his field!",
        category: "general"
    },
    {
        setup: "What do you call a fake noodle?",
        punchline: "An impasta!",
        category: "dad"
    },
    {
        setup: "Why did the programmer quit their job?",
        punchline: "Because they didn't get arrays!",
        category: "programming"
    },
    {
        setup: "Knock knock",
        punchline: "Who's there?",
        category: "knock-knock"
    }
    // Add more jokes here...
]; 