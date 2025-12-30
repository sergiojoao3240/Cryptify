import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VaultUserService {

  private apiVaultUserUrl = 'https://api-cryptify.sgcod3.com/vaultUser';

  constructor(private http: HttpClient) {}

  createVaultUser(vaultId: string, userId: string, role: string): Observable<any> {
    return this.http.post<any>(this.apiVaultUserUrl, { vaultId, userId, role });
  }

  getVaultUsers(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiVaultUserUrl}/${vaultId}`);
  }

  deleteVaultUserByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiVaultUserUrl}/${id}`);
  }

  updateVaultUserByID(id: string, role: string): Observable<any> {
    return this.http.patch<any>(`${this.apiVaultUserUrl}/${id}`, { role });
  }

  getAllVaultUsersOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiVaultUserUrl}/vault/${vaultId}`);
  }
  
}
