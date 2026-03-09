import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styles: [`
    footer {
      background: #1b5e20;
      color: rgba(255,255,255,0.9);
      padding: 48px 24px 24px;
      margin-top: auto;
    }
    .footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
    }
    .footer-section h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: white;
    }
    .footer-section ul {
      list-style: none;
      padding: 0;
    }
    .footer-section ul li {
      margin-bottom: 8px;
    }
    .footer-section ul li a {
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .footer-section ul li a:hover {
      color: white;
    }
    .footer-bottom {
      max-width: 1200px;
      margin: 32px auto 0;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
    }
    .brand-desc {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
    }
    @media (max-width: 640px) {
      .footer-bottom {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
    }
  `],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
