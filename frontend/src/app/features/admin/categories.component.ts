import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoriesService, AdminCategory } from '../../core/services/categories.service';

@Component({
  selector: 'aef-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);

  categories = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal('');
  toggleError = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.categoriesService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las categorías');
        this.loading.set(false);
      },
    });
  }

  editCategory(id: string): void {
    this.router.navigate(['/admin/categorias', id, 'editar']);
  }

  toggleActive(cat: AdminCategory): void {
    this.toggleError.set('');
    this.categoriesService.toggleActive(cat._id, !cat.active).subscribe({
      next: (updated) => {
        this.categories.update((list) =>
          list.map((c) => (c._id === updated._id ? updated : c))
        );
      },
      error: (err) => {
        const msg = err.error?.error ?? 'Error al actualizar la categoría';
        this.toggleError.set(msg);
      },
    });
  }

  iconUrl(icon: string): string {
    return this.categoriesService.iconUrl(icon);
  }
}
