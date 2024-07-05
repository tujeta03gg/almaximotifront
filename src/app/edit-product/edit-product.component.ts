import { Component,Inject,OnInit } from '@angular/core';
import { MatDialogContent } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatFormField,MatLabel } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef, } from '@angular/material/dialog';
import { ReactiveFormsModule,FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [MatDialogContent,MatInput,MatFormField,MatLabel,MatDialogModule, ReactiveFormsModule,MatSelectModule,MatOptionModule, HttpClientModule,CommonModule],
  templateUrl:'./edit-product.component.html',
  styleUrl:'./edit-product.component.css',
  styles: ``
})
export class EditProductComponent {

  productForm: FormGroup;
  suppliers: any[] = [];
  API_URL = 'http://localhost:5000/Select/';
  API_URL_PRODUCT = 'http://localhost:5000/Product/';
  constructor(
    public dialogRef: MatDialogRef<EditProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    console.log("data"+JSON.stringify(data));
    // Swal.fire('Error', JSON.stringify(data), 'error');
    this.productForm = this.fb.group({
      id: [data.data.id],
      name: [data.data.name],
      supplierProductKey: [data.data.supplierProductKey],
      supplierID: [data.data.supplierID],
      supplierCost: [data.data.supplierCost]
    });
  }
  ngOnInit(): void {
    this.getSuppliers(); // Fetch the data for the select
    this.route.params.subscribe(params => {
      const productId = params['id'];
    });
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

  onSave(): void {
    if (this.productForm.valid) {
      console.log('Formulario válido, datos:', this.productForm.value);
      let product = this.productForm.value;
      //put supplier id in the product object
      this.suppliers.forEach((supplier: any) => {
        if (supplier.name === product.name) {
          product.supplierId = supplier.id;
        }
      });
      //remove the supplierName from the object
      delete product.name;
      delete product.supplierID;

      this.http.put(`${this.API_URL_PRODUCT}modifyProduct`, product).subscribe(
        (data) => {
          //realod page before close
          Swal.fire({
            title: 'Producto Actualizado',
            text: 'El producto ha sido actualizado con éxito',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            location.reload();
          });
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

  onCancel(): void {
    this.dialogRef.close();
  }
}
