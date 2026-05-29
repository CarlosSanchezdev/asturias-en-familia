import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Activity {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category: Category;
  location: { type: string; coordinates: [number, number] };
  zone: 'oriente' | 'centro' | 'occidente';
  municipality?: string;
  images: string[];
  accessible: boolean;
  priceText?: string;
  free: boolean;
  languages: string[];
  website?: string;
  phone?: string;
  address?: string;
  schedule?: string;
  tips?: string;
  mapLeft: number;
  mapTop: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface ActivitiesFilters {
  category?: string;
  free?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/activities`;

  // ─── Estado reactivo con signals ──────────────────────────
  readonly activities = signal<Activity[]>([]);
  readonly selectedActivity = signal<Activity | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filters = signal<ActivitiesFilters>({});

  readonly filteredCount = computed(() => this.activities().length);

  // ─── Métodos ───────────────────────────────────────────────

  loadActivities(filters: ActivitiesFilters = {}): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.filters.set(filters);

    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.free)     params = params.set('free', 'true');
    if (filters.search)     params = params.set('search', filters.search);
    if (filters.page)       params = params.set('page', filters.page.toString());
    if (filters.limit)      params = params.set('limit', filters.limit.toString());

    this.http.get<PaginatedResponse<Activity>>(this.baseUrl, { params }).subscribe({
      next: (res) => {
        this.activities.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Error al cargar actividades');
        this.isLoading.set(false);
      },
    });
  }

  loadActivity(id: string): void {
    this.isLoading.set(true);
    this.http.get<Activity>(`${this.baseUrl}/${id}`).subscribe({
      next: (activity) => {
        this.selectedActivity.set(activity);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Actividad no encontrada');
        this.isLoading.set(false);
      },
    });
  }

  selectActivity(activity: Activity | null): void {
    this.selectedActivity.set(activity);
  }
}
