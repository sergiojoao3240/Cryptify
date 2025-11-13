import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';  
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PasskeyService {
  
  private apiPasskeyUrl = 'http://localhost:85/passkeys';
  
  constructor(private http: HttpClient) {}

  createPasskey(name: string, vaultId: string, username: string, password: string, categoryId?: string): Observable<any> {
    return this.http.post<any>(this.apiPasskeyUrl, { name, vaultId, username, password, categoryId });
  }

  getPasskeysById(passkeyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPasskeyUrl}/${passkeyId}`);
  }

  deletePasskeyByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiPasskeyUrl}/${id}`);
  }

  updatePasskeyByID(id: string, name?: string, username?: string, password?: string, categoryId?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiPasskeyUrl}/${id}`, { name, username, password, categoryId });
  }

  getAllPasskeysOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPasskeyUrl}/vault/${vaultId}`);
  }

  exportPasskeysOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPasskeyUrl}/export/vault/${vaultId}`);
  }

  // importPasskeysToVault(vaultId: string, file: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiPasskeyUrl}/import/vault/${vaultId}`, { passkeys });
  // }

}
