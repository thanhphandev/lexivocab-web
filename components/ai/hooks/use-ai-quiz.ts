import { useState } from "react";
import { aiApi } from "@/lib/api/api-client";
import type { QuizDto, ApiErrorResponse } from "@/lib/api/types";

export function useAiQuiz(word: string) {
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [quizError, setQuizError] = useState<ApiErrorResponse | null>(null);

    const fetchQuiz = async (reqModelId: string, reqProvider: string) => {
        if (!word) return;
        setIsLoadingQuiz(true);
        setSelectedOption(null);
        setIsCorrect(null);
        setQuizError(null);
        
        try {
            const res = await aiApi.getQuiz(word, reqProvider, reqModelId);
            if (res.success) {
                setQuiz(res.data);
            } else {
                setQuizError(res);
            }
        } catch (error) {
            const err = error as Error;
            setQuizError({ success: false, error: err.message || "Unexpected error occurred fetching quiz" });
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (selectedOption !== null || !quiz) return;
        setSelectedOption(index);
        setIsCorrect(index === quiz.correctIndex);
    };

    return {
        quiz,
        isLoadingQuiz,
        selectedOption,
        isCorrect,
        quizError,
        fetchQuiz,
        setQuiz,
        handleAnswer
    };
}
