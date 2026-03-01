import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

// Extended interface for UI display
interface ProductDisplay extends Product {
  icon: string;
  category: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: ProductDisplay[] = [];
  allProducts: ProductDisplay[] = [];
  searchQuery: string = '';
  darkMode = false;
  showAddProductModal = false;
  isEditing = false;

  currentProduct: Product = this.getEmptyProduct();

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // Check initial dark mode preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.darkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.productService.getProducts().subscribe(data => {
      const displayData = data.map(p => this.mapProductToDisplay(p));
      this.products = displayData;
      this.allProducts = displayData;
      this.onSearch();
    });
  }

  mapProductToDisplay(product: Product): ProductDisplay {
    // Assign generic icon and category since they are removed from schema
    // In a real app, category might be a separate field or relation
    return {
      ...product,
      icon: 'inventory_2', // Default icon
      category: 'General' // Default category
    };
  }

  getEmptyProduct(): Product {
    return {
      _id: '',
      name: '',
      description: '',
      hsnSacCode: '',
      barcode: '',
      saleRate: 0,
      serviceCharge: 0,
      gstRate: 18
    };
  }

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.products = this.allProducts;
    } else {
      this.products = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.hsnSacCode?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(this.searchQuery.toLowerCase())
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
    this.currentProduct = this.getEmptyProduct();
    this.showAddProductModal = true;
  }

  openEditModal(product: ProductDisplay) {
    this.isEditing = true;
    // We can cast back to Product or just pass the display object (extra fields ignored)
    // But strictly speaking we should probably strip them if we were being very clean.
    // However, for this UI it's fine.
    const { icon, category, ...cleanProduct } = product;
    this.currentProduct = { ...cleanProduct };
    this.showAddProductModal = true;
  }

  closeModal() {
    this.showAddProductModal = false;
  }

  saveProduct() {
    if (this.isEditing) {
      this.productService.updateProduct(this.currentProduct).subscribe({
        next: () => {
          this.refreshProducts();
          this.closeModal();
        },
        error: (err) => console.error('Error updating product:', err)
      });
    } else {
      // Create a copy without _id for new products to let backend generate it
      const { _id, ...newProductParams } = this.currentProduct;
      this.productService.addProduct(newProductParams as Product).subscribe({
        next: () => {
          this.refreshProducts();
          this.closeModal();
        },
        error: (err) => console.error('Error adding product:', err)
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.refreshProducts();
        },
        error: (err) => console.error('Error deleting product:', err)
      });
    }
  }

  // Helper method to refresh the product list from the backend
  private refreshProducts() {
    this.productService.getProducts().subscribe(data => {
      const displayData = data.map(p => this.mapProductToDisplay(p));
      this.products = displayData;
      this.allProducts = displayData;
      this.onSearch();
    });
  }
}
