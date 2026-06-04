import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'aef-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  @Input() title = '¿Confirmar acción?';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
