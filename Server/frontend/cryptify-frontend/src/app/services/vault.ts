import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VaultService {

  private apiVaultUrl = 'http://localhost:85/vaults';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  createVault(name: string): Observable<any> {
    return this.http.post<any>(this.apiVaultUrl, { name }, { headers: this.getHeaders() });
  }

  getAVaultByID(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiVaultUrl}/${id}`, { headers: this.getHeaders() });
  }

  deleteVaultByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiVaultUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateVaultByID(id: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiVaultUrl}/${id}`, { name }, { headers: this.getHeaders() });
  }

  getAllMyVaults(): Observable<any> {
    return this.http.get<any>(`${this.apiVaultUrl}/me`, { headers: this.getHeaders() });
  }

  getAllVaults(query?: {[key: string]: string}): Observable<any> {
    let params = new HttpParams();
    if (query) {
      for (const key in query) {
        if (query.hasOwnProperty(key)) {
          params = params.set(key, query[key]);
        }
      }
    }
    return this.http.get<any>(this.apiVaultUrl, { headers: this.getHeaders(), params });  
  }
  
}
