import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoryService } from '../../../core/services/category.service';
import { Category, CreateCategoryRequest } from '../../../core/models/category.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    DragDropModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './category-management.component.html',
  styles: [`
    .management-container {
      max-width: 1000px;
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
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: grab;
      transition: box-shadow 0.2s;
    }
    .category-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .drag-handle { cursor: grab; color: #ccc; }
    .cat-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-icon-box mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    .cat-info { flex: 1; }
    .cat-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 2px; }
    .cat-info p { font-size: 0.8rem; color: #888; }
    .cat-meta { font-size: 0.85rem; color: #666; min-width: 100px; text-align: right; }
    .cat-actions { display: flex; gap: 4px; }
    .form-card {
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .form-card h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-field { width: 100%; }
    .cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      border-radius: 12px;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .back-link { margin-bottom: 8px; }
    .color-preview {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      vertical-align: middle;
      margin-left: 8px;
      border: 1px solid #ddd;
    }
  `],
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  categories: Category[] = [];
  categoryForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  editingId: string | null = null;
  showForm = false;

  iconOptions = [
    'category', 'directions_car', 'traffic', 'warning', 'health_and_safety',
    'speed', 'local_parking', 'roundabout_right', 'signpost', 'emergency',
  ];

  colorOptions = [
    '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336',
    '#00bcd4', '#ff5722', '#607d8b', '#795548', '#e91e63',
  ];

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      icon: ['category', [Validators.required]],
      color: ['#4caf50', [Validators.required]],
      sortOrder: [0],
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data.sort((a, b) => a.sortOrder - b.sortOrder);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onDrop(event: CdkDragDrop<Category[]>): void {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    const categoryIds = this.categories.map((c) => c.id);
    this.categoryService.reorderCategories({ categoryIds }).subscribe({
      next: () => {
        this.snackBar.open('Order updated', 'Close', { duration: 2000 });
      },
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onEditCategory(category: Category): void {
    this.isEditing = true;
    this.editingId = category.id;
    this.showForm = true;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      sortOrder: category.sortOrder,
    });
  }

  onSave(): void {
    if (this.categoryForm.invalid) return;
    this.isSaving = true;

    const formValue = this.categoryForm.value;

    if (this.isEditing && this.editingId) {
      this.categoryService
        .updateCategory({ ...formValue, id: this.editingId, isActive: true })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.snackBar.open('Category updated', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
            this.resetForm();
            this.loadCategories();
          },
          error: () => { this.isSaving = false; },
        });
    } else {
      this.categoryService.createCategory(formValue as CreateCategoryRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Category created', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.resetForm();
          this.loadCategories();
        },
        error: () => { this.isSaving = false; },
      });
    }
  }

  onDeleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete "${category.name}"? All associated questions will be unlinked.`,
        confirmText: 'Delete',
        type: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted', 'Close', { duration: 3000 });
            this.loadCategories();
          },
        });
      }
    });
  }

  private resetForm(): void {
    this.categoryForm.reset({ icon: 'category', color: '#4caf50', sortOrder: 0 });
    this.isEditing = false;
    this.editingId = null;
    this.showForm = false;
  }
}
