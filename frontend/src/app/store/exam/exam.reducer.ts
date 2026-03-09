import { createReducer, on } from '@ngrx/store';
import { Exam, ExamResult } from '../../core/models/exam.model';
import * as ExamActions from './exam.actions';

export interface ExamState {
  currentExam: Exam | null;
  currentQuestionIndex: number;
  examResult: ExamResult | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  timeElapsed: number;
}

export const initialState: ExamState = {
  currentExam: null,
  currentQuestionIndex: 0,
  examResult: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  timeElapsed: 0,
};

export const examReducer = createReducer(
  initialState,

  on(ExamActions.startExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    examResult: null,
    currentQuestionIndex: 0,
    timeElapsed: 0,
  })),
  on(ExamActions.startExamSuccess, (state, { exam }) => ({
    ...state,
    currentExam: exam,
    isLoading: false,
  })),
  on(ExamActions.startExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(ExamActions.loadExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadExamSuccess, (state, { exam }) => ({
    ...state,
    currentExam: exam,
    isLoading: false,
  })),
  on(ExamActions.loadExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(ExamActions.submitAnswer, (state) => ({
    ...state,
    isSubmitting: true,
  })),
  on(ExamActions.submitAnswerSuccess, (state, { questionId, answerId, isCorrect }) => {
    if (!state.currentExam) return { ...state, isSubmitting: false };

    const updatedQuestions = state.currentExam.questions.map((q) =>
      q.questionId === questionId
        ? { ...q, selectedAnswerId: answerId, isCorrect, isAnswered: true }
        : q
    );

    return {
      ...state,
      isSubmitting: false,
      currentExam: {
        ...state.currentExam,
        questions: updatedQuestions,
        answeredQuestions: updatedQuestions.filter((q) => q.isAnswered).length,
        correctAnswers: updatedQuestions.filter((q) => q.isCorrect === true).length,
        wrongAnswers: updatedQuestions.filter((q) => q.isCorrect === false).length,
      },
    };
  }),
  on(ExamActions.submitAnswerFailure, (state, { error }) => ({
    ...state,
    isSubmitting: false,
    error,
  })),

  on(ExamActions.navigateToQuestion, (state, { index }) => ({
    ...state,
    currentQuestionIndex: index,
  })),

  on(ExamActions.markQuestionSuccess, (state, { questionId, marked }) => {
    if (!state.currentExam) return state;

    const updatedQuestions = state.currentExam.questions.map((q) =>
      q.questionId === questionId ? { ...q, isMarked: marked } : q
    );

    return {
      ...state,
      currentExam: {
        ...state.currentExam,
        questions: updatedQuestions,
      },
    };
  }),

  on(ExamActions.finishExam, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(ExamActions.finishExamSuccess, (state, { result }) => ({
    ...state,
    examResult: result,
    isLoading: false,
    currentExam: result.exam,
  })),
  on(ExamActions.finishExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(ExamActions.abandonExamSuccess, (state) => ({
    ...state,
    currentExam: null,
    currentQuestionIndex: 0,
    timeElapsed: 0,
  })),

  on(ExamActions.clearExam, () => ({
    ...initialState,
  })),

  on(ExamActions.tickTimer, (state) => ({
    ...state,
    timeElapsed: state.timeElapsed + 1,
  }))
);
