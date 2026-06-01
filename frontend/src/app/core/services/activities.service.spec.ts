import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivitiesService, Activity, ActivitiesFilters, PaginatedResponse } from './activities.service';
import { environment } from '../../../environments/environment';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let httpMock: HttpTestingController;
  const baseUrl       = `${environment.apiUrl}/api/activities`;
  const categoriesUrl = `${environment.apiUrl}/api/categories`;

  const mockCategory = {
    _id: 'c1', name: 'Playas', slug: 'playas', icon: 'playa.svg', color: '#2AACAB',
  };

  const mockActivity: Activity = {
    _id: '1',
    name: 'Playa de Gijón',
    category: mockCategory,
    location: { type: 'Point', coordinates: [-5.66, 43.53] },
    zone: 'centro',
    images: [],
    accessible: true,
    free: true,
    languages: ['es'],
    mapLeft: 50,
    mapTop: 50,
    active: true,
    createdAt: '',
    updatedAt: '',
  };

  const mockPage = (data: Activity[]): PaginatedResponse<Activity> => ({
    data,
    pagination: { total: data.length, page: 1, limit: 20, pages: 1 },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivitiesService],
    });
    service  = TestBed.inject(ActivitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── BLOQUE 1 — Estado inicial ────────────────────────────────────────────

  describe('Estado inicial', () => {
    it('activities() arranca como array vacío', () => {
      expect(service.activities()).toEqual([]);
    });

    it('categories() arranca como array vacío', () => {
      expect(service.categories()).toEqual([]);
    });

    it('selectedActivity() arranca como null', () => {
      expect(service.selectedActivity()).toBeNull();
    });

    it('isLoading() arranca como false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('error() arranca como null', () => {
      expect(service.error()).toBeNull();
    });

    it('filteredCount() arranca como 0', () => {
      expect(service.filteredCount()).toBe(0);
    });
  });

  // ─── BLOQUE 2 — selectActivity ────────────────────────────────────────────

  describe('selectActivity', () => {
    it('pone selectedActivity con la actividad recibida', () => {
      service.selectActivity(mockActivity);
      expect(service.selectedActivity()).toEqual(mockActivity);
    });

    it('pone selectedActivity como null al pasar null', () => {
      service.selectActivity(mockActivity);
      service.selectActivity(null);
      expect(service.selectedActivity()).toBeNull();
    });
  });

  // ─── BLOQUE 3 — loadCategories ────────────────────────────────────────────

  describe('loadCategories', () => {
    it('hace GET a /api/categories', () => {
      service.loadCategories();

      const req = httpMock.expectOne(categoriesUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('tras la respuesta categories() tiene los datos recibidos', () => {
      service.loadCategories();

      httpMock.expectOne(categoriesUrl).flush([mockCategory]);

      expect(service.categories()).toEqual([mockCategory]);
    });
  });

  // ─── BLOQUE 4 — loadActivities sin filtros ────────────────────────────────

  describe('loadActivities sin filtros', () => {
    it('hace GET a /api/activities', () => {
      service.loadActivities();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage([]));
    });

    it('isLoading() es true durante la petición', () => {
      service.loadActivities();

      expect(service.isLoading()).toBe(true);

      httpMock.expectOne(baseUrl).flush(mockPage([]));
    });

    it('tras respuesta correcta activities() tiene res.data', () => {
      service.loadActivities();

      httpMock.expectOne(baseUrl).flush(mockPage([mockActivity]));

      expect(service.activities()).toEqual([mockActivity]);
    });

    it('tras respuesta correcta isLoading() es false', () => {
      service.loadActivities();

      httpMock.expectOne(baseUrl).flush(mockPage([]));

      expect(service.isLoading()).toBe(false);
    });

    it('tras error isLoading() es false', () => {
      service.loadActivities();

      httpMock
        .expectOne(baseUrl)
        .flush({ error: 'Error interno' }, { status: 500, statusText: 'Error' });

      expect(service.isLoading()).toBe(false);
    });

    it('tras error error() tiene el mensaje de error', () => {
      service.loadActivities();

      httpMock
        .expectOne(baseUrl)
        .flush({ error: 'Error interno' }, { status: 500, statusText: 'Error' });

      expect(service.error()).toBe('Error interno');
    });
  });

  // ─── BLOQUE 5 — loadActivities con filtros ────────────────────────────────

  describe('loadActivities con filtros', () => {
    function expectParam(filters: ActivitiesFilters, param: string, value: string): void {
      service.loadActivities(filters);

      const req = httpMock.expectOne(
        (r) => r.url === baseUrl && r.params.get(param) === value,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage([]));
    }

    it('con { category: "c1" } añade ?category=c1 a la URL', () => {
      expectParam({ category: 'c1' }, 'category', 'c1');
    });

    it('con { free: true } añade ?free=true a la URL', () => {
      expectParam({ free: true }, 'free', 'true');
    });

    it('con { search: "playa" } añade ?search=playa a la URL', () => {
      expectParam({ search: 'playa' }, 'search', 'playa');
    });

    it('con { page: 2 } añade ?page=2 a la URL', () => {
      expectParam({ page: 2 }, 'page', '2');
    });
  });

  // ─── BLOQUE 6 — loadActivity ──────────────────────────────────────────────

  describe('loadActivity', () => {
    it('hace GET a /api/activities/:id', () => {
      service.loadActivity('1');

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActivity);
    });

    it('tras respuesta correcta selectedActivity() tiene la actividad', () => {
      service.loadActivity('1');

      httpMock.expectOne(`${baseUrl}/1`).flush(mockActivity);

      expect(service.selectedActivity()).toEqual(mockActivity);
    });

    it('tras error error() tiene mensaje de error', () => {
      service.loadActivity('1');

      httpMock
        .expectOne(`${baseUrl}/1`)
        .flush({ error: 'Actividad no encontrada' }, { status: 404, statusText: 'Not Found' });

      expect(service.error()).toBe('Actividad no encontrada');
    });

    it('isLoading() es false tras completar la petición', () => {
      service.loadActivity('1');

      httpMock.expectOne(`${baseUrl}/1`).flush(mockActivity);

      expect(service.isLoading()).toBe(false);
    });
  });

  // ─── BLOQUE 7 — filteredCount computed ───────────────────────────────────

  describe('filteredCount computed', () => {
    it('filteredCount() devuelve el número de activities() actuales', () => {
      service.activities.set([mockActivity]);
      expect(service.filteredCount()).toBe(1);
    });

    it('filteredCount() devuelve 2 tras activities.set con dos elementos', () => {
      service.activities.set([mockActivity, mockActivity]);
      expect(service.filteredCount()).toBe(2);
    });
  });
});
