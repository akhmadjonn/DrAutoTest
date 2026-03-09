import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const EXAM_ROUTES: Routes = [
  {
    path: 'setup',
    loadComponent: () =>
      import('./exam-setup/exam-setup.component').then((m) => m.ExamSetupComponent),
    canActivate: [authGuard],
  },
  {
    path: 'taking/:id',
    loadComponent: () =>
      import('./exam-taking/exam-taking.component').then((m) => m.ExamTakingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'result/:id',
    loadComponent: () =>
      import('./exam-result/exam-result.component').then((m) => m.ExamResultComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'setup',
    pathMatch: 'full',
  },
];
