import { Component } from '@angular/core';

@Component({
  selector: 'aef-map',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#FDF8F0">
      <div style="text-align:center">
        <h1 style="color:#2A4D1E;font-size:2rem">🗺️ Asturias en Familia</h1>
        <p style="color:#6B6B6B;margin-top:1rem">Mapa interactivo — en construcción</p>
        <p style="color:#2A4D1E;margin-top:0.5rem;font-size:0.9rem">Sprint 5 · Frontend</p>
      </div>
    </div>
  `,
})
export class MapComponent {}
