import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PAYMENT_ROUTES: Routes = [
  {
    path: 'plans',
    loadComponent: () =>
      import('./plan-selection/plan-selection.component').then(
        (m) => m.PlanSelectionComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'checkout/:planId',
    loadComponent: () =>
      import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'plans',
    pathMatch: 'full',
  },
];
