import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerListComponent } from './customers/customer-list/customer-list.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { CreateInvoiceComponent } from './invoices/create-invoice/create-invoice.component';

import { CompanyDetailsComponent } from './settings/company-details/company-details.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
    { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
    { path: 'invoices/create', component: CreateInvoiceComponent, canActivate: [AuthGuard] },
    { path: 'settings/company', component: CompanyDetailsComponent, canActivate: [AuthGuard] }
];
