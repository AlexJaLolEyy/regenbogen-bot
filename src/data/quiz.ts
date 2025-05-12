export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct answer in options array
    category: 'general' | 'science' | 'history' | 'geography' | 'entertainment';
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string; // Optional explanation of the correct answer
}

export const quizQuestions: QuizQuestion[] = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        category: "geography",
        difficulty: "easy"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        category: "science",
        difficulty: "easy",
        explanation: "Mars is called the Red Planet because of the iron oxide (rust) on its surface."
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctAnswer: 2,
        category: "entertainment",
        difficulty: "medium"
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correctAnswer: 2,
        category: "science",
        difficulty: "medium",
        explanation: "Au comes from the Latin word 'aurum' meaning gold."
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1945", "1947", "1950"],
        correctAnswer: 1,
        category: "history",
        difficulty: "medium"
    }
    // Add more questions here...
]; 