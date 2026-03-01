import { TestBed } from '@angular/core/testing';
import { InvoiceService } from './invoice.service';
import { CustomerService } from './customer.service';
import { ProductService } from './product.service';
import { of } from 'rxjs';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    const customerServiceSpy = jasmine.createSpyObj('CustomerService', ['getCustomers']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);

    customerServiceSpy.getCustomers.and.returnValue(of([]));
    productServiceSpy.getProducts.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        InvoiceService,
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: ProductService, useValue: productServiceSpy }
      ]
    });
    service = TestBed.inject(InvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
