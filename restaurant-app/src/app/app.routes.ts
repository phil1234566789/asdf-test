import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/overview/overview.component').then(m => m.OverviewComponent),
  },
  {
    path: 'pick',
    loadComponent: () =>
      import('./pages/table-picker/table-picker.component').then(m => m.TablePickerComponent),
    data: { mode: 'tables' },
  },
  {
    path: 'pick/takeaway',
    loadComponent: () =>
      import('./pages/table-picker/table-picker.component').then(m => m.TablePickerComponent),
    data: { mode: 'takeaway' },
  },
  {
    path: 'table/:key',
    loadComponent: () =>
      import('./pages/order-entry/order-entry.component').then(m => m.OrderEntryComponent),
  },
  {
    path: 'send/:key',
    loadComponent: () =>
      import('./pages/send/send.component').then(m => m.SendComponent),
  },
];
