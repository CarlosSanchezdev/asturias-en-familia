import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'visitor';
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/api/auth`;

  // ─── Estado con signals ────────────────────────────────────
  readonly accessToken = signal<string | null>(
    sessionStorage.getItem('access_token')
  );
  readonly currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // ─── Métodos ───────────────────────────────────────────────

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password });
  }

  register(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { email, password });
  }

  setSession(response: AuthResponse): void {
    sessionStorage.setItem('access_token', response.accessToken);
    this.accessToken.set(response.accessToken);
    this.currentUser.set(response.user);
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  loadCurrentUser(): void {
    if (!this.accessToken()) return;
    this.http.get<User>(`${this.baseUrl}/me`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => this.logout(),
    });
  }
}
