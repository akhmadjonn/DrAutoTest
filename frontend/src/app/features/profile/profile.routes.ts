import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile-settings/profile-settings.component').then(
        (m) => m.ProfileSettingsComponent
      ),
    canActivate: [authGuard],
  },
];
