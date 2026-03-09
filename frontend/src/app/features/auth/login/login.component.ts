import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectIsLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './login.component.html',
  styles: [`
    .login-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .login-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }
    .login-header p {
      color: #666;
      font-size: 0.95rem;
    }
    .form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    .login-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 8px;
    }
    .divider-text {
      display: flex;
      align-items: center;
      margin: 20px 0;
      color: #999;
      font-size: 0.85rem;
    }
    .divider-text::before, .divider-text::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }
    .divider-text span {
      padding: 0 16px;
    }
    .google-btn {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
    }
    .signup-link {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
      color: #666;
    }
    .signup-link a {
      color: #388e3c;
      font-weight: 600;
    }
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hide-password {
      cursor: pointer;
    }
  `],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);

  loginForm!: FormGroup;
  hidePassword = true;
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.store.dispatch(AuthActions.clearError());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { emailOrPhone, password } = this.loginForm.value;
    const isEmail = emailOrPhone.includes('@');

    this.store.dispatch(
      AuthActions.login({
        request: {
          email: isEmail ? emailOrPhone : undefined,
          phone: !isEmail ? emailOrPhone : undefined,
          password,
        },
      })
    );
  }

  onGoogleLogin(): void {
    this.store.dispatch(
      AuthActions.googleAuth({ request: { idToken: 'google-oauth-token' } })
    );
  }

  onOtpLogin(): void {
    const { emailOrPhone } = this.loginForm.value;
    if (!emailOrPhone) return;

    const isEmail = emailOrPhone.includes('@');
    this.store.dispatch(
      AuthActions.sendOtp({
        request: {
          email: isEmail ? emailOrPhone : undefined,
          phone: !isEmail ? emailOrPhone : undefined,
          type: 'login',
        },
      })
    );
  }
}
