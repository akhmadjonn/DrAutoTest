import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROGRESS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./progress-dashboard/progress-dashboard.component').then(
        (m) => m.ProgressDashboardComponent
      ),
    canActivate: [authGuard],
  },
];
