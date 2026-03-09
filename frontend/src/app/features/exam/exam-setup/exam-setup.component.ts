import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import * as ExamActions from '../../../store/exam/exam.actions';
import { selectIsLoading } from '../../../store/exam/exam.selectors';

@Component({
  selector: 'app-exam-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exam-setup.component.html',
  styles: [`
    .setup-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .setup-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .setup-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }
    .setup-header p { color: #666; }
    .exam-types {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .exam-type-card {
      padding: 24px;
      border: 2px solid #e0e0e0;
      border-radius: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: white;
    }
    .exam-type-card:hover {
      border-color: #4caf50;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .exam-type-card.selected {
      border-color: #388e3c;
      background: #e8f5e9;
    }
    .type-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .type-icon mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    .exam-type-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .exam-type-card p { font-size: 0.8rem; color: #888; }
    .config-section {
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .config-section h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .config-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
    }
    .config-row label {
      font-weight: 500;
      color: #333;
      min-width: 160px;
    }
    .config-row .config-input { flex: 1; }
    .start-btn {
      width: 100%;
      padding: 16px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
    }
    .preset-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .preset-chip {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #e0e0e0;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .preset-chip:hover { border-color: #4caf50; }
    .preset-chip.active { background: #e8f5e9; border-color: #388e3c; color: #1b5e20; font-weight: 600; }
    @media (max-width: 640px) {
      .config-row { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class ExamSetupComponent implements OnInit {
  private store = inject(Store<AppState>);
  private categoryService = inject(CategoryService);

  isLoading$ = this.store.select(selectIsLoading);

  examType: 'full' | 'category' | 'quick' | 'mock' = 'full';
  selectedCategoryId: string = '';
  questionCount: number = 30;
  timeLimitMinutes: number = 30;
  categories: Category[] = [];

  examTypes = [
    { type: 'full' as const, icon: 'assignment', color: '#4caf50', title: 'Full Exam', desc: 'Complete exam simulation' },
    { type: 'category' as const, icon: 'category', color: '#2196f3', title: 'By Category', desc: 'Focus on specific topics' },
    { type: 'quick' as const, icon: 'bolt', color: '#ff9800', title: 'Quick Test', desc: '10 random questions' },
    { type: 'mock' as const, icon: 'workspace_premium', color: '#9c27b0', title: 'Mock Exam', desc: 'Realistic exam conditions' },
  ];

  questionPresets = [10, 20, 30, 50];
  timePresets = [15, 20, 30, 45, 60];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
        }
      },
    });
  }

  selectExamType(type: 'full' | 'category' | 'quick' | 'mock'): void {
    this.examType = type;
    if (type === 'quick') {
      this.questionCount = 10;
      this.timeLimitMinutes = 10;
    } else if (type === 'full' || type === 'mock') {
      this.questionCount = 30;
      this.timeLimitMinutes = 30;
    }
  }

  startExam(): void {
    this.store.dispatch(
      ExamActions.startExam({
        request: {
          type: this.examType,
          categoryId: this.examType === 'category' ? this.selectedCategoryId : undefined,
          questionCount: this.questionCount,
          timeLimitMinutes: this.timeLimitMinutes,
        },
      })
    );
  }

  canStart(): boolean {
    if (this.examType === 'category' && !this.selectedCategoryId) return false;
    return this.questionCount > 0 && this.timeLimitMinutes > 0;
  }
}
