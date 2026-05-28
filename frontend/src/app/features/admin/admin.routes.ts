import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    title: 'Panel de administración',
  },
  {
    path: 'actividades/nueva',
    loadComponent: () =>
      import('./activity-form.component').then((m) => m.ActivityFormComponent),
    title: 'Nueva actividad',
  },
  {
    path: 'actividades/:id/editar',
    loadComponent: () =>
      import('./activity-form.component').then((m) => m.ActivityFormComponent),
    title: 'Editar actividad',
  },
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./pending-list.component').then((m) => m.PendingListComponent),
    title: 'Solicitudes pendientes',
  },
];
