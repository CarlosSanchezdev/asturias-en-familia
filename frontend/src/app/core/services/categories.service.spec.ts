import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoriesService, AdminCategory, CategoryPayload } from './categories.service';
import { environment } from '../../../environments/environment';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/api`;

  const mockCategory: AdminCategory = {
    _id: 'c1',
    name: 'Playas',
    slug: 'playas',
    icon: 'playa.svg',
    color: '#2AACAB',
    active: true,
    order: 1,
  };

  const mockPayload: CategoryPayload = {
    name: 'Playas',
    slug: 'playas',
    icon: 'playa.svg',
    color: '#2AACAB',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriesService],
    });
    service  = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── BLOQUE 1 — Inicialización ────────────────────────────────────────────

  describe('Inicialización', () => {
    it('el servicio se crea correctamente', () => {
      expect(service).toBeTruthy();
    });
  });

  // ─── BLOQUE 2 — getCategories ─────────────────────────────────────────────

  describe('getCategories', () => {
    it('hace GET a /api/categories?all=true', () => {
      service.getCategories().subscribe();

      const req = httpMock.expectOne(`${base}/categories?all=true`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('devuelve el array de categorías de la respuesta', (done) => {
      service.getCategories().subscribe((cats) => {
        expect(cats).toEqual([mockCategory]);
        done();
      });

      httpMock.expectOne(`${base}/categories?all=true`).flush([mockCategory]);
    });
  });

  // ─── BLOQUE 3 — getCategory ───────────────────────────────────────────────

  describe('getCategory', () => {
    it('hace GET a /api/categories/:id con el id correcto', () => {
      service.getCategory('c1').subscribe();

      const req = httpMock.expectOne(`${base}/categories/c1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });

    it('devuelve la categoría de la respuesta', (done) => {
      service.getCategory('c1').subscribe((cat) => {
        expect(cat).toEqual(mockCategory);
        done();
      });

      httpMock.expectOne(`${base}/categories/c1`).flush(mockCategory);
    });
  });

  // ─── BLOQUE 4 — createCategory ────────────────────────────────────────────

  describe('createCategory', () => {
    it('hace POST a /api/categories con el payload correcto', () => {
      service.createCategory(mockPayload).subscribe();

      const req = httpMock.expectOne(`${base}/categories`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockCategory);
    });

    it('devuelve la categoría creada', (done) => {
      service.createCategory(mockPayload).subscribe((cat) => {
        expect(cat).toEqual(mockCategory);
        done();
      });

      httpMock.expectOne(`${base}/categories`).flush(mockCategory);
    });
  });

  // ─── BLOQUE 5 — updateCategory ────────────────────────────────────────────

  describe('updateCategory', () => {
    const update: Partial<CategoryPayload> = { name: 'Playas updated' };

    it('hace PUT a /api/categories/:id con los datos correctos', () => {
      service.updateCategory('c1', update).subscribe();

      const req = httpMock.expectOne(`${base}/categories/c1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockCategory, ...update });
    });

    it('devuelve la categoría actualizada', (done) => {
      const updated = { ...mockCategory, name: 'Playas updated' };
      service.updateCategory('c1', update).subscribe((cat) => {
        expect(cat.name).toBe('Playas updated');
        done();
      });

      httpMock.expectOne(`${base}/categories/c1`).flush(updated);
    });
  });

  // ─── BLOQUE 6 — toggleActive ──────────────────────────────────────────────

  describe('toggleActive', () => {
    it('hace PUT a /api/categories/:id con { active: true }', () => {
      service.toggleActive('c1', true).subscribe();

      const req = httpMock.expectOne(`${base}/categories/c1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ active: true });
      req.flush({ ...mockCategory, active: true });
    });

    it('hace PUT a /api/categories/:id con { active: false }', () => {
      service.toggleActive('c1', false).subscribe();

      const req = httpMock.expectOne(`${base}/categories/c1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ active: false });
      req.flush({ ...mockCategory, active: false });
    });
  });

  // ─── BLOQUE 7 — iconUrl ───────────────────────────────────────────────────

  describe('iconUrl', () => {
    it('devuelve string vacío si icon es string vacío', () => {
      expect(service.iconUrl('')).toBe('');
    });

    it('devuelve la misma URL si icon empieza por http', () => {
      const url = 'https://cdn.example.com/icon.svg';
      expect(service.iconUrl(url)).toBe(url);
    });

    it('devuelve apiUrl + icon si icon empieza por /', () => {
      expect(service.iconUrl('/uploads/playa.svg'))
        .toBe(`${environment.apiUrl}/uploads/playa.svg`);
    });

    it('devuelve assets/icons/ + icon si es nombre simple', () => {
      expect(service.iconUrl('playa.svg')).toBe('assets/icons/playa.svg');
    });
  });
});
