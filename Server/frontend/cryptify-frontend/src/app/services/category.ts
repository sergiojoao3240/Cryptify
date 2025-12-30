import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  
  private apiCategoryUrl = 'https://api.cryptify.sgcod3.com/category';

  constructor(private http: HttpClient) {}

  createCategory(name: string, vaultId: string): Observable<any> {
    return this.http.post<any>(this.apiCategoryUrl, { name, vaultId });
  }

  getCategoriesOfVault(vaultId: string): Observable<any> {
    return this.http.get<any>(`${this.apiCategoryUrl}/vault/${vaultId}`);
  }

  deleteCategoryByID(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiCategoryUrl}/${id}`);
  }

  updateCategoryByID(id: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiCategoryUrl}/${id}`, { name });
  }

}
