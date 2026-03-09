import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './profile-settings.component.html',
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .page-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 32px;
    }
    .profile-card {
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .profile-card h2 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .form-field { width: 100%; margin-bottom: 8px; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .save-btn {
      min-width: 150px;
      padding: 10px 32px;
      border-radius: 8px;
    }
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: #388e3c;
    }
    .sub-info {
      padding: 20px;
      border-radius: 12px;
      background: #f5f5f5;
      margin-top: 16px;
    }
    .sub-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
    .sub-detail { font-size: 0.9rem; color: #666; margin-bottom: 4px; }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private snackBar = inject(MatSnackBar);

  user$ = this.store.select(selectUser);
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  subscription: Subscription | null = null;
  isSaving = false;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    this.user$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        });
      }
    });

    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (res) => {
        if (res.success) {
          this.subscription = res.data;
        }
      },
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: () => {
        this.isChangingPassword = false;
      },
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
