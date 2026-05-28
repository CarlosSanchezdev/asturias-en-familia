import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, Submission } from '../../core/services/admin.service';

@Component({
  selector: 'aef-pending-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pending-list.component.html',
  styleUrl: './pending-list.component.scss',
})
export class PendingListComponent implements OnInit {
  private admin = inject(AdminService);

  submissions = signal<Submission[]>([]);
  loading = signal(true);
  error = signal('');
  actionError = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.admin.getSubmissions('pending').subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las solicitudes');
        this.loading.set(false);
      },
    });
  }

  approve(id: string): void {
    this.actionError.set('');
    this.admin.approveSubmission(id).subscribe({
      next: () => this.submissions.update((list) => list.filter((s) => s._id !== id)),
      error: () => this.actionError.set('Error al aprobar la solicitud'),
    });
  }

  reject(id: string): void {
    const note = prompt('Nota de rechazo (opcional):') ?? undefined;
    this.actionError.set('');
    this.admin.rejectSubmission(id, note || undefined).subscribe({
      next: () => this.submissions.update((list) => list.filter((s) => s._id !== id)),
      error: () => this.actionError.set('Error al rechazar la solicitud'),
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
}
