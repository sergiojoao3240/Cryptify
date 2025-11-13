import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiAuthUrl = 'http://localhost:85/auth';
  private apiUserUrl = 'http://localhost:85/users';

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
    return this.http.post<any>(`${this.apiAuthUrl}/update`, { password });
  }

  logout(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiAuthUrl}/logout/${userId}`);
  }
}
