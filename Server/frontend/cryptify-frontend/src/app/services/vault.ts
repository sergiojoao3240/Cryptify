import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VaultService {

  private apiVaultUrl = 'http://localhost:85/vaults';

  private token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  createVault(name: string): Observable<any> {
    return this.http.post<any>(this.apiVaultUrl, { name });
  }

  getAVaultByID(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiVaultUrl}/${id}`);
  }

  deleteVaultByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiVaultUrl}/${id}`);
  }

  updateVaultByID(id: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiVaultUrl}/${id}`, { name });
  }

  getAllMyVaults(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}` 
    });
    return this.http.get<any>(`${this.apiVaultUrl}/me`, { headers});
  }
  
}
