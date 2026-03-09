import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styles: [`
    .dialog-icon {
      text-align: center;
      margin-bottom: 16px;
    }
    .dialog-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .icon-warning { color: #ff9800; }
    .icon-danger { color: #f44336; }
    .icon-info { color: #2196f3; }
    .dialog-title {
      text-align: center;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .dialog-message {
      text-align: center;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIconName(): string {
    switch (this.data.type) {
      case 'danger': return 'error_outline';
      case 'warning': return 'warning_amber';
      default: return 'help_outline';
    }
  }

  getIconClass(): string {
    return `icon-${this.data.type || 'info'}`;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
