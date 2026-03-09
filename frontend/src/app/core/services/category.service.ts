import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ReorderCategoryRequest,
} from '../models/category.model';
import { ApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private api: ApiService) {}

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.api.get<ApiResponse<Category[]>>('/categories');
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.api.get<ApiResponse<Category>>(`/categories/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<ApiResponse<Category>> {
    return this.api.post<ApiResponse<Category>>('/categories', request);
  }

  updateCategory(request: UpdateCategoryRequest): Observable<ApiResponse<Category>> {
    return this.api.put<ApiResponse<Category>>(`/categories/${request.id}`, request);
  }

  deleteCategory(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
  }

  reorderCategories(request: ReorderCategoryRequest): Observable<ApiResponse<{ message: string }>> {
    return this.api.post<ApiResponse<{ message: string }>>('/categories/reorder', request);
  }
}
