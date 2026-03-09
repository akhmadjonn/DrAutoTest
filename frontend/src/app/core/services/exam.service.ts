import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Exam,
  StartExamRequest,
  SubmitAnswerRequest,
  ExamResult,
} from '../models/exam.model';
import { ApiResponse, PagedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  constructor(private api: ApiService) {}

  startExam(request: StartExamRequest): Observable<ApiResponse<Exam>> {
    return this.api.post<ApiResponse<Exam>>('/exams/start', request);
  }

  getExam(examId: string): Observable<ApiResponse<Exam>> {
    return this.api.get<ApiResponse<Exam>>(`/exams/${examId}`);
  }

  submitAnswer(request: SubmitAnswerRequest): Observable<ApiResponse<{ isCorrect: boolean; correctAnswerId: string }>> {
    return this.api.post<ApiResponse<{ isCorrect: boolean; correctAnswerId: string }>>(
      `/exams/${request.examId}/answer`,
      request
    );
  }

  markQuestion(examId: string, questionId: string): Observable<ApiResponse<{ marked: boolean }>> {
    return this.api.post<ApiResponse<{ marked: boolean }>>(`/exams/${examId}/mark/${questionId}`);
  }

  finishExam(examId: string): Observable<ApiResponse<ExamResult>> {
    return this.api.post<ApiResponse<ExamResult>>(`/exams/${examId}/finish`);
  }

  abandonExam(examId: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.post<ApiResponse<{ message: string }>>(`/exams/${examId}/abandon`);
  }

  getExamResult(examId: string): Observable<ApiResponse<ExamResult>> {
    return this.api.get<ApiResponse<ExamResult>>(`/exams/${examId}/result`);
  }

  getExamHistory(
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PagedResponse<Exam>>> {
    return this.api.get<ApiResponse<PagedResponse<Exam>>>('/exams/history', { page, pageSize });
  }

  getActiveExam(): Observable<ApiResponse<Exam | null>> {
    return this.api.get<ApiResponse<Exam | null>>('/exams/active');
  }
}
