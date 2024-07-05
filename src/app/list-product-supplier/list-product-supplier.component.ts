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
import { EditProductService } from '../edit-product/edit-product.service';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField,MatLabel } from '@angular/material/input';
import { ReactiveFormsModule,FormBuilder, FormGroup } from '@angular/forms';
import { types } from 'util';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-list',
  templateUrl: './list-product-supplier.component.html',
  styleUrl : './list-product-supplier.component.css',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatIconModule, HttpClientModule, MatSelectModule, MatOptionModule, CommonModule, MatInput, MatFormField, MatLabel, ReactiveFormsModule,],
})
export class ListComponent implements AfterViewInit {

  API_URL = 'http://localhost:5000/Product/';
  API_URL_SELECT = 'http://localhost:5000/Select/';

  products: any = [];
  product: any;
  types: any[] = [];
  productForm: FormGroup;

  constructor(
    private http: HttpClient,
    @Inject(EditProductService) private _editProductService: EditProductService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: [null],
      typeName: [null],
      productKey: [null],
      price: [null]
    });
   }

  displayedColumns: string[] = ['edit','name', 'supplierProductKey', 'supplierCost','delete'];
  dataSource = new MatTableDataSource<Product>(this.products);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    let productId = 0;
    this.route.params.subscribe(params => {
       productId = params['id'];
    });
    this.getProducts(productId);
    this.getProduct(productId);
    this.getTypes();
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getProducts(id = 0) {
    this.http.get<any[]>(`${this.API_URL}products/${id}`).subscribe((data) => {
      this.products = data;
      this.dataSource = new MatTableDataSource<Product>(this.products);
      this.dataSource.paginator = this.paginator;
    });
  }

  getProduct(id = 0) {
    this.http.get<any>(`${this.API_URL}${id}`).subscribe((data) => {
      //set the data to the form
      this.productForm = this.fb.group({
        id: [data.id],
        name: [data.name],
        productKey: [data.productKey],
        typeName: [data.typeName],
        price: [data.price]
      });
    });
  }

  getTypes(): void {
    this.http.get<any[]>(`${this.API_URL_SELECT}get_types`).subscribe((data) => {
      this.types = data;
    },
    (error) => {
      this.types = [];
    }
  );
  }

  deleteProduct(productId: number): void {
    
    const json = {
      id: productId
    };

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: json
    };
  
    this.http.delete(`${this.API_URL}removeProduct`, options).subscribe(
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

  editProductSupplier (productId: number): void{
    let product = {
      id: null,
      name: null,
      supplierProductKey: null,
      supplierId: null,
      supplierCost: null
    };
    this.http.get<any>(`${this.API_URL}productsSupplier/${productId}`).subscribe((data) => {
      product.id = data.id;
      product.name = data.name;
      product.supplierProductKey = data.supplierProductKey;
      product.supplierId = data.supplierID;
      product.supplierCost = data.supplierCost;

      if(product == null || product.id == null){
        Swal.fire({
          title: 'Error',
          text: 'Ha ocurrido un error al obtener el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
      this._editProductService.openModal<EditProductComponent,{}>(EditProductComponent, product, true);
    });

  }

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Formulario válido, datos:', this.productForm.value);
      let product = this.productForm.value;
      //put type id in the product object
      this.types.forEach((type: any) => {
        if (type.name === product.typeName) {
          product.typeId = type.id;
        }
      });
      //remove the typeName from the object
      delete product.typeName;

      this.http.put(`${this.API_URL}modify`, product).subscribe(
        (data) => {
          Swal.fire({
            title: 'Producto Actualizado',
            text: 'El producto ha sido actualizado con éxito',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.getProducts(product.id);
        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Ha ocurrido un error al actualizar el producto',
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
  supplierProductKey: string;
  supplierCost: string;
  supplierId: number;
}


