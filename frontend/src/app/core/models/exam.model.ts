export interface Exam {
  id: string;
  userId: string;
  type: 'full' | 'category' | 'quick' | 'mock';
  categoryId?: string;
  categoryName?: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  score: number;
  timeLimitMinutes: number;
  timeSpentSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  questionId: string;
  question: {
    id: string;
    text: string;
    image?: string;
    categoryName: string;
    answers: ExamAnswer[];
    explanation?: string;
  };
  selectedAnswerId?: string;
  isCorrect?: boolean;
  isAnswered: boolean;
  isMarked: boolean;
  orderIndex: number;
}

export interface ExamAnswer {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface StartExamRequest {
  type: 'full' | 'category' | 'quick' | 'mock';
  categoryId?: string;
  questionCount?: number;
  timeLimitMinutes?: number;
}

export interface SubmitAnswerRequest {
  examId: string;
  questionId: string;
  answerId: string;
}

export interface ExamResult {
  exam: Exam;
  score: number;
  passed: boolean;
  passingScore: number;
  categoryBreakdown: CategoryBreakdown[];
  wrongQuestions: ExamQuestion[];
  timeSpentFormatted: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}
