import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Product } from '../list/list.component';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EditProductService {
  constructor(private dialog: MatDialog) { }

  openModal<CT, T = {}>(componentRef: ComponentType<CT>, data?: T, isEditing = false): void {
      const config = { data, isEditing };
    this.dialog.open(componentRef, {
      data: config,
      width: '600px',
    });
  }
}
