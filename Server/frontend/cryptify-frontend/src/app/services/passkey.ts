import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';  
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PasskeyService {
  
  private apiPasskeyUrl = 'https://api-cryptify.sgcod3.com/passkeys';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  constructor(private http: HttpClient) {}

  createPasskey(name: string, vaultId: string, username: string, password: string, categoryId?: string): Observable<any> {
    return this.http.post<any>(this.apiPasskeyUrl, { name, vaultId, username, password, categoryId }, { headers: this.getHeaders() });
  }

  getPasskeysById(passkeyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPasskeyUrl}/${passkeyId}`, { headers: this.getHeaders() });
  }

  deletePasskeyByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiPasskeyUrl}/${id}`, { headers: this.getHeaders() });
  }

  updatePasskeyByID(id: string, name?: string, username?: string, password?: string, categoryId?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiPasskeyUrl}/${id}`, { name, username, password, categoryId }, { headers: this.getHeaders() });
  }

  getAllPasskeysOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPasskeyUrl}/vault/${vaultId}`, { headers: this.getHeaders() });
  }

  exportPasskeysOfVault(vaultId: string): Observable<HttpResponse<Blob>> {
    const url = `${this.apiPasskeyUrl}/export/vault/${vaultId}`;
    return this.http.get(url, { headers: this.getHeaders(), responseType: 'blob', observe: 'response' });
  }

  // importPasskeysToVault(vaultId: string, file: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiPasskeyUrl}/import/vault/${vaultId}`, { passkeys });
  // }

}
