import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  hsnSacCode?: string;
  barcode?: string;
  saleRate: number;
  serviceCharge: number;
  gstRate: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product)
      .pipe(map(response => response.data));
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${product._id}`, product)
      .pipe(map(response => response.data));
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
