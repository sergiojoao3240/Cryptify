import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private apiUserUrl = 'http://localhost:85/users';

    private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

    constructor(private http: HttpClient) {}

    getUserByID(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUserUrl}/${id}`, { headers: this.getHeaders() });
    }

    deleteUserByID(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUserUrl}/${id}`, { headers: this.getHeaders() });
    }

    updateUserByID(id: string, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUserUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/forgotPassword`, { email }, { headers: this.getHeaders() });
    }

    changePassword(email: string, pin: string, newPassword: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/changePassword/${email}`, { pin, newPassword }, { headers: this.getHeaders() });
    }

    updatePassword(email: string, olderPassord: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/updatePassword/${email}`, { password, olderPassord }, { headers: this.getHeaders() });
    }
}
