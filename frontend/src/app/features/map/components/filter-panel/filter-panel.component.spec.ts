import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChanges, SimpleChange } from '@angular/core';
import { FilterPanelComponent } from './filter-panel.component';
import { CategoriesService } from '../../../../core/services/categories.service';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;
  let categoriesServiceSpy: jasmine.SpyObj<CategoriesService>;

  beforeEach(async () => {
    categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', { iconUrl: 'assets/icons/playa.svg' });
    categoriesServiceSpy.iconUrl.and.callFake((icon: string) => {
      if (!icon) return '';
      if (icon.startsWith('http')) return icon;
      return `assets/icons/${icon}`;
    });

    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent],
      providers: [{ provide: CategoriesService, useValue: categoriesServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    component.categories = [];
    fixture.detectChanges();
  });

  // ─── BLOQUE 1 — Inicialización ────────────────────────────────────────────

  describe('Inicialización', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('activeCategories arranca como array vacío', () => {
      expect(component.activeCategories()).toEqual([]);
    });

    it('onlyFree arranca como false', () => {
      expect(component.onlyFree()).toBe(false);
    });

    it('activeZone arranca como string vacío', () => {
      expect(component.activeZone()).toBe('');
    });

    it('onlyAccessible arranca como false', () => {
      expect(component.onlyAccessible()).toBe(false);
    });

    it('drawerOpen arranca como false', () => {
      expect(component.drawerOpen()).toBe(false);
    });
  });

  // ─── BLOQUE 2 — toggleCategory ────────────────────────────────────────────

  describe('toggleCategory', () => {
    it('añade la categoría cuando la lista está vacía', () => {
      component.toggleCategory('abc');
      expect(component.activeCategories()).toEqual(['abc']);
    });

    it('elimina la categoría si ya estaba activa', () => {
      component.toggleCategory('abc');
      component.toggleCategory('abc');
      expect(component.activeCategories()).toEqual([]);
    });

    it('emite categoriesChange con el nuevo array', () => {
      const emitted: string[][] = [];
      component.categoriesChange.subscribe((v: string[]) => emitted.push(v));

      component.toggleCategory('abc');

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual(['abc']);
    });

    it('al añadir dos categorías distintas, ambas están en activeCategories', () => {
      component.toggleCategory('abc');
      component.toggleCategory('xyz');

      expect(component.activeCategories()).toContain('abc');
      expect(component.activeCategories()).toContain('xyz');
    });
  });

  // ─── BLOQUE 3 — isCategoryActive ─────────────────────────────────────────

  describe('isCategoryActive', () => {
    it('devuelve true si el id está en activeCategories', () => {
      component.toggleCategory('abc');
      expect(component.isCategoryActive('abc')).toBe(true);
    });

    it('devuelve false si el id no está en activeCategories', () => {
      expect(component.isCategoryActive('xyz')).toBe(false);
    });
  });

  // ─── BLOQUE 4 — selectZone ────────────────────────────────────────────────

  describe('selectZone', () => {
    it('pone activeZone a la zona indicada', () => {
      component.selectZone('oriente');
      expect(component.activeZone()).toBe('oriente');
    });

    it('llamar selectZone dos veces con la misma zona vuelve a vacío (toggle)', () => {
      component.selectZone('oriente');
      component.selectZone('oriente');
      expect(component.activeZone()).toBe('');
    });

    it('emite zoneChange con la zona seleccionada', () => {
      const emitted: string[] = [];
      component.zoneChange.subscribe((v: string) => emitted.push(v));

      component.selectZone('oriente');

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBe('oriente');
    });

    it('al cambiar de zona activa, solo queda activa la nueva', () => {
      component.selectZone('oriente');
      component.selectZone('occidente');

      expect(component.activeZone()).toBe('occidente');
      expect(component.isZoneActive('oriente')).toBe(false);
    });
  });

  // ─── BLOQUE 5 — isZoneActive ──────────────────────────────────────────────

  describe('isZoneActive', () => {
    it('devuelve true si la zona coincide con activeZone', () => {
      component.selectZone('centro');
      expect(component.isZoneActive('centro')).toBe(true);
    });

    it('devuelve false si la zona no coincide', () => {
      component.selectZone('centro');
      expect(component.isZoneActive('oriente')).toBe(false);
    });
  });

  // ─── BLOQUE 6 — toggleFree ────────────────────────────────────────────────

  describe('toggleFree', () => {
    it('cambia onlyFree de false a true', () => {
      component.toggleFree();
      expect(component.onlyFree()).toBe(true);
    });

    it('dos llamadas vuelven onlyFree a false', () => {
      component.toggleFree();
      component.toggleFree();
      expect(component.onlyFree()).toBe(false);
    });

    it('emite freeChange con el nuevo valor', () => {
      const emitted: boolean[] = [];
      component.freeChange.subscribe((v: boolean) => emitted.push(v));

      component.toggleFree();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBe(true);
    });
  });

  // ─── BLOQUE 7 — toggleAccessible ─────────────────────────────────────────

  describe('toggleAccessible', () => {
    it('cambia onlyAccessible a true', () => {
      component.toggleAccessible();
      expect(component.onlyAccessible()).toBe(true);
    });

    it('dos llamadas vuelven onlyAccessible a false', () => {
      component.toggleAccessible();
      component.toggleAccessible();
      expect(component.onlyAccessible()).toBe(false);
    });

    it('emite accessibleChange con el nuevo valor', () => {
      const emitted: boolean[] = [];
      component.accessibleChange.subscribe((v: boolean) => emitted.push(v));

      component.toggleAccessible();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBe(true);
    });
  });

  // ─── BLOQUE 8 — openDrawer / closeDrawer / scrollChips ───────────────────

  describe('openDrawer / closeDrawer', () => {
    it('openDrawer pone drawerOpen a true', () => {
      component.openDrawer();
      expect(component.drawerOpen()).toBe(true);
    });

    it('closeDrawer pone drawerOpen a false', () => {
      component.closeDrawer();
      expect(component.drawerOpen()).toBe(false);
    });

    it('closeDrawer después de openDrawer pone drawerOpen a false', () => {
      component.openDrawer();
      component.closeDrawer();
      expect(component.drawerOpen()).toBe(false);
    });
  });

  describe('scrollChips', () => {
    it("scrollChips('right') no lanza error", () => {
      expect(() => component.scrollChips('right')).not.toThrow();
    });

    it("scrollChips('left') no lanza error", () => {
      expect(() => component.scrollChips('left')).not.toThrow();
    });
  });

  // ─── BLOQUE 9 — clearFilters ──────────────────────────────────────────────

  describe('clearFilters', () => {
    beforeEach(() => {
      component.selectZone('oriente');
      component.toggleCategory('abc');
      component.toggleFree();
      component.toggleAccessible();
    });

    it('resetea todos los signals a sus valores iniciales', () => {
      component.clearFilters();

      expect(component.activeCategories()).toEqual([]);
      expect(component.activeZone()).toBe('');
      expect(component.onlyFree()).toBe(false);
      expect(component.onlyAccessible()).toBe(false);
    });

    it('emite categoriesChange con []', () => {
      const emitted: string[][] = [];
      component.categoriesChange.subscribe((v: string[]) => emitted.push(v));

      component.clearFilters();

      expect(emitted[emitted.length - 1]).toEqual([]);
    });

    it('emite zoneChange con string vacío', () => {
      const emitted: string[] = [];
      component.zoneChange.subscribe((v: string) => emitted.push(v));

      component.clearFilters();

      expect(emitted[emitted.length - 1]).toBe('');
    });

    it('emite freeChange con false', () => {
      const emitted: boolean[] = [];
      component.freeChange.subscribe((v: boolean) => emitted.push(v));

      component.clearFilters();

      expect(emitted[emitted.length - 1]).toBe(false);
    });

    it('emite accessibleChange con false', () => {
      const emitted: boolean[] = [];
      component.accessibleChange.subscribe((v: boolean) => emitted.push(v));

      component.clearFilters();

      expect(emitted[emitted.length - 1]).toBe(false);
    });
  });

  // ─── BLOQUE — ngOnChanges ─────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('no lanza error al recibir cambio en categories', () => {
      const changes: SimpleChanges = { categories: new SimpleChange(undefined, [], false) };
      expect(() => component.ngOnChanges(changes)).not.toThrow();
    });
  });

  // ─── BLOQUE — onScroll ────────────────────────────────────────────────────

  describe('onScroll', () => {
    it('no lanza error al llamar a onScroll()', () => {
      expect(() => component.onScroll()).not.toThrow();
    });
  });

  // ─── BLOQUE — iconUrl ─────────────────────────────────────────────────────

  describe('iconUrl', () => {
    it("iconUrl('playa.svg') devuelve un string", () => {
      expect(typeof component.iconUrl('playa.svg')).toBe('string');
    });

    it("iconUrl('') devuelve string vacío", () => {
      expect(component.iconUrl('')).toBe('');
    });

    it("iconUrl con URL http devuelve esa misma URL", () => {
      const url = 'http://example.com/icon.svg';
      expect(component.iconUrl(url)).toBe(url);
    });
  });
});
