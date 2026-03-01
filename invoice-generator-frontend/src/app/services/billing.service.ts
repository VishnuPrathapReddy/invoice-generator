import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CompanyService } from './company.service';

export interface KPI {
  title: string;
  amount: string;
  subtitle: string;
  trend: string;
  trendColor: string; // 'text-green-600' | 'text-red-600' | 'text-slate-400'
  trendBg: string; // 'bg-green-50' | 'bg-red-50' | 'bg-slate-50'
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface Client {
  name: string;
  initials?: string;
  logo?: string;
  logoBg?: string; // for initials background
  logoColor?: string; // for initials text color
}

export interface Invoice {
  id: string;
  client: Client;
  contact: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Generated';
}

export interface InvoiceDetails extends Invoice {
  billedTo: {
    name: string;
    address: string;
    contact: string;
    gstin: string;
  };
  placeOfSupply: string;
  paymentMode: string;
  items: {
    description: string;
    hsnSac: string;
    quantity: number;
    rate: number;
    serviceCharge: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
  }[];
  bankDetails: {
    bankName: string;
    accountNo: string;
    ifsc: string;
    upiId: string;
  };
  totals: {
    baseAmount: number;
    serviceCharge: number;
    cgst: number;
    sgst: number;
    roundOff: number;
    grandTotal: number;
    amountInWords: string;
  };
  companyLogo?: string;
  companySignature?: string;
}

interface DashboardApiResponse {
  success: boolean;
  data: {
    kpis: KPI[];
    recentInvoices: Invoice[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient, private companyService: CompanyService) { }

  getKPIs(): Observable<KPI[]> {
    return this.http.get<DashboardApiResponse>(this.apiUrl).pipe(
      map(res => res.data.kpis)
    );
  }

  getRecentInvoices(): Observable<Invoice[]> {
    return this.http.get<DashboardApiResponse>(this.apiUrl).pipe(
      map(res => res.data.recentInvoices)
    );
  }

  getInvoiceDetails(id: string): Observable<InvoiceDetails> {
    const invoice$ = this.http.get<{ success: boolean, data: any }>(`${environment.apiUrl}/invoices/${id}`);
    const company$ = this.companyService.getCompanyDetails();

    return combineLatest([invoice$, company$]).pipe(
      map(([res, companyDetails]) => {
        const inv = res.data;

        // Use realistic defaults if not directly on the schema
        const cgstSgst = inv.gstType === 'In State (CGST + SGST)' ? (inv.totalGST / 2) : 0;
        const igst = inv.gstType === 'Out of State (IGST)' ? inv.totalGST : 0;

        return {
          id: inv.invoiceNumber,
          client: {
            name: inv.customer?.name || 'Unknown Client',
            initials: inv.customer?.name?.substring(0, 2).toUpperCase() || 'NA'
          },
          contact: inv.customer?.contactNumber || 'N/A',
          date: new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          amount: `₹ ${inv.grandTotal.toLocaleString('en-IN')}`,
          status: 'Generated',
          billedTo: {
            name: inv.customer?.name || 'Unknown',
            address: inv.customer?.address || 'N/A',
            contact: inv.customer?.contactNumber || 'N/A',
            gstin: inv.customer?.gstin || 'N/A'
          },
          placeOfSupply: inv.placeOfSupply || 'N/A',
          paymentMode: inv.paymentMode || 'Cash',
          items: inv.items.map((item: any) => ({
            description: item.description,
            hsnSac: item.hsnSac || '-',
            quantity: item.qty || 1,
            rate: item.rate || 0,
            serviceCharge: item.serviceCharge || 0,
            gstPercent: item.gstRate || 0,
            gstAmount: item.gstAmount || 0,
            total: item.total || 0
          })),
          bankDetails: {
            bankName: companyDetails.bankName || 'HDFC BANK',
            accountNo: companyDetails.accountNumber || '50200078830687',
            ifsc: companyDetails.ifscCode || 'HDFC0004312',
            upiId: companyDetails.upiId || 'N/A'
          },
          totals: {
            baseAmount: inv.subTotal || 0,
            serviceCharge: inv.items.reduce((sum: number, i: any) => sum + (i.serviceCharge || 0), 0),
            cgst: cgstSgst,
            sgst: cgstSgst,
            roundOff: 0.00,
            grandTotal: inv.grandTotal || 0,
            amountInWords: this.amountToWords(inv.grandTotal) + ' Rupees Only'
          },
          companyLogo: companyDetails.logoUrl,
          companySignature: companyDetails.signatureUrl
        } as InvoiceDetails;
      })
    );
  }

  // Simple number to words converter specifically for Indian format since external packages had compilation issues
  private amountToWords(amount: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) return 'Zero';

    amount = Math.floor(amount);
    const n = ('000000000' + amount).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);

    if (!n) return '';

    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';

    return str.trim();
  }
}
