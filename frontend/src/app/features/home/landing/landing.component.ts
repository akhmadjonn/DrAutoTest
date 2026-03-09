import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './landing.component.html',
  styles: [`
    .hero {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1b5e20 0%, #388e3c 50%, #4caf50 100%);
      color: white;
      text-align: center;
      padding: 48px 24px;
    }
    .hero-content { max-width: 700px; }
    .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
    .hero p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 32px; line-height: 1.6; }
    .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .hero-btn {
      padding: 14px 32px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
    }
    .features-section {
      padding: 80px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-heading {
      text-align: center;
      margin-bottom: 48px;
    }
    .section-heading h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 12px;
    }
    .section-heading p { color: #666; font-size: 1.05rem; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .feature-card {
      padding: 32px;
      border-radius: 16px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .feature-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .feature-icon mat-icon { font-size: 32px; width: 32px; height: 32px; color: white; }
    .feature-card h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; color: #333; }
    .feature-card p { color: #666; font-size: 0.9rem; line-height: 1.6; }
    .pricing-section {
      padding: 80px 24px;
      background: #f5f5f5;
    }
    .pricing-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .pricing-card {
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .pricing-card.popular {
      border: 2px solid #388e3c;
      transform: scale(1.03);
    }
    .popular-badge {
      position: absolute;
      top: 16px;
      right: -28px;
      background: #388e3c;
      color: white;
      padding: 4px 32px;
      font-size: 0.75rem;
      font-weight: 600;
      transform: rotate(45deg);
    }
    .pricing-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
    .price { font-size: 2.5rem; font-weight: 800; color: #1b5e20; }
    .price span { font-size: 1rem; font-weight: 400; color: #666; }
    .pricing-features {
      list-style: none;
      padding: 0;
      margin: 24px 0;
      text-align: left;
    }
    .pricing-features li {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #555;
    }
    .pricing-features mat-icon { font-size: 18px; width: 18px; height: 18px; color: #4caf50; }
    .cta-section {
      padding: 80px 24px;
      text-align: center;
      background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
      color: white;
    }
    .cta-section h2 { font-size: 2.2rem; font-weight: 700; margin-bottom: 16px; }
    .cta-section p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .stats-row {
      display: flex;
      gap: 48px;
      justify-content: center;
      margin-top: 48px;
      flex-wrap: wrap;
    }
    .stat-item h3 { font-size: 2.5rem; font-weight: 800; }
    .stat-item p { font-size: 0.9rem; opacity: 0.8; }
    @media (max-width: 640px) {
      .hero h1 { font-size: 2rem; }
      .price { font-size: 2rem; }
    }
  `],
})
export class LandingComponent {
  features = [
    { icon: 'quiz', color: '#4caf50', title: 'Mock Exams', desc: 'Take realistic mock exams that mirror the actual driving license test format and difficulty.' },
    { icon: 'category', color: '#2196f3', title: 'Category Practice', desc: 'Focus on specific categories like road signs, traffic rules, and first aid to strengthen weak areas.' },
    { icon: 'insights', color: '#ff9800', title: 'Track Progress', desc: 'Detailed analytics and charts show your improvement over time and highlight areas needing attention.' },
    { icon: 'timer', color: '#9c27b0', title: 'Timed Tests', desc: 'Practice under real exam conditions with configurable timers and question limits.' },
    { icon: 'phone_android', color: '#f44336', title: 'Mobile Friendly', desc: 'Study anywhere, anytime with our fully responsive design optimized for all devices.' },
    { icon: 'workspace_premium', color: '#ffd700', title: 'Premium Content', desc: 'Access exclusive question banks, detailed explanations, and advanced analytics.' },
  ];

  plans = [
    {
      name: 'Free', price: 0, period: '',
      features: ['100 practice questions', '2 mock exams per day', 'Basic progress tracking', 'Community support'],
      popular: false,
    },
    {
      name: 'Basic', price: 29900, period: '/month',
      features: ['Unlimited questions', '10 mock exams per day', 'Category practice', 'Detailed analytics', 'Email support'],
      popular: false,
    },
    {
      name: 'Premium', price: 49900, period: '/month',
      features: ['Everything in Basic', 'Unlimited mock exams', 'Weak area analysis', 'Offline access', 'Priority support', 'No ads'],
      popular: true,
    },
    {
      name: 'Yearly', price: 399000, period: '/year',
      features: ['Everything in Premium', 'Save 33%', 'Early access to new features', 'Exclusive study materials', 'Certificate of completion'],
      popular: false,
    },
  ];

  formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return (price / 100).toLocaleString() + ' UZS';
  }
}
