import { Component } from '@angular/core';

@Component({
  selector: 'aef-login',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#FDF8F0">
      <div style="background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);min-width:320px">
        <h1 style="color:#2A4D1E;margin-bottom:1.5rem">Acceso admin</h1>
        <p style="color:#6B6B6B;font-size:0.9rem">Formulario de login — Sprint 7</p>
      </div>
    </div>
  `,
})
export class LoginComponent {}
