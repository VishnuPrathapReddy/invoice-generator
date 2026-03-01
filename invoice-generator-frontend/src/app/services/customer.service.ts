import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Customer {
  _id: string;
  name: string;
  contactNumber: string;
  businessType: 'Individual' | 'Proprietor' | 'Partnership' | 'Company' | 'Other';
  address: string;
  gstin?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<ApiResponse<Customer[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(this.apiUrl, customer)
      .pipe(map(response => response.data));
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/${customer._id}`, customer)
      .pipe(map(response => response.data));
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
