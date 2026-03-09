import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamState } from './exam.reducer';

export const selectExamState = createFeatureSelector<ExamState>('exam');

export const selectCurrentExam = createSelector(selectExamState, (state) => state.currentExam);

export const selectCurrentQuestionIndex = createSelector(selectExamState, (state) => state.currentQuestionIndex);

export const selectExamResult = createSelector(selectExamState, (state) => state.examResult);

export const selectIsLoading = createSelector(selectExamState, (state) => state.isLoading);

export const selectIsSubmitting = createSelector(selectExamState, (state) => state.isSubmitting);

export const selectExamError = createSelector(selectExamState, (state) => state.error);

export const selectTimeElapsed = createSelector(selectExamState, (state) => state.timeElapsed);

export const selectCurrentQuestion = createSelector(
  selectCurrentExam,
  selectCurrentQuestionIndex,
  (exam, index) => (exam ? exam.questions[index] : null)
);

export const selectTotalQuestions = createSelector(
  selectCurrentExam,
  (exam) => exam?.questions.length || 0
);

export const selectAnsweredCount = createSelector(
  selectCurrentExam,
  (exam) => exam?.questions.filter((q) => q.isAnswered).length || 0
);

export const selectMarkedCount = createSelector(
  selectCurrentExam,
  (exam) => exam?.questions.filter((q) => q.isMarked).length || 0
);

export const selectExamProgress = createSelector(
  selectTotalQuestions,
  selectAnsweredCount,
  (total, answered) => (total > 0 ? (answered / total) * 100 : 0)
);

export const selectTimeRemaining = createSelector(
  selectCurrentExam,
  selectTimeElapsed,
  (exam, elapsed) => {
    if (!exam) return 0;
    const totalSeconds = exam.timeLimitMinutes * 60;
    return Math.max(0, totalSeconds - elapsed);
  }
);
