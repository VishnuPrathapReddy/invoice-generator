import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CompanyService, CompanyDetails } from '../../services/company.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css'
})
export class CompanyDetailsComponent implements OnInit {

  companyDetails: CompanyDetails = {
    name: '',
    gstin: '',
    address: '',
    email: '',
    phone: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    declaration: ''
  };

  darkMode = false;

  constructor(private companyService: CompanyService) { }

  ngOnInit(): void {
    // Check initial dark mode preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.darkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.companyService.getCompanyDetails().subscribe(details => {
      this.companyDetails = { ...details };
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
  saveDetails() {
    this.companyService.updateCompanyDetails(this.companyDetails).subscribe({
      next: (res) => {
        alert('Company details saved successfully to the database!');
      },
      error: (err) => {
        console.error('Failed to save company details:', err);
        alert('Failed to save company details. ' + (err.error?.message || err.message));
      }
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyDetails.logoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSignatureSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyDetails.signatureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

}
