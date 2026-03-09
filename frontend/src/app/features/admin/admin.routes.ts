import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'questions',
    loadComponent: () =>
      import('./question-management/question-management.component').then(
        (m) => m.QuestionManagementComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./category-management/category-management.component').then(
        (m) => m.CategoryManagementComponent
      ),
    canActivate: [adminGuard],
  },
];
