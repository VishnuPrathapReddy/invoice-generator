import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CustomerService, Customer } from './customer.service';
import { ProductService, Product } from './product.service';

export interface InvoiceItem {
  id?: string;
  product?: string; // ObjectId
  description: string;
  qty: number;
  rate: number;
  serviceCharge: number;
  gstRate: number;
  // Calculated fields
  gstAmount: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceType: string;
  customer: string; // ObjectId
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  paymentMode: string;
  gstType: string;
  priceType: string;
  items: InvoiceItem[];
  notes?: string;
  subTotal: number;
  discount?: number;
  totalGST: number;
  grandTotal: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(
    private http: HttpClient,
    private customerService: CustomerService,
    private productService: ProductService
  ) { }

  getCustomers(): Observable<Customer[]> {
    return this.customerService.getCustomers();
  }

  getProducts(): Observable<Product[]> {
    return this.productService.getProducts();
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, invoice)
      .pipe(map(response => response.data));
  }
}
