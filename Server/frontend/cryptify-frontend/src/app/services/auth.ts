import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiAuthUrl = 'https://api.cryptify.sgcod3.com/auth';
  private apiUserUrl = 'https://api.cryptify.sgcod3.com/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiAuthUrl}/login`, { email, password });
  }

  register(email: string, name: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUserUrl}/`, { email, name, password });
  }
  
  verifyPin(email: string, pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiAuthUrl}/validate`, { email, pin });
  }


  updateToken(password: string): Observable<any> {
    return this.http.post<any>(`${this.apiAuthUrl}/update`, { password }).pipe(
      tap((res: any) => {
        const refreshFromResults = res?.results?.refresh_token;
        if (refreshFromResults) {
          this.setToken(refreshFromResults);
          return;
        }

        if (res && (res.token || res.accessToken)) {
          const newToken = res.token || res.accessToken;
          this.setToken(newToken);
        }
      })
    );
  }


  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiAuthUrl}/refresh`, {}).pipe(
      tap((res: any) => {
        const refreshFromResults = res?.results?.refresh_token;
        if (refreshFromResults) {
          this.setToken(refreshFromResults);
        }
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  logout(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiAuthUrl}/logout/${userId}`);
  }
}
