import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPlan } from '../../../core/models/subscription.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './checkout.component.html',
  styles: [`
    .checkout-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 32px;
    }
    .checkout-card {
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .checkout-card h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .plan-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .plan-summary h3 { font-size: 1.1rem; font-weight: 600; }
    .plan-summary .price { font-size: 1.4rem; font-weight: 700; color: #1b5e20; }
    .payment-method {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .method-option {
      padding: 16px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .method-option:hover { border-color: #4caf50; }
    .method-option.selected { border-color: #388e3c; background: #e8f5e9; }
    .method-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      color: white;
    }
    .method-info h4 { font-weight: 600; margin-bottom: 2px; }
    .method-info p { font-size: 0.8rem; color: #888; }
    .checkout-btn {
      width: 100%;
      padding: 14px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      margin-top: 16px;
    }
    .secure-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 0.85rem;
      color: #888;
    }
  `],
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private subscriptionService = inject(SubscriptionService);
  private snackBar = inject(MatSnackBar);

  plan: SubscriptionPlan | null = null;
  selectedMethod: 'payme' | 'click' | 'stripe' = 'payme';
  autoRenew = true;
  isLoading = true;
  isProcessing = false;

  paymentMethods = [
    { id: 'payme' as const, name: 'Payme', desc: 'Pay with Payme wallet or card', color: '#00c7b7' },
    { id: 'click' as const, name: 'Click', desc: 'Pay with Click wallet or card', color: '#00aeef' },
    { id: 'stripe' as const, name: 'Stripe', desc: 'International cards (Visa, Mastercard)', color: '#635bff' },
  ];

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('planId');
    this.subscriptionService.getPlans().subscribe({
      next: (res) => {
        if (res.success) {
          this.plan = res.data.find((p) => p.id === planId) || null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onCheckout(): void {
    if (!this.plan) return;

    this.isProcessing = true;
    this.subscriptionService
      .subscribe({
        planId: this.plan.id,
        paymentMethod: this.selectedMethod,
        autoRenew: this.autoRenew,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          }
          this.isProcessing = false;
        },
        error: () => {
          this.isProcessing = false;
          this.snackBar.open('Payment initiation failed. Please try again.', 'Close', {
            duration: 5000,
          });
        },
      });
  }

  formatPrice(price: number, currency: string): string {
    return `${(price / 100).toLocaleString()} ${currency}`;
  }
}
