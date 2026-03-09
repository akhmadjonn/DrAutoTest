import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRACTICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./category-list/category-list.component').then((m) => m.CategoryListComponent),
    canActivate: [authGuard],
  },
  {
    path: ':categoryId',
    loadComponent: () =>
      import('./question-practice/question-practice.component').then((m) => m.QuestionPracticeComponent),
    canActivate: [authGuard],
  },
];
