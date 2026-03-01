import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService, KPI, Invoice } from '../services/billing.service';
import { PdfService } from '../services/pdf.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  kpis: KPI[] = [];
  recentInvoices: Invoice[] = [];
  allInvoices: Invoice[] = [];
  searchQuery: string = '';
  darkMode = false;
  currentUser: any = null;

  constructor(
    private billingService: BillingService,
    private pdfService: PdfService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check initial dark mode preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.darkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.billingService.getKPIs().subscribe(data => {
      this.kpis = data;
    });

    this.billingService.getRecentInvoices().subscribe(data => {
      this.recentInvoices = data;
      this.allInvoices = data;
    });
  }

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.recentInvoices = this.allInvoices;
    } else {
      this.recentInvoices = this.allInvoices.filter(invoice =>
        invoice.client.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  downloadInvoice(id: string) {
    this.billingService.getInvoiceDetails(id).subscribe(details => {
      this.pdfService.generateInvoicePdf(details);
    });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
