import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
  ],
  templateUrl: './user-management.component.html',
  styles: [`
    .management-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1b5e20; }
    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
    }
    .table-card { border-radius: 16px; overflow: hidden; }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.8rem;
      color: #388e3c;
    }
    .sub-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .sub-free { background: #f5f5f5; color: #666; }
    .sub-basic { background: #e3f2fd; color: #1565c0; }
    .sub-premium { background: #fff3e0; color: #e65100; }
    .sub-yearly { background: #f3e5f5; color: #7b1fa2; }
    .role-admin { color: #f44336; font-weight: 600; }
    .role-user { color: #666; }
    .back-link { margin-bottom: 8px; }
  `],
})
export class UserManagementComponent implements OnInit {
  private api = inject(ApiService);

  displayedColumns = ['user', 'email', 'phone', 'role', 'subscription', 'created', 'actions'];
  dataSource = new MatTableDataSource<User>();

  searchQuery = '';
  selectedRole = '';
  selectedSubscription = '';
  totalCount = 0;
  pageSize = 20;
  currentPage = 1;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: Record<string, string | number> = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.selectedRole) params['role'] = this.selectedRole;
    if (this.selectedSubscription) params['subscription'] = this.selectedSubscription;

    this.api.get<any>('/admin/users', params).subscribe({
      next: (res) => {
        if (res.success) {
          this.dataSource.data = res.data.items;
          this.totalCount = res.data.totalCount;
        }
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getInitials(user: User): string {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getSubClass(type: string): string {
    return `sub-${type}`;
  }
}
