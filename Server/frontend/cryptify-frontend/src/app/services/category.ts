import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  
  private apiCategoryUrl = 'https://api-cryptify.sgcod3.com/category';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  createCategory(name: string, vaultId: string): Observable<any> {
    return this.http.post<any>(this.apiCategoryUrl, { name, vaultId }, { headers: this.getHeaders() });
  }

  getCategoriesOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiCategoryUrl}/vault/${vaultId}`, { headers: this.getHeaders() });
  }

  deleteCategoryByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiCategoryUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateCategoryByID(id: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiCategoryUrl}/${id}`, { name }, { headers: this.getHeaders() });
  }

}
