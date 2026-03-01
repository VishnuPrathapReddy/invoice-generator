import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService, Customer } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

// Extended interface for UI display
interface CustomerDisplay extends Customer {
  initials: string;
  logoBg: string;
  logoColor: string;
  typeBg: string;
  typeColor: string;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  customers: CustomerDisplay[] = [];
  allCustomers: CustomerDisplay[] = [];
  searchQuery: string = '';
  darkMode = false;
  showAddCustomerModal = false;
  isEditing = false;

  currentCustomer: Customer = this.getEmptyCustomer();

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    // Check initial dark mode preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.darkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.customerService.getCustomers().subscribe(data => {
      const displayData = data.map(c => this.mapCustomerToDisplay(c));
      this.customers = displayData;
      this.allCustomers = displayData;
      this.onSearch(); // Re-apply search filter if any
    });
  }

  mapCustomerToDisplay(customer: Customer): CustomerDisplay {
    // Initials Logic: First char + Random char from the name
    let initials = '';
    if (customer.name && customer.name.length > 0) {
      const firstChar = customer.name.charAt(0).toUpperCase();
      let secondChar = '';
      if (customer.name.length > 1) {
        // Get a random index from 1 to length-1
        const randomIndex = Math.floor(Math.random() * (customer.name.length - 1)) + 1;
        secondChar = customer.name.charAt(randomIndex).toUpperCase();
      }
      initials = firstChar + secondChar;
    }

    // Color Logic (Random but deterministic based on name hash would be better, but staying random for now as per previous logic, or maybe simple random from set)
    // Actually, to keep it consistent on re-renders if we edit, we should ideally hash it.
    // But for now, let's just pick based on name length or simple hash to avoid flickering.
    const colors = [
      { bg: 'bg-primary/10', text: 'text-primary' },
      { bg: 'bg-green-100', text: 'text-green-700' },
      { bg: 'bg-blue-100', text: 'text-blue-700' },
      { bg: 'bg-amber-100', text: 'text-amber-700' },
      { bg: 'bg-purple-100', text: 'text-purple-700' },
      { bg: 'bg-red-100', text: 'text-red-700' },
    ];
    // Simple hash to pick color
    let hash = 0;
    for (let i = 0; i < customer.name.length; i++) {
      hash = customer.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const randomColor = colors[colorIndex];

    // Type Logic
    let typeBg, typeColor;
    if (customer.businessType === 'Company') {
      typeBg = 'bg-blue-50 dark:bg-blue-900/30';
      typeColor = 'text-blue-700 dark:text-blue-400';
    } else {
      typeBg = 'bg-green-50 dark:bg-green-900/30';
      typeColor = 'text-green-700 dark:text-green-400';
    }

    return {
      ...customer,
      initials,
      logoBg: randomColor.bg,
      logoColor: randomColor.text,
      typeBg,
      typeColor
    };
  }

  getEmptyCustomer(): Customer {
    return {
      _id: '',
      name: '',
      contactNumber: '',
      businessType: 'Company',
      address: '',
      gstin: ''
    };
  }

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.customers = this.allCustomers;
    } else {
      this.customers = this.allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.contactNumber.includes(this.searchQuery)
      );
    }
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

  openAddModal() {
    this.isEditing = false;
    this.currentCustomer = this.getEmptyCustomer();
    this.showAddCustomerModal = true;
  }

  openEditModal(customer: CustomerDisplay) {
    this.isEditing = true;
    this.currentCustomer = { ...customer }; // Clone object to avoid direct mutation
    this.showAddCustomerModal = true;
  }

  closeModal() {
    this.showAddCustomerModal = false;
  }

  saveCustomer() {
    if (this.isEditing) {
      const { initials, logoBg, logoColor, typeBg, typeColor, ...cleanCustomer } = this.currentCustomer as CustomerDisplay;
      this.customerService.updateCustomer(cleanCustomer).subscribe({
        next: (updatedCustomer) => {
          // Update local state or re-fetch
          // For simplicity, let's just refresh the whole list
          this.refreshCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error updating customer:', err)
      });
    } else {
      const { initials, logoBg, logoColor, typeBg, typeColor, _id, ...cleanCustomer } = this.currentCustomer as CustomerDisplay;
      this.customerService.addCustomer(cleanCustomer as Customer).subscribe({
        next: (newCustomer) => {
          this.refreshCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error adding customer:', err)
      });
    }
  }

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.refreshCustomers();
        },
        error: (err) => console.error('Error deleting customer:', err)
      });
    }
  }

  // Helper method to refresh the customer list from the backend
  private refreshCustomers() {
    this.customerService.getCustomers().subscribe(data => {
      const displayData = data.map(c => this.mapCustomerToDisplay(c));
      this.customers = displayData;
      this.allCustomers = displayData;
      this.onSearch();
    });
  }
}
