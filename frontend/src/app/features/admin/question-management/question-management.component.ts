import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { QuestionService } from '../../../core/services/question.service';
import { CategoryService } from '../../../core/services/category.service';
import { Question } from '../../../core/models/question.model';
import { Category } from '../../../core/models/category.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-question-management',
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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  templateUrl: './question-management.component.html',
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
    .header-actions { display: flex; gap: 8px; }
    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
    }
    .table-card { border-radius: 16px; overflow: hidden; }
    .mat-mdc-table { width: 100%; }
    .question-text-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .difficulty-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .diff-easy { background: #e8f5e9; color: #2e7d32; }
    .diff-medium { background: #fff3e0; color: #e65100; }
    .diff-hard { background: #ffebee; color: #c62828; }
    .status-active { color: #4caf50; }
    .status-inactive { color: #f44336; }
    .back-link { margin-bottom: 8px; }
  `],
})
export class QuestionManagementComponent implements OnInit {
  private questionService = inject(QuestionService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['text', 'category', 'difficulty', 'answers', 'status', 'actions'];
  dataSource = new MatTableDataSource<Question>();
  categories: Category[] = [];

  searchQuery = '';
  selectedCategoryId = '';
  selectedDifficulty = '';
  totalCount = 0;
  pageSize = 20;
  currentPage = 1;

  ngOnInit(): void {
    this.loadQuestions();
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      },
    });
  }

  loadQuestions(): void {
    this.questionService
      .getQuestions(this.currentPage, this.pageSize, this.selectedCategoryId, this.searchQuery, this.selectedDifficulty)
      .subscribe({
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
    this.loadQuestions();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadQuestions();
  }

  onDeleteQuestion(question: Question): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Question',
        message: `Are you sure you want to delete this question? This action cannot be undone.`,
        confirmText: 'Delete',
        type: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.questionService.deleteQuestion(question.id).subscribe({
          next: () => {
            this.snackBar.open('Question deleted', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
            this.loadQuestions();
          },
        });
      }
    });
  }

  onBulkImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file && this.selectedCategoryId) {
        this.questionService.bulkImport(file, this.selectedCategoryId).subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open(
                `Imported: ${res.data.successCount} success, ${res.data.failedCount} failed`,
                'Close',
                { duration: 5000 }
              );
              this.loadQuestions();
            }
          },
        });
      } else {
        this.snackBar.open('Please select a category first', 'Close', { duration: 3000 });
      }
    };
    input.click();
  }

  getDifficultyClass(difficulty: string): string {
    return `diff-${difficulty}`;
  }
}
