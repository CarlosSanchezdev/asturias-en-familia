import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  active: boolean;
  order: number;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  order?: number;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  getCategories() {
    return this.http.get<AdminCategory[]>(`${this.base}/categories?all=true`);
  }

  getCategory(id: string) {
    return this.http.get<AdminCategory>(`${this.base}/categories/${id}`);
  }

  createCategory(data: CategoryPayload) {
    return this.http.post<AdminCategory>(`${this.base}/categories`, data);
  }

  updateCategory(id: string, data: Partial<CategoryPayload>) {
    return this.http.put<AdminCategory>(`${this.base}/categories/${id}`, data);
  }

  toggleActive(id: string, active: boolean) {
    return this.http.put<AdminCategory>(`${this.base}/categories/${id}`, { active });
  }

  uploadIcon(file: File) {
    const formData = new FormData();
    formData.append('icon', file);
    return this.http.post<{ url: string; filename: string }>(`${this.base}/uploads/icon`, formData);
  }

  iconUrl(icon: string): string {
    if (!icon) return '';
    if (icon.startsWith('http')) return icon;
    if (icon.startsWith('/')) return `${environment.apiUrl}${icon}`;
    return `assets/icons/${icon}`;
  }
}
