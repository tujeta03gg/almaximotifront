import { Routes } from '@angular/router';
const listRoutes:Routes = [
    { path: '', loadComponent: () => import('./list.component').then(m => m.ListComponent) },
];

export default listRoutes