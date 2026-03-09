import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CategoryService } from '../../../core/services/category.service';
import { ProgressService } from '../../../core/services/progress.service';
import { Category } from '../../../core/models/category.model';
import { CategoryProgress } from '../../../core/models/progress.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './category-list.component.html',
  styles: [`
    .practice-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .page-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }
    .page-header p { color: #666; font-size: 1rem; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .category-card {
      border-radius: 16px;
      padding: 28px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .cat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .cat-icon-wrapper mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    .category-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }
    .category-card .description {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 8px;
    }
    .question-count {
      font-size: 0.8rem;
      color: #999;
      margin-top: 12px;
    }
    .practice-btn {
      width: 100%;
      border-radius: 10px !important;
      margin-top: 16px;
    }
  `],
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private progressService = inject(ProgressService);

  categories: Category[] = [];
  progressMap: Map<string, CategoryProgress> = new Map();
  isLoading = true;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data.filter((c) => c.isActive);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });

    this.progressService.getCategoryProgress().subscribe({
      next: (res) => {
        if (res.success) {
          res.data.forEach((p) => this.progressMap.set(p.categoryId, p));
        }
      },
    });
  }

  getProgress(categoryId: string): number {
    return this.progressMap.get(categoryId)?.progressPercentage || 0;
  }

  getAccuracy(categoryId: string): number {
    return this.progressMap.get(categoryId)?.accuracy || 0;
  }
}
