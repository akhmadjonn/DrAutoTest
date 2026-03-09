import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ request }) =>
        this.authService.login(request).pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.loginSuccess({ response: res.data });
            }
            return AuthActions.loginFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.error?.message || 'Login failed' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/home/dashboard']);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ request }) =>
        this.authService.register(request).pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.registerSuccess({ response: res.data });
            }
            return AuthActions.registerFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.error?.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          this.router.navigate(['/home/dashboard']);
        })
      ),
    { dispatch: false }
  );

  sendOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sendOtp),
      exhaustMap(({ request }) =>
        this.authService.sendOtp(request).pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.sendOtpSuccess({ message: res.data.message });
            }
            return AuthActions.sendOtpFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.sendOtpFailure({ error: error.error?.message || 'Failed to send OTP' }))
          )
        )
      )
    )
  );

  verifyOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyOtp),
      exhaustMap(({ request }) =>
        this.authService.verifyOtp(request).pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.verifyOtpSuccess({ response: res.data });
            }
            return AuthActions.verifyOtpFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.verifyOtpFailure({ error: error.error?.message || 'OTP verification failed' }))
          )
        )
      )
    )
  );

  verifyOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.verifyOtpSuccess),
        tap(() => {
          this.router.navigate(['/home/dashboard']);
        })
      ),
    { dispatch: false }
  );

  googleAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleAuth),
      exhaustMap(({ request }) =>
        this.authService.googleAuth(request).pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.googleAuthSuccess({ response: res.data });
            }
            return AuthActions.googleAuthFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.googleAuthFailure({ error: error.error?.message || 'Google auth failed' }))
          )
        )
      )
    )
  );

  googleAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.googleAuthSuccess),
        tap(() => {
          this.router.navigate(['/home/dashboard']);
        })
      ),
    { dispatch: false }
  );

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      exhaustMap(() =>
        this.authService.getProfile().pipe(
          map((res) => {
            if (res.success) {
              return AuthActions.loadProfileSuccess({ user: res.data });
            }
            return AuthActions.loadProfileFailure({ error: res.message });
          }),
          catchError((error) =>
            of(AuthActions.loadProfileFailure({ error: error.error?.message || 'Failed to load profile' }))
          )
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      map(() => {
        const user = this.storage.getUser<any>();
        const token = this.storage.getAccessToken();
        if (user && token) {
          return AuthActions.restoreSessionSuccess({ user });
        }
        return AuthActions.restoreSessionFailure();
      })
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private storage: StorageService,
    private router: Router
  ) {}
}
