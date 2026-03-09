import { createAction, props } from '@ngrx/store';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OtpRequest,
  OtpSendRequest,
  GoogleAuthRequest,
} from '../../core/models/user.model';

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ response: AuthResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const register = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ response: AuthResponse }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const sendOtp = createAction('[Auth] Send OTP', props<{ request: OtpSendRequest }>());
export const sendOtpSuccess = createAction('[Auth] Send OTP Success', props<{ message: string }>());
export const sendOtpFailure = createAction('[Auth] Send OTP Failure', props<{ error: string }>());

export const verifyOtp = createAction('[Auth] Verify OTP', props<{ request: OtpRequest }>());
export const verifyOtpSuccess = createAction('[Auth] Verify OTP Success', props<{ response: AuthResponse }>());
export const verifyOtpFailure = createAction('[Auth] Verify OTP Failure', props<{ error: string }>());

export const googleAuth = createAction('[Auth] Google Auth', props<{ request: GoogleAuthRequest }>());
export const googleAuthSuccess = createAction('[Auth] Google Auth Success', props<{ response: AuthResponse }>());
export const googleAuthFailure = createAction('[Auth] Google Auth Failure', props<{ error: string }>());

export const loadProfile = createAction('[Auth] Load Profile');
export const loadProfileSuccess = createAction('[Auth] Load Profile Success', props<{ user: User }>());
export const loadProfileFailure = createAction('[Auth] Load Profile Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const logoutComplete = createAction('[Auth] Logout Complete');

export const clearError = createAction('[Auth] Clear Error');

export const restoreSession = createAction('[Auth] Restore Session');
export const restoreSessionSuccess = createAction('[Auth] Restore Session Success', props<{ user: User }>());
export const restoreSessionFailure = createAction('[Auth] Restore Session Failure');
