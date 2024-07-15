import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { HttpClient, HttpContext } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ReactiveFormsModule,FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatIconModule, HttpClientModule, ReactiveFormsModule, MatSelectModule, MatOptionModule, CommonModule],
})
export class ListComponent implements AfterViewInit {

  API_URL = 'http://localhost:5000/products/';
  products: any = [];
  types: any[] = [];
  suppliers: any[] = [];
  productForm: FormGroup;

  
  constructor(private http: HttpClient, private router: Router,private fb: FormBuilder) { 
    this.productForm = this.fb.group({
      name: [null],
      price: [null],
      productKey: [null],
      typeId: [null],
      supplierId: [null],
      supplierProductKey: [null],
      supplierCost: [null]
    });

  }


  displayedColumns: string[] = ['edit','name', 'typeProduct', 'productKey', 'price','delete'];
  dataSource = new MatTableDataSource<Product>(this.products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.getProducts();
    this.getTypes();
    this.getSuppliers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getProducts() {
    this.http.get<any[]>(`${this.API_URL}all`).subscribe((data) => {
      this.products = data;
      this.dataSource = new MatTableDataSource<Product>(this.products);
      this.dataSource.paginator = this.paginator;
    });
  }

  getTypes(): void {
    this.http.get<any[]>(`${this.API_URL}get_types`).subscribe((data) => {
      this.types = data;
    },
    (error) => {
      this.types = [];
    }
  );
  }

  getSuppliers(): void {
    this.http.get<any[]>(`${this.API_URL}get_suppliers`).subscribe((data) => {
      this.suppliers = data;
    },
    (error) => {
      this.suppliers = [];
    }
  );
  }

  deleteProduct(productId: number): void {
    this.http.delete(`${this.API_URL}${productId}`).subscribe(
      (data) => {
        Swal.fire({
          title: 'Producto Eliminado',
          text: 'El producto ha sido eliminado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        //remove the product from the list
        this.products = this.products.filter((product: Product) => product.id !== productId);
        this.dataSource = new MatTableDataSource<Product>(this.products);
        this.dataSource.paginator = this.paginator;

      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Ha ocurrido un error al eliminar el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  editProduict (productId: number): void{
    this.router.navigate(['/list-product-supplier', productId]);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Formulario válido, datos:', this.productForm.value);
      let product = this.productForm.value;

      this.http.post(`${this.API_URL}add`, product).subscribe(
        (data) => {
          Swal.fire({
            title: 'Producto Actualizado',
            text: 'El producto ha sido guardado con éxito',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          //add type name to the product
          this.types.forEach((type: any) => {
            if (type.id === product.typeID) {
              product.typeProduct = type.name;
            }
          });
          //add the product to the top list
          this.products.unshift(product);
          this.dataSource = new MatTableDataSource<Product>(this.products);
          this.dataSource.paginator = this.paginator;

        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Ha ocurrido un error al guardar el producto',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    } else {
      console.error('Formulario inválido, verifica los campos.');
    }
  }
  
}

export interface Product {
  id: number;
  name: string;
  typeProduct: string;
  productKey: string;
  deleted: boolean;
  price: string;
}


