export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  categoryId: string;
  categoryName: string;
  answers: Answer[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  text: string;
  image?: string;
  categoryId: string;
  answers: CreateAnswerRequest[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CreateAnswerRequest {
  text: string;
  isCorrect: boolean;
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {
  id: string;
  isActive: boolean;
}

export interface BulkImportRequest {
  file: File;
  categoryId: string;
}

export interface BulkImportResult {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}
