import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: '/list', pathMatch: 'full'},
    {path: 'list', loadChildren: () => import('./list/list.routes')},
    { path: 'list-product-supplier/:id', loadChildren: () => import('./list-product-supplier/list-product-supplier.routes')},
    {path: '**', redirectTo: '/list'},
];
