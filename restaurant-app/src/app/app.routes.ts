import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/overview/overview.component').then(m => m.OverviewComponent),
  },
  {
    path: 'pick',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/table-picker/table-picker.component').then(m => m.TablePickerComponent),
    data: { mode: 'tables' },
  },
  {
    path: 'pick/takeaway',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/table-picker/table-picker.component').then(m => m.TablePickerComponent),
    data: { mode: 'takeaway' },
  },
  {
    path: 'table/:key',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/order-entry/order-entry.component').then(m => m.OrderEntryComponent),
  },
  {
    path: 'send/:key',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/send/send.component').then(m => m.SendComponent),
  },
];
