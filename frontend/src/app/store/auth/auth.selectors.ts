import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (state) => state.user);

export const selectIsAuthenticated = createSelector(selectAuthState, (state) => state.isAuthenticated);

export const selectIsLoading = createSelector(selectAuthState, (state) => state.isLoading);

export const selectAuthError = createSelector(selectAuthState, (state) => state.error);

export const selectOtpSent = createSelector(selectAuthState, (state) => state.otpSent);

export const selectOtpMessage = createSelector(selectAuthState, (state) => state.otpMessage);

export const selectIsAdmin = createSelector(selectUser, (user) => user?.role === 'admin');

export const selectSubscriptionType = createSelector(selectUser, (user) => user?.subscriptionType || 'free');

export const selectUserFullName = createSelector(
  selectUser,
  (user) => (user ? `${user.firstName} ${user.lastName}` : '')
);
