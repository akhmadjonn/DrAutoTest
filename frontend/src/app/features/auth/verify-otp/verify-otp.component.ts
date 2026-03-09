import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { interval, Subscription, takeWhile } from 'rxjs';
import { AppState } from '../../../store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectIsLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-verify-otp',
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './verify-otp.component.html',
  styles: [`
    .otp-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    }
    .otp-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      text-align: center;
    }
    .otp-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .otp-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #388e3c;
    }
    h1 { font-size: 1.6rem; font-weight: 700; color: #1b5e20; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 0.9rem; margin-bottom: 32px; }
    .contact-info { font-weight: 600; color: #333; }
    .otp-inputs {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 24px;
    }
    .otp-inputs input {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 1.4rem;
      font-weight: 600;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      outline: none;
      transition: border-color 0.2s;
    }
    .otp-inputs input:focus {
      border-color: #388e3c;
    }
    .verify-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
    }
    .resend-section {
      margin-top: 24px;
      font-size: 0.9rem;
      color: #666;
    }
    .countdown {
      font-weight: 600;
      color: #388e3c;
    }
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 16px;
    }
  `],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);

  otpForm!: FormGroup;
  contact: string = '';
  contactType: 'email' | 'phone' = 'phone';
  countdown: number = 60;
  canResend: boolean = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError);

  private countdownSub?: Subscription;

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.route.queryParams.subscribe((params) => {
      this.contact = params['contact'] || '';
      this.contactType = params['type'] || 'phone';
    });

    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }

    this.otpDigits[index] = value;
    const otp = this.otpDigits.join('');
    this.otpForm.patchValue({ otp });

    if (otp.length === 6) {
      this.onSubmit();
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onSubmit(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== 6) return;

    this.store.dispatch(
      AuthActions.verifyOtp({
        request: {
          [this.contactType]: this.contact,
          otp,
        },
      })
    );
  }

  onResend(): void {
    if (!this.canResend) return;

    this.store.dispatch(
      AuthActions.sendOtp({
        request: {
          [this.contactType]: this.contact,
          type: 'login',
        },
      })
    );

    this.canResend = false;
    this.countdown = 60;
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdownSub?.unsubscribe();
    this.countdown = 60;
    this.canResend = false;

    this.countdownSub = interval(1000)
      .pipe(takeWhile(() => this.countdown > 0))
      .subscribe(() => {
        this.countdown--;
        if (this.countdown === 0) {
          this.canResend = true;
        }
      });
  }
}
