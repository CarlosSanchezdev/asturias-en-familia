import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// Construye un JWT mínimo con payload ASCII para que atob/btoa funcione en JSDOM
function makeJwt(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload));
  return `eyJhbGciOiJIUzI1NiJ9.${body}.fakesignature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;
  const authUrl = `${environment.apiUrl}/api/auth`;

  beforeEach(() => {
    sessionStorage.clear();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    sessionStorage.clear();
    httpMock.verify();
  });

  // ─── BLOQUE 1 — Inicialización ────────────────────────────────────────────

  describe('Inicialización', () => {
    it('el servicio se crea correctamente', () => {
      expect(service).toBeTruthy();
    });

    it('accessToken arranca como null si sessionStorage está vacío', () => {
      expect(service.accessToken()).toBeNull();
    });

    it('isAuthenticated arranca como false', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('isAdmin arranca como false', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('currentUser arranca como null', () => {
      expect(service.currentUser()).toBeNull();
    });
  });

  // ─── BLOQUE 2 — setSession ────────────────────────────────────────────────

  describe('setSession', () => {
    const adminSession = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { _id: '1', email: 'admin@test.com', role: 'admin' as const },
    };

    it('accessToken() devuelve el token tras setSession', () => {
      service.setSession(adminSession);
      expect(service.accessToken()).toBe('token123');
    });

    it('isAuthenticated() devuelve true tras setSession con token válido', () => {
      service.setSession(adminSession);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('isAdmin() devuelve true si el user tiene role admin', () => {
      service.setSession(adminSession);
      expect(service.isAdmin()).toBe(true);
    });

    it('isAdmin() devuelve false si el user tiene role visitor', () => {
      service.setSession({
        ...adminSession,
        user: { ...adminSession.user, role: 'visitor' as const },
      });
      expect(service.isAdmin()).toBe(false);
    });
  });

  // ─── BLOQUE 3 — logout ────────────────────────────────────────────────────

  describe('logout', () => {
    beforeEach(() => {
      service.setSession({
        accessToken: 'token123',
        refreshToken: 'refresh123',
        user: { _id: '1', email: 'admin@test.com', role: 'admin' as const },
      });
    });

    it('accessToken() devuelve null tras logout', () => {
      service.logout();
      expect(service.accessToken()).toBeNull();
    });

    it('isAuthenticated() devuelve false tras logout', () => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('isAdmin() devuelve false tras logout', () => {
      service.logout();
      expect(service.isAdmin()).toBe(false);
    });

    it('currentUser() devuelve null tras logout', () => {
      service.logout();
      expect(service.currentUser()).toBeNull();
    });
  });

  // ─── BLOQUE 4 — restoreSession ────────────────────────────────────────────

  describe('restoreSession', () => {
    it('mantiene accessToken si sessionStorage tenía un JWT válido al arrancar', () => {
      // accessToken se inicializa desde sessionStorage al crear el servicio.
      // Simulamos ese estado asignando directamente el signal con un JWT válido.
      const jwt = makeJwt({ sub: 'u1', email: 'test@test.com', role: 'visitor' });
      service.accessToken.set(jwt);

      service.restoreSession();

      expect(service.accessToken()).toBe(jwt);
    });

    it('deja accessToken como null si sessionStorage estaba vacío', () => {
      // El servicio se creó con sessionStorage limpio → accessToken() ya es null.
      service.restoreSession();
      expect(service.accessToken()).toBeNull();
    });
  });

  // ─── BLOQUE — login con respuesta correcta ────────────────────────────────

  describe('login con respuesta correcta', () => {
    it('actualiza accessToken e isAuthenticated al suscribirse y llamar setSession', () => {
      // login() devuelve un observable; el componente llama setSession() en el subscribe.
      service.login('test@test.com', 'password123')
        .subscribe(res => service.setSession(res));

      const req = httpMock.expectOne(`${authUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush({
        accessToken: 'tok',
        refreshToken: 'refresh',
        user: { _id: '1', email: 'test@test.com', role: 'admin' },
      });

      expect(service.accessToken()).toBe('tok');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  // ─── BLOQUE — login con error ─────────────────────────────────────────────

  describe('login con error', () => {
    it('no modifica accessToken si la petición falla', () => {
      service.login('test@test.com', 'wrongpass').subscribe({ error: () => {} });

      httpMock
        .expectOne(`${authUrl}/login`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(service.accessToken()).toBeNull();
    });
  });

  // ─── BLOQUE — restoreSession con token en sessionStorage ──────────────────

  describe('restoreSession con token en sessionStorage', () => {
    it('conserva accessToken si el signal ya tiene un JWT válido', () => {
      // restoreSession() lee del signal (inicializado desde sessionStorage al
      // crear el servicio). Sincronizamos sessionStorage y signal para simular
      // que el token estaba guardado antes de la instanciación.
      const jwt = makeJwt({ sub: 'u1', email: 'test@test.com', role: 'visitor' });
      sessionStorage.setItem('access_token', jwt);
      service.accessToken.set(jwt);

      service.restoreSession();

      expect(service.accessToken()).toBe(jwt);
    });
  });

  // ─── BLOQUE — restoreSession sin token ───────────────────────────────────

  describe('restoreSession sin token', () => {
    it('deja accessToken como null si sessionStorage está vacío', () => {
      // beforeEach limpió sessionStorage → el signal arrancó como null.
      service.restoreSession();
      expect(service.accessToken()).toBeNull();
    });
  });

  // ─── BLOQUE — setSession con role visitor ────────────────────────────────

  describe('setSession con role visitor', () => {
    const visitorSession = {
      accessToken: 'tok',
      refreshToken: 'refresh',
      user: { _id: '2', email: 'v@test.com', role: 'visitor' as const },
    };

    it('isAdmin() es false para role visitor', () => {
      service.setSession(visitorSession);
      expect(service.isAdmin()).toBe(false);
    });

    it('isAuthenticated() es true para role visitor', () => {
      service.setSession(visitorSession);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  // ─── BLOQUE — loadCurrentUser ─────────────────────────────────────────────

  describe('loadCurrentUser', () => {
    it('actualiza currentUser tras recibir respuesta correcta', () => {
      service.accessToken.set('some-token');
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${authUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ _id: '1', email: 'a@a.com', role: 'admin' });

      expect(service.currentUser()).not.toBeNull();
    });
  });

  // ─── BLOQUE — register ────────────────────────────────────────────────────

  describe('register', () => {
    it('hace POST a /api/auth/register y completa sin error', () => {
      let completed = false;
      service.register('new@test.com', 'Password1').subscribe({
        next: () => (completed = true),
      });

      const req = httpMock.expectOne(`${authUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush({
        accessToken: 'tok',
        refreshToken: 'r',
        user: { _id: '1', email: 'new@test.com', role: 'visitor' },
      });

      expect(completed).toBe(true);
    });
  });

  // ─── BLOQUE — restoreSession con token expirado ───────────────────────────

  describe('restoreSession con token expirado', () => {
    it('hace logout y deja accessToken null', () => {
      const expiredPayload = {
        sub: '1', email: 'a@a.com', role: 'admin',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const fakeToken = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.sig';
      service.accessToken.set(fakeToken);

      service.restoreSession();

      expect(service.accessToken()).toBeNull();
    });
  });

  // ─── BLOQUE — restoreSession con token válido sin sub (usa id) ────────────

  describe('restoreSession con token válido con id en lugar de sub', () => {
    it('currentUser() no es null', () => {
      const payload = {
        id: '123', email: 'b@b.com', role: 'visitor',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
      service.accessToken.set(fakeToken);

      service.restoreSession();

      expect(service.currentUser()).not.toBeNull();
    });
  });

  // ─── BLOQUE — restoreSession con token válido sin email ───────────────────

  describe('restoreSession con token válido sin email', () => {
    it('currentUser().email es string vacío', () => {
      const payload = {
        sub: '1', role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
      service.accessToken.set(fakeToken);

      service.restoreSession();

      expect(service.currentUser()?.email).toBe('');
    });
  });

  // ─── BLOQUE — restoreSession con token válido sin role ────────────────────

  describe('restoreSession con token válido sin role', () => {
    it('currentUser().role usa el valor por defecto visitor', () => {
      const payload = {
        sub: '1', email: 'c@c.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
      service.accessToken.set(fakeToken);

      service.restoreSession();

      expect(service.currentUser()?.role).toBe('visitor');
    });
  });

  // ─── BLOQUE — restoreSession con token inválido (catch) ──────────────────

  describe('restoreSession con token inválido', () => {
    it('hace logout por el catch y deja accessToken null', () => {
      // 'invalido' es base64 válido pero JSON.parse del resultado falla → catch
      service.accessToken.set('token.invalido.nobase64');

      service.restoreSession();

      expect(service.accessToken()).toBeNull();
    });
  });

  // ─── BLOQUE — loadCurrentUser sin token ──────────────────────────────────

  describe('loadCurrentUser sin token', () => {
    it('no hace ninguna petición HTTP si accessToken es null', () => {
      service.accessToken.set(null);
      service.loadCurrentUser();

      httpMock.expectNone(`${authUrl}/me`);
    });
  });

  // ─── BLOQUE — loadCurrentUser con error HTTP ─────────────────────────────

  describe('loadCurrentUser con error HTTP', () => {
    it('hace logout y deja accessToken null al recibir error 401', () => {
      service.accessToken.set('valid-token');
      service.loadCurrentUser();

      httpMock
        .expectOne(`${authUrl}/me`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(service.accessToken()).toBeNull();
    });
  });
});
