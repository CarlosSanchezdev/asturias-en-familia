import { TestBed } from '@angular/core/testing';
import { MapProjectionService } from './map-projection.service';

describe('MapProjectionService', () => {
  let service: MapProjectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapProjectionService],
    });
    service = TestBed.inject(MapProjectionService);
  });

  // ─── BLOQUE 1 — Inicialización ────────────────────────────────────────────

  describe('Inicialización', () => {
    it('el servicio se crea correctamente', () => {
      expect(service).toBeTruthy();
    });
  });

  // ─── BLOQUE 2 — latLngToCSS ───────────────────────────────────────────────

  describe('latLngToCSS', () => {
    it('devuelve un objeto con propiedades left y top como strings terminados en %', () => {
      const result = service.latLngToCSS(43.3614, -5.8593);
      expect(typeof result.left).toBe('string');
      expect(typeof result.top).toBe('string');
      expect(result.left).toContain('%');
      expect(result.top).toContain('%');
    });

    it('Oviedo (43.3614, -5.8593) devuelve left y top dentro del rango 0%-100%', () => {
      const { left, top } = service.latLngToCSS(43.3614, -5.8593);
      const l = parseFloat(left);
      const t = parseFloat(top);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(100);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(100);
    });

    it('Gijón (43.5322, -5.6611) devuelve left y top dentro del rango 0%-100%', () => {
      const { left, top } = service.latLngToCSS(43.5322, -5.6611);
      const l = parseFloat(left);
      const t = parseFloat(top);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(100);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(100);
    });

    it('Avilés (43.5547, -5.9248) devuelve left y top dentro del rango 0%-100%', () => {
      const { left, top } = service.latLngToCSS(43.5547, -5.9248);
      const l = parseFloat(left);
      const t = parseFloat(top);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(100);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(100);
    });

    it('Gijón tiene left mayor que Avilés (está más al este)', () => {
      const gijónLeft  = parseFloat(service.latLngToCSS(43.5322, -5.6611).left);
      const avilésLeft = parseFloat(service.latLngToCSS(43.5547, -5.9248).left);
      expect(gijónLeft).toBeGreaterThan(avilésLeft);
    });

    it('Oviedo tiene top mayor que Gijón (está más al sur)', () => {
      const oviedoTop = parseFloat(service.latLngToCSS(43.3614, -5.8593).top);
      const gijónTop  = parseFloat(service.latLngToCSS(43.5322, -5.6611).top);
      expect(oviedoTop).toBeGreaterThan(gijónTop);
    });
  });

  // ─── BLOQUE 3 — latLngToSVG ───────────────────────────────────────────────

  describe('latLngToSVG', () => {
    it('devuelve un objeto con propiedades x e y como números', () => {
      const result = service.latLngToSVG(43.3614, -5.8593);
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    it('coordenadas válidas de Asturias devuelven valores positivos', () => {
      // Oviedo está dentro del SVG calibrado: svgX ≈ 383, svgY ≈ 181
      const result = service.latLngToSVG(43.3614, -5.8593);
      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBeGreaterThan(0);
    });
  });

  // ─── BLOQUE 4 — correctCoords ─────────────────────────────────────────────

  describe('correctCoords', () => {
    it('devuelve un array de 2 números', () => {
      const result = service.correctCoords(43.3614, -5.8593);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });

    it('con coordenadas válidas devuelve valores dentro del rango de Asturias', () => {
      // Oviedo corregido: lat ≈ 43.41, lng ≈ -5.85
      const [corrLat, corrLng] = service.correctCoords(43.3614, -5.8593);
      expect(corrLat).toBeGreaterThan(43);
      expect(corrLat).toBeLessThan(44);
      expect(corrLng).toBeGreaterThan(-8);
      expect(corrLng).toBeLessThan(-4);
    });
  });
});
