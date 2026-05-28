import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<main><router-outlet /></main>`,
  styles: [`main { height: 100vh; display: flex; flex-direction: column; }`]
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  title = 'Asturias en Familia';

  ngOnInit(): void {
    this.auth.restoreSession();
  }
}
