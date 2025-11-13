import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private apiUserUrl = 'http://localhost:85/users';

    constructor(private http: HttpClient) {}

    getUserByID(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUserUrl}/${id}`);
    }

    deleteUserByID(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUserUrl}/${id}`);
    }

    updateUserByID(id: string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUserUrl}/${id}`, data);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/forgotPassword`, { email });
    }

    changePassword(email: string, pin: string, newPassword: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/changePassword/${email}`, { pin, newPassword });
    }

    updatePassword(email: string, olderPassord: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUserUrl}/updatePassword/${email}`, { password, olderPassord });
    }
}
