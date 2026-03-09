import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { ProgressService } from '../../../core/services/progress.service';
import { ExamService } from '../../../core/services/exam.service';
import { ProgressSummary } from '../../../core/models/progress.model';
import { Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .welcome-section {
      margin-bottom: 32px;
    }
    .welcome-section h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 4px;
    }
    .welcome-section p { color: #666; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      padding: 24px;
      border-radius: 16px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon { color: white; font-size: 26px; width: 26px; height: 26px; }
    .stat-info h3 { font-size: 1.6rem; font-weight: 700; color: #333; }
    .stat-info p { font-size: 0.85rem; color: #888; margin-top: 2px; }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .section-card {
      border-radius: 16px;
      padding: 24px;
    }
    .section-card h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .action-btn {
      padding: 20px 16px !important;
      border-radius: 12px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
      height: auto !important;
      line-height: normal !important;
    }
    .action-btn mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .action-btn span { font-size: 0.85rem; font-weight: 500; }
    .exam-list { display: flex; flex-direction: column; gap: 12px; }
    .exam-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: 10px;
      background: #f5f5f5;
    }
    .exam-item-info h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
    .exam-item-info p { font-size: 0.8rem; color: #888; }
    .exam-score {
      font-size: 1.1rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }
    .score-pass { background: #e8f5e9; color: #2e7d32; }
    .score-fail { background: #ffebee; color: #c62828; }
    .streak-section {
      background: linear-gradient(135deg, #ff9800, #f57c00);
      border-radius: 16px;
      padding: 24px;
      color: white;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .streak-section mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .streak-info h3 { font-size: 1.4rem; font-weight: 700; }
    .streak-info p { opacity: 0.9; font-size: 0.9rem; }
    .no-data { text-align: center; padding: 32px; color: #999; }
    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private store = inject(Store<AppState>);
  private progressService = inject(ProgressService);
  private examService = inject(ExamService);

  user$ = this.store.select(selectUser);
  summary: ProgressSummary | null = null;
  recentExams: Exam[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.progressService.getSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.summary = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });

    this.examService.getExamHistory(1, 5).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentExams = res.data.items;
        }
      },
    });
  }

  getScoreClass(score: number): string {
    return score >= 70 ? 'score-pass' : 'score-fail';
  }
}
