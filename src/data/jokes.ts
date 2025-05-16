import jokesData from './jokes.json';

export interface Joke {
    setup: string;
    punchline: string;
    category: 'general' | 'programming' | 'dad' | 'knock-knock' | 'math' | 'animal' | 'puns' | 'tech';
}

export const jokes: Joke[] = jokesData.jokes as Joke[]; 