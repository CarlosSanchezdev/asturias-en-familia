import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    main { height: 100vh; display: flex; flex-direction: column; }
  `]
})
export class AppComponent {
  title = 'Asturias en Familia';
}
