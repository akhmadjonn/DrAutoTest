import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  BulkImportResult,
} from '../models/question.model';
import { ApiResponse, PagedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private api: ApiService) {}

  getQuestions(
    page: number = 1,
    pageSize: number = 20,
    categoryId?: string,
    search?: string,
    difficulty?: string
  ): Observable<ApiResponse<PagedResponse<Question>>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (categoryId) params['categoryId'] = categoryId;
    if (search) params['search'] = search;
    if (difficulty) params['difficulty'] = difficulty;
    return this.api.get<ApiResponse<PagedResponse<Question>>>('/questions', params);
  }

  getQuestion(id: string): Observable<ApiResponse<Question>> {
    return this.api.get<ApiResponse<Question>>(`/questions/${id}`);
  }

  getRandomQuestion(categoryId?: string): Observable<ApiResponse<Question>> {
    const params: Record<string, string> = {};
    if (categoryId) params['categoryId'] = categoryId;
    return this.api.get<ApiResponse<Question>>('/questions/random', params);
  }

  createQuestion(request: CreateQuestionRequest): Observable<ApiResponse<Question>> {
    return this.api.post<ApiResponse<Question>>('/questions', request);
  }

  updateQuestion(request: UpdateQuestionRequest): Observable<ApiResponse<Question>> {
    return this.api.put<ApiResponse<Question>>(`/questions/${request.id}`, request);
  }

  deleteQuestion(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<ApiResponse<{ message: string }>>(`/questions/${id}`);
  }

  uploadImage(file: File): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.upload<ApiResponse<{ url: string }>>('/questions/upload-image', formData);
  }

  bulkImport(file: File, categoryId: string): Observable<ApiResponse<BulkImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId);
    return this.api.upload<ApiResponse<BulkImportResult>>('/questions/bulk-import', formData);
  }
}
