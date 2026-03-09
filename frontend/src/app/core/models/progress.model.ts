export interface ProgressSummary {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsAnswered: number;
  correctAnswersTotal: number;
  accuracyPercentage: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
  examHistory: ExamHistoryEntry[];
}

export interface ExamHistoryEntry {
  date: string;
  score: number;
  type: string;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  progressPercentage: number;
  lastPracticed?: string;
}

export interface WeakArea {
  categoryId: string;
  categoryName: string;
  accuracy: number;
  totalAttempts: number;
  recommendedPractice: number;
  commonMistakes: string[];
}

export interface DailyProgress {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  examsCompleted: number;
  timeSpentMinutes: number;
}
