import { Component, Input, Output, EventEmitter, HostListener, signal, inject } from '@angular/core';
import { Activity } from '../../../../core/services/activities.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'aef-activity-popup',
  standalone: true,
  imports: [],
  templateUrl: './activity-popup.component.html',
  styleUrl: './activity-popup.component.scss',
})
export class ActivityPopupComponent {
  @Input({ required: true }) activity!: Activity;
  @Output() close = new EventEmitter<void>();

  private categoriesService = inject(CategoriesService);
  expanded = signal(false);
  closing = signal(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.requestClose();
  }

  requestClose(): void {
    this.closing.set(true);
    setTimeout(() => this.close.emit(), 280);
  }

  iconUrl(icon: string): string {
    return this.categoriesService.iconUrl(icon ?? '');
  }

  imageUrl(path: string): string {
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  }

  toggleExpand(): void {
    this.expanded.update(v => !v);
  }
}
