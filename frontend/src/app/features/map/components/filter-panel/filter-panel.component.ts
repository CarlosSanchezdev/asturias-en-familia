import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { Category } from '../../../../core/services/activities.service';
import { CategoriesService } from '../../../../core/services/categories.service';

@Component({
  selector: 'aef-filter-panel',
  standalone: true,
  imports: [],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {
  @Input() categories: Category[] = [];

  @Output() categoriesChange = new EventEmitter<string[]>();
  @Output() freeChange = new EventEmitter<boolean>();

  private readonly categoriesService = inject(CategoriesService);

  readonly activeCategories = signal<string[]>([]);
  readonly onlyFree = signal(false);

  toggleCategory(id: string): void {
    const current = this.activeCategories();
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    this.activeCategories.set(updated);
    this.categoriesChange.emit(updated);
  }

  isCategoryActive(id: string): boolean {
    return this.activeCategories().includes(id);
  }

  toggleFree(): void {
    const next = !this.onlyFree();
    this.onlyFree.set(next);
    this.freeChange.emit(next);
  }

  iconUrl(icon: string): string {
    return this.categoriesService.iconUrl(icon ?? '');
  }
}
