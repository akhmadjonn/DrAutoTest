import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../../core/services/api.service';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalCategories: number;
  totalExams: number;
  totalRevenue: number;
  newUsersToday: number;
  examsToday: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './admin-dashboard.component.html',
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .admin-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
    }
    .admin-nav {
      display: flex;
      gap: 8px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
    .stat-info h3 { font-size: 1.5rem; font-weight: 700; color: #333; }
    .stat-info p { font-size: 0.8rem; color: #888; margin-top: 2px; }
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .action-card {
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .action-card:hover { transform: translateY(-2px); }
    .action-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .action-card p { font-size: 0.85rem; color: #888; margin-bottom: 16px; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);

  stats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalQuestions: 0,
    totalCategories: 0,
    totalExams: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    examsToday: 0,
  };

  ngOnInit(): void {
    this.api.get<any>('/admin/stats').subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
        }
      },
    });
  }

  formatRevenue(amount: number): string {
    return (amount / 100).toLocaleString() + ' UZS';
  }
}
