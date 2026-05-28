import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { Activity } from '../../core/services/activities.service';

type StatusFilter = 'todas' | 'activas' | 'inactivas';

@Component({
  selector: 'aef-admin-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private admin = inject(AdminService);
  private router = inject(Router);

  activities = signal<Activity[]>([]);
  loading = signal(true);
  error = signal('');

  searchQuery = signal('');
  statusFilter = signal<StatusFilter>('todas');

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    return this.activities().filter((a) => {
      const matchesSearch = !q || a.name.toLowerCase().includes(q);
      const matchesStatus =
        status === 'todas' ||
        (status === 'activas' && a.active) ||
        (status === 'inactivas' && !a.active);
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.error.set('');
    this.admin.getAllActivities().subscribe({
      next: (res) => {
        this.activities.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las actividades');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }

  editActivity(id: string): void {
    this.router.navigate(['/admin/actividades', id, 'editar']);
  }

  toggleActive(activity: Activity): void {
    this.admin.updateActivity(activity._id, { active: !activity.active }).subscribe({
      next: (updated) => {
        this.activities.update((list) =>
          list.map((a) => (a._id === updated._id ? updated : a))
        );
      },
      error: () => this.error.set('Error al actualizar la actividad'),
    });
  }

  formatZone(zone: string): string {
    const map: Record<string, string> = {
      oriente: 'Oriente',
      centro: 'Centro',
      occidente: 'Occidente',
    };
    return map[zone] ?? zone;
  }

  logout(): void {
    this.auth.logout();
  }
}
