import { Component, Output, EventEmitter, OnDestroy, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'aef-map-header',
  standalone: true,
  imports: [],
  templateUrl: './map-header.component.html',
  styleUrl: './map-header.component.scss',
})
export class MapHeaderComponent implements OnDestroy {
  @Output() searchChange = new EventEmitter<string>();

  readonly searchValue = signal('');

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(text => this.searchChange.emit(text));
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchValue.set('');
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
