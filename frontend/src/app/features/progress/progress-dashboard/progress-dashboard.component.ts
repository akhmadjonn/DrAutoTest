import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ProgressService } from '../../../core/services/progress.service';
import { ProgressSummary, CategoryProgress, WeakArea } from '../../../core/models/progress.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatButtonModule,
    BaseChartDirective,
    LoadingSpinnerComponent,
  ],
  templateUrl: './progress-dashboard.component.html',
  styles: [`
    .progress-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }
    .page-header p { color: #666; margin-bottom: 32px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      padding: 20px;
      border-radius: 14px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      text-align: center;
    }
    .stat-card mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; }
    .stat-card .value { font-size: 1.6rem; font-weight: 700; color: #333; }
    .stat-card .label { font-size: 0.8rem; color: #888; margin-top: 4px; }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .chart-card {
      border-radius: 16px;
      padding: 24px;
    }
    .chart-card h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .categories-section h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      margin-bottom: 12px;
    }
    .cat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-icon mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    .cat-details { flex: 1; }
    .cat-details h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
    .cat-details p { font-size: 0.8rem; color: #888; }
    .cat-progress { width: 160px; }
    .cat-accuracy { font-weight: 600; min-width: 60px; text-align: right; }
    .weak-areas h2 { font-size: 1.2rem; font-weight: 600; margin: 32px 0 16px; color: #c62828; }
    .weak-item {
      padding: 16px;
      border-radius: 12px;
      background: #fff8e1;
      border-left: 4px solid #ff9800;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .weak-item h4 { font-weight: 600; margin-bottom: 4px; }
    .weak-item p { font-size: 0.85rem; color: #666; }
    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProgressDashboardComponent implements OnInit {
  private progressService = inject(ProgressService);

  summary: ProgressSummary | null = null;
  categoryProgress: CategoryProgress[] = [];
  weakAreas: WeakArea[] = [];
  isLoading = true;

  pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  lineChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [] }] };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)' } },
    },
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.progressService.getSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.summary = res.data;
          this.buildLineChart();
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });

    this.progressService.getCategoryProgress().subscribe({
      next: (res) => {
        if (res.success) {
          this.categoryProgress = res.data;
          this.buildPieChart();
        }
      },
    });

    this.progressService.getWeakAreas().subscribe({
      next: (res) => {
        if (res.success) {
          this.weakAreas = res.data;
        }
      },
    });
  }

  private buildPieChart(): void {
    this.pieChartData = {
      labels: this.categoryProgress.map((c) => c.categoryName),
      datasets: [
        {
          data: this.categoryProgress.map((c) => c.answeredQuestions),
          backgroundColor: [
            '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336',
            '#00bcd4', '#ff5722', '#607d8b', '#795548', '#e91e63',
          ],
        },
      ],
    };
  }

  private buildLineChart(): void {
    if (!this.summary?.examHistory) return;
    const history = this.summary.examHistory.slice(-20);
    this.lineChartData = {
      labels: history.map((h) => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          data: history.map((h) => h.score),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#388e3c',
        },
      ],
    };
  }

  getAccuracyColor(accuracy: number): string {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
  }
}
