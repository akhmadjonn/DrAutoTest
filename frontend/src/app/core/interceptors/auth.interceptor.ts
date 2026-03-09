import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = storage.getAccessToken();

  let authReq = req;
  if (token && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
    authReq = addToken(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return handleUnauthorized(authReq, next, authService, storage, router);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  storage: StorageService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    const refreshToken = storage.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((res) => {
          isRefreshing = false;
          if (res.success) {
            return next(addToken(req, res.data.accessToken));
          }
          storage.clearAuth();
          router.navigate(['/auth/login']);
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((err) => {
          isRefreshing = false;
          storage.clearAuth();
          router.navigate(['/auth/login']);
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      storage.clearAuth();
      router.navigate(['/auth/login']);
    }
  }

  return throwError(() => new Error('Unauthorized'));
}
