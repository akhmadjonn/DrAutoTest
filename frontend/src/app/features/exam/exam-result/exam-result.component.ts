import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ExamService } from '../../../core/services/exam.service';
import { ExamResult } from '../../../core/models/exam.model';
import { QuestionCardComponent } from '../../../shared/components/question-card/question-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDividerModule,
    QuestionCardComponent,
    LoadingSpinnerComponent,
    TimeFormatPipe,
  ],
  templateUrl: './exam-result.component.html',
  styles: [`
    .result-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .result-hero {
      text-align: center;
      padding: 48px 24px;
      border-radius: 20px;
      margin-bottom: 32px;
      color: white;
    }
    .result-hero.passed {
      background: linear-gradient(135deg, #2e7d32, #4caf50);
    }
    .result-hero.failed {
      background: linear-gradient(135deg, #c62828, #ef5350);
    }
    .result-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .result-icon mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .result-hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
    .score-display { font-size: 4rem; font-weight: 800; margin: 16px 0; }
    .score-label { font-size: 1rem; opacity: 0.9; }
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .stats-row .stat { text-align: center; }
    .stats-row .stat-value { font-size: 1.4rem; font-weight: 700; }
    .stats-row .stat-label { font-size: 0.8rem; opacity: 0.8; }
    .breakdown-card {
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .breakdown-card h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .category-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .category-row:last-child { border-bottom: none; }
    .cat-info { display: flex; align-items: center; gap: 12px; flex: 1; }
    .cat-info .name { font-weight: 500; min-width: 140px; }
    .cat-bar { flex: 1; margin: 0 16px; }
    .cat-score { font-weight: 600; min-width: 80px; text-align: right; }
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }
    .action-buttons button { min-width: 180px; padding: 12px 24px; border-radius: 10px; }
    .wrong-answers-section { margin-top: 24px; }
    .wrong-answers-section h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 16px; }
    .wrong-item { margin-bottom: 16px; }
    @media (max-width: 640px) {
      .action-buttons { flex-direction: column; align-items: center; }
    }
  `],
})
export class ExamResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private examService = inject(ExamService);

  result: ExamResult | null = null;
  isLoading = true;
  showWrongAnswers = false;

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.examService.getExamResult(examId).subscribe({
        next: (res) => {
          if (res.success) {
            this.result = res.data;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }
}
