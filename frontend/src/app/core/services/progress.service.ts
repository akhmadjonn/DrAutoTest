import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ProgressSummary,
  CategoryProgress,
  WeakArea,
  DailyProgress,
} from '../models/progress.model';
import { ApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<ApiResponse<ProgressSummary>> {
    return this.api.get<ApiResponse<ProgressSummary>>('/progress/summary');
  }

  getCategoryProgress(): Observable<ApiResponse<CategoryProgress[]>> {
    return this.api.get<ApiResponse<CategoryProgress[]>>('/progress/categories');
  }

  getWeakAreas(): Observable<ApiResponse<WeakArea[]>> {
    return this.api.get<ApiResponse<WeakArea[]>>('/progress/weak-areas');
  }

  getDailyProgress(days: number = 30): Observable<ApiResponse<DailyProgress[]>> {
    return this.api.get<ApiResponse<DailyProgress[]>>('/progress/daily', { days });
  }

  getCategoryDetail(categoryId: string): Observable<ApiResponse<CategoryProgress>> {
    return this.api.get<ApiResponse<CategoryProgress>>(`/progress/categories/${categoryId}`);
  }
}
