import { Routes } from '@angular/router';
const listProductSupplierRoutes:Routes = [
    { path: '', loadComponent: () => import('./list-product-supplier.component').then(m => m.ListComponent) },
];

export default listProductSupplierRoutes