import quizData from './quiz.json';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct answer in options array
    category: 'general' | 'science' | 'history' | 'geography' | 'entertainment' | 'philosophy' | 'art' | 'literature' | 'tech' | 'sports' | 'language';
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    explanation?: string; // Optional explanation of the correct answer
}

export const quizQuestions: QuizQuestion[] = quizData.questions as QuizQuestion[]; 