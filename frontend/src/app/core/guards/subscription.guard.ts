import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const subscriptionGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && user.subscriptionType !== 'free') {
    return true;
  }

  router.navigate(['/payment/plans'], {
    queryParams: { upgrade: true },
  });
  return false;
};
