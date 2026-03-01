import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CompanyDetails {
  name: string;
  gstin: string;
  address: string;
  email: string;
  phone: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  declaration: string;
  logoUrl?: string;
  signatureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/company`;

  private defaultCompany: CompanyDetails = {
    name: 'SRI TIRUMALA TRAVELS',
    gstin: '37BWKPG2725FZ2L',
    address: '2ND FLOOR, 1-8, SOUTH STREET, NEAR MAIN ROAD, ALURU VILLAGE, KARAVADI, PRAKASAM, ANDHRA PRADESH, INDIA-523182',
    email: 'reganreddy0@gmail.com',
    phone: '+91 8897218014',
    bankName: 'HDFC BANK',
    branchName: 'VIP ROAD ONGOLE',
    accountNumber: '50200078830687',
    ifscCode: 'HDFC0004312',
    upiId: '',
    declaration: 'Processing/Convenience fee includes GST. In the event the customer is eligible for discounts, the processing/convenience fee will be accordingly calculated in the tax invoice issued to the customer. This is an electronically generated invoice and does not require a physical signature.',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO4kBiPEg6V0bZ0w__P8FC7HXxZ7JPcrOJcvnUz8F75Dxv34hDevCyXEXUHWdKEsJwzoBMJSp-gBFV7tamfGe5nwGgg4OxlXLOaB8wmEWgXnPc_3ZCMOV5Oko1u5WsDUOlTqeJ0bT-O3eCqmFRZuVNd6VguoI8h9fmtC9K0c6KJZq27HzeRYa7bLS0Gwro95yAIz905QES15IKv0TxsyIWe6g6FzGRaotBPfUVPyPpS09lmXjbCsljz4w5ZeK9XBiA6VfZugoZPK2u'
  };

  private companyDetailsSubject = new BehaviorSubject<CompanyDetails>(this.defaultCompany);
  companyDetails$ = this.companyDetailsSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Fetch company details from the backend db
   */
  getCompanyDetails(): Observable<CompanyDetails> {
    return this.http.get<{ success: boolean, data: CompanyDetails }>(this.apiUrl).pipe(
      map(res => {
        if (res.data) {
          this.companyDetailsSubject.next(res.data);
          return res.data;
        }
        // If first launch, return defaults
        return this.defaultCompany;
      }),
      catchError(err => {
        console.error('Failed to load company details, falling back to default:', err);
        return of(this.defaultCompany);
      })
    );
  }

  /**
   * Update/Upsert company details to the backend db
   */
  updateCompanyDetails(details: CompanyDetails): Observable<CompanyDetails> {
    return this.http.put<{ success: boolean, message: string, data: CompanyDetails }>(this.apiUrl, details).pipe(
      map(res => {
        this.companyDetailsSubject.next(res.data);
        return res.data;
      })
    );
  }
}
