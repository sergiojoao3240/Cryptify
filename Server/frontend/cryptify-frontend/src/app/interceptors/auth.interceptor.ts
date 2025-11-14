import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          if (req.url.includes('/auth/refresh')) {
            return throwError(() => err);
          }

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.auth.refreshToken().pipe(
              switchMap((res: any) => {
                const newToken = res?.results?.refresh_token || null;
                if (newToken) {
                  this.auth.setToken(newToken);
                  this.refreshTokenSubject.next(newToken);
                  const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                  return next.handle(retryReq);
                }
                return throwError(() => err);
              }),
              catchError((refreshErr) => {
                return throwError(() => refreshErr);
              }),
              finalize(() => {
                this.isRefreshing = false;
              })
            );
          } else {
            return this.refreshTokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap((token) => {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
                return next.handle(retryReq as any);
              })
            );
          }
        }

        return throwError(() => err);
      })
    );
  }
}
