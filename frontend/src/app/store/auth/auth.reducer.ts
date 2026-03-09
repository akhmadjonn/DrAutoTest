import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpMessage: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  otpMessage: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.sendOtp, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    otpSent: false,
  })),
  on(AuthActions.sendOtpSuccess, (state, { message }) => ({
    ...state,
    isLoading: false,
    otpSent: true,
    otpMessage: message,
  })),
  on(AuthActions.sendOtpFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    otpSent: false,
  })),

  on(AuthActions.verifyOtp, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.verifyOtpSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    otpSent: false,
  })),
  on(AuthActions.verifyOtpFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.googleAuth, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.googleAuthSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),
  on(AuthActions.googleAuthFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.loadProfileSuccess, (state, { user }) => ({
    ...state,
    user,
  })),

  on(AuthActions.logout, () => ({
    ...initialState,
  })),

  on(AuthActions.logoutComplete, () => ({
    ...initialState,
  })),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(AuthActions.restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
  })),

  on(AuthActions.restoreSessionFailure, () => ({
    ...initialState,
  }))
);
