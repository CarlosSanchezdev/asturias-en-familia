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
    path: 'categorias',
    loadComponent: () =>
      import('./categories.component').then((m) => m.CategoriesComponent),
    title: 'Categorías',
  },
  {
    path: 'categorias/nueva',
    loadComponent: () =>
      import('./category-form.component').then((m) => m.CategoryFormComponent),
    title: 'Nueva categoría',
  },
  {
    path: 'categorias/:id/editar',
    loadComponent: () =>
      import('./category-form.component').then((m) => m.CategoryFormComponent),
    title: 'Editar categoría',
  },
];
