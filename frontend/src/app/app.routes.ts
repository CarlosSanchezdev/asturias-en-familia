import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/map/map.component').then((m) => m.MapComponent),
    title: 'Asturias en Familia — Mapa',
  },
  {
    path: 'actividad/:id',
    loadComponent: () =>
      import('./features/map/components/activity-detail/activity-detail.component').then(
        (m) => m.ActivityDetailComponent
      ),
    title: 'Detalle de actividad',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [authGuard],
    title: 'Panel de administración',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
    title: 'Acceso',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
