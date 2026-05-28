import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Activity, Category } from './activities.service';

export interface ActivityPayload {
  name: string;
  shortDescription?: string;
  description?: string;
  category: string;
  zone: 'oriente' | 'centro' | 'occidente';
  municipality?: string;
  price: number;
  accessible: boolean;
  languages: string[];
  location: { type: 'Point'; coordinates: [number, number] };
  mapLeft: number;
  mapTop: number;
  active?: boolean;
  website?: string;
  phone?: string;
  address?: string;
  schedule?: string;
  tips?: string;
}

export interface Submission {
  _id: string;
  name: string;
  zone: string;
  municipality: string;
  contact: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  getAllActivities() {
    return this.http.get<{ data: Activity[]; pagination: unknown }>(
      `${this.base}/activities`
    );
  }

  getActivity(id: string) {
    return this.http.get<Activity>(`${this.base}/activities/${id}`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createActivity(payload: ActivityPayload) {
    return this.http.post<Activity>(`${this.base}/activities`, payload);
  }

  updateActivity(id: string, payload: Partial<ActivityPayload>) {
    return this.http.put<Activity>(`${this.base}/activities/${id}`, payload);
  }

  deleteActivity(id: string) {
    return this.http.delete(`${this.base}/activities/${id}`);
  }

  getSubmissions(status = 'pending') {
    return this.http.get<Submission[]>(`${this.base}/submissions?status=${status}`);
  }

  approveSubmission(id: string) {
    return this.http.post(`${this.base}/submissions/${id}/approve`, {});
  }

  rejectSubmission(id: string, note?: string) {
    return this.http.post(`${this.base}/submissions/${id}/reject`, { note });
  }
}
