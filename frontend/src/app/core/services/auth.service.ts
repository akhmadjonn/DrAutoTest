import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OtpRequest,
  OtpSendRequest,
  RefreshTokenRequest,
  GoogleAuthRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../models/user.model';
import { ApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('/auth/login', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storeAuthData(res.data);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('/auth/register', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storeAuthData(res.data);
        }
      })
    );
  }

  sendOtp(request: OtpSendRequest): Observable<ApiResponse<{ message: string }>> {
    return this.api.post<ApiResponse<{ message: string }>>('/auth/send-otp', request);
  }

  verifyOtp(request: OtpRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storeAuthData(res.data);
        }
      })
    );
  }

  googleAuth(request: GoogleAuthRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('/auth/google', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storeAuthData(res.data);
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.storage.getRefreshToken();
    const request: RefreshTokenRequest = { refreshToken: refreshToken || '' };
    return this.api.post<ApiResponse<AuthResponse>>('/auth/refresh', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storeAuthData(res.data);
        }
      })
    );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>('/auth/profile');
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>('/auth/profile', request).pipe(
      tap((res) => {
        if (res.success) {
          this.storage.setUser(res.data);
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<{ message: string }>> {
    return this.api.post<ApiResponse<{ message: string }>>('/auth/change-password', request);
  }

  logout(): void {
    this.api.post('/auth/logout').subscribe({ error: () => {} });
    this.storage.clearAuth();
  }

  isAuthenticated(): boolean {
    return !!this.storage.getAccessToken();
  }

  getCurrentUser(): User | null {
    return this.storage.getUser<User>();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  private storeAuthData(data: AuthResponse): void {
    this.storage.setAccessToken(data.accessToken);
    this.storage.setRefreshToken(data.refreshToken);
    this.storage.setUser(data.user);
  }
}
