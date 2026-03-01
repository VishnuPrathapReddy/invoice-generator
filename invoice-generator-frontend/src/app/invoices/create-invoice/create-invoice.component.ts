import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, Invoice, InvoiceItem } from '../../services/invoice.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Customer } from '../../services/customer.service';
import { Product } from '../../services/product.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css'
})
export class CreateInvoiceComponent implements OnInit {
  customers: Customer[] = [];
  products: Product[] = []; // Renamed from services
  darkMode = false;
  currentUser: any = null;

  // Form Data
  invoiceType = 'Sale Invoice';
  selectedCustomer: Customer | null = null;
  invoiceNumber = 'Inv-6';
  invoiceDate = new Date().toISOString().split('T')[0];
  placeOfSupply = '';
  paymentMode = 'Cash';
  gstType = 'In State (CGST + SGST)';
  priceType = 'Exclusive of Tax';
  notes = '';

  // New Item Data
  barcodeScan = '';
  selectedProduct: Product | null = null;
  description = '';
  qty = 1;
  rate = 0;
  serviceCharge = 0;

  // Items List
  items: InvoiceItem[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
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

    this.invoiceService.getCustomers().subscribe(data => this.customers = data);
    this.invoiceService.getProducts().subscribe(data => this.products = data);
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

  // Auto-fill logic when product is selected
  onProductSelect() {
    if (this.selectedProduct) {
      this.description = this.selectedProduct.description || this.selectedProduct.name;
      this.rate = this.selectedProduct.saleRate || 0;
    }
  }

  addItem() {
    if (!this.selectedProduct && !this.description) {
      alert('Please select a product or enter a description.');
      return;
    }

    const itemDesc = this.selectedProduct ? this.selectedProduct.name : this.description;
    // Use product's GST rate if available
    const gstRate = this.selectedProduct ? this.selectedProduct.gstRate : 18;

    const baseTotal = this.qty * this.rate + Number(this.serviceCharge);

    let gstAmount = 0;
    if (this.priceType === 'Exclusive of Tax') {
      gstAmount = (baseTotal * gstRate) / 100;
    } else {
      // Inclusive
      gstAmount = baseTotal - (baseTotal * (100 / (100 + gstRate)));
    }

    const newItem: InvoiceItem = {
      product: this.selectedProduct?._id, // Add product ID reference
      description: itemDesc,
      qty: this.qty,
      rate: this.rate,
      serviceCharge: Number(this.serviceCharge),
      gstRate: gstRate,
      gstAmount: gstAmount,
      total: baseTotal + (this.priceType === 'Exclusive of Tax' ? gstAmount : 0)
    };

    this.items.push(newItem);

    // Reset form
    this.selectedProduct = null;
    this.description = '';
    this.qty = 1;
    this.rate = 0;
    this.serviceCharge = 0;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  get subTotal() {
    return this.items.reduce((acc, item) => acc + (item.qty * item.rate + item.serviceCharge), 0);
  }

  get totalGST() {
    return this.items.reduce((acc, item) => acc + item.gstAmount, 0);
  }

  get grandTotal() {
    return this.items.reduce((acc, item) => acc + item.total, 0);
  }

  saveInvoice() {
    if (!this.selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (this.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const invoice: Invoice = {
      invoiceType: this.invoiceType,
      customer: this.selectedCustomer._id, // Send ID, not object or name
      invoiceNumber: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      placeOfSupply: this.placeOfSupply,
      paymentMode: this.paymentMode,
      gstType: this.gstType,
      priceType: this.priceType,
      items: this.items,
      notes: this.notes,
      subTotal: this.subTotal,
      discount: 0,
      totalGST: this.totalGST,
      grandTotal: this.grandTotal
    };

    this.invoiceService.createInvoice(invoice).subscribe({
      next: (res) => {
        alert('Invoice created successfully!');
        // Refresh or redirect
        this.items = [];
        this.invoiceNumber = `INV-${Math.floor(Math.random() * 1000)}`;
      },
      error: (err) => {
        console.error('Save invoice error:', err);
        alert('Failed to save invoice. ' + (err.error?.message || err.message));
      }
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
