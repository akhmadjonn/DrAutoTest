import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { selectUser, selectIsAuthenticated, selectIsAdmin } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styles: [`
    .header-toolbar {
      background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .nav-links {
      display: flex;
      gap: 4px;
      margin-left: 32px;
    }
    .nav-links a {
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      font-size: 0.9rem;
      padding: 6px 14px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white;
      background: rgba(255,255,255,0.15);
    }
    .spacer { flex: 1; }
    .sub-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-free { background: rgba(255,255,255,0.2); }
    .badge-basic { background: #ff9800; }
    .badge-premium { background: #ffd700; color: #333; }
    .badge-yearly { background: #e040fb; }
    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }
    @media (max-width: 768px) {
      .nav-links { display: none; }
    }
  `],
})
export class HeaderComponent {
  private store = inject(Store<AppState>);

  user$ = this.store.select(selectUser);
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  isAdmin$ = this.store.select(selectIsAdmin);

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getSubscriptionClass(type: string): string {
    return `badge-${type}`;
  }
}
