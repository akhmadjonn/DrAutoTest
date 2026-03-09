import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPlan } from '../../../core/models/subscription.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-plan-selection',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './plan-selection.component.html',
  styles: [`
    .plans-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header {
      text-align: center;
      margin-bottom: 48px;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }
    .page-header p { color: #666; font-size: 1.05rem; }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      align-items: start;
    }
    .plan-card {
      border-radius: 20px;
      padding: 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    }
    .plan-card.popular {
      border: 3px solid #388e3c;
    }
    .popular-ribbon {
      position: absolute;
      top: 20px;
      right: -30px;
      background: #388e3c;
      color: white;
      padding: 6px 40px;
      font-size: 0.75rem;
      font-weight: 700;
      transform: rotate(45deg);
      text-transform: uppercase;
    }
    .plan-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .plan-icon mat-icon { color: white; font-size: 32px; width: 32px; height: 32px; }
    .plan-card h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; }
    .plan-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1b5e20;
      margin: 16px 0;
    }
    .plan-price .currency { font-size: 1rem; font-weight: 400; }
    .plan-price .period { font-size: 0.9rem; font-weight: 400; color: #888; }
    .plan-features {
      list-style: none;
      padding: 0;
      margin: 24px 0;
      text-align: left;
    }
    .plan-features li {
      padding: 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      color: #555;
      border-bottom: 1px solid #f5f5f5;
    }
    .plan-features li:last-child { border-bottom: none; }
    .plan-features mat-icon { font-size: 20px; width: 20px; height: 20px; color: #4caf50; }
    .select-btn {
      width: 100%;
      padding: 12px !important;
      border-radius: 12px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
    }
  `],
})
export class PlanSelectionComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  plans: SubscriptionPlan[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (res) => {
        if (res.success) {
          this.plans = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatPrice(price: number, currency: string): string {
    if (price === 0) return 'Free';
    return `${(price / 100).toLocaleString()} ${currency}`;
  }

  getPlanIcon(type: string): string {
    switch (type) {
      case 'free': return 'volunteer_activism';
      case 'basic': return 'star_border';
      case 'premium': return 'star';
      case 'yearly': return 'workspace_premium';
      default: return 'card_membership';
    }
  }

  getPlanColor(type: string): string {
    switch (type) {
      case 'free': return '#78909c';
      case 'basic': return '#2196f3';
      case 'premium': return '#ff9800';
      case 'yearly': return '#9c27b0';
      default: return '#4caf50';
    }
  }

  getPeriod(plan: SubscriptionPlan): string {
    if (plan.price === 0) return '';
    return plan.durationDays >= 365 ? '/year' : '/month';
  }
}
