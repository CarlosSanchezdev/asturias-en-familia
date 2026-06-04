import { Component, OnDestroy, AfterViewInit, inject, effect, signal, computed } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ActivitiesService, Activity } from "../../core/services/activities.service";
import { CategoriesService } from "../../core/services/categories.service";
import { ActivityPopupComponent } from "./components/activity-popup/activity-popup.component";
import { FilterPanelComponent } from "./components/filter-panel/filter-panel.component";
import { MapHeaderComponent } from "./components/map-header/map-header.component";
import * as L from "leaflet";

interface ScreenConfig {
	maxSize: number;
	zoomBounds: L.LatLngBoundsExpression;
	dragBounds: L.LatLngBoundsExpression;
	initialZoom: number;
	initialCenter: L.LatLngExpression; // 🔥 Nueva propiedad para controlar la altura inicial
}

const SCREEN_CONFIGS: ScreenConfig[] = [
	{
		maxSize: 767, // 📱 MOBILE
		zoomBounds: [
			[42.2, -7.2],
			[43.9, -4.5],
		],
		dragBounds: [
			[42.2, -7.2],
			[43.9, -4.5],
		],
		initialZoom: 7,
		initialCenter: [43.55, -5.85],
	},
	{
		maxSize: 1199, // 	TABLET
		zoomBounds: [
			[42.2, -7.4],
			[43.9, -4.3],
		],
		dragBounds: [
			[42.2, -7.4],
			[43.9, -4.3],
		],
		initialZoom: 8.5,
		initialCenter: [43.36, -5.85],
	},
	{
		maxSize: 2600,
		zoomBounds: [
			[42.6, -7.7],
			[44.05, -4.0],
		],
		dragBounds: [
			[42.75, -7.64],
			[43.85, -4.04],
		],
		initialZoom: 9.5,
		initialCenter: [43.68, -5.85], // El centro que te gusta
	},
	{
		maxSize: Infinity, // 🖥️ PANTALLAS GIGANTES
		zoomBounds: [
			[41.5, -7.9],
			[44.3, -3.9],
		],
		dragBounds: [
			[41.5, -7.9],
			[44.3, -3.9],
		],
		initialZoom: 8.5,
		initialCenter: [43.36, -5.85],
	},
];
@Component({
	selector: "aef-map",
	standalone: true,
	imports: [ActivityPopupComponent, FilterPanelComponent, MapHeaderComponent],
	templateUrl: "./map.component.html",
	styleUrl: "./map.component.scss",
})
export class MapComponent implements AfterViewInit, OnDestroy {
	readonly activitiesService = inject(ActivitiesService);
	private readonly categoriesService = inject(CategoriesService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);
	private map!: L.Map;
	private markersLayer = L.layerGroup();

	readonly activeCategories = signal<string[]>([]);
	readonly onlyFree = signal(false);
	readonly activeZone = signal<string>("");
	readonly onlyAccessible = signal(false);
	readonly searchText = signal("");
	readonly resetSignal = signal(0);

	// Valores iniciales leídos de la URL (se asignan en el constructor)
	initialCats: string[] = [];
	initialFree = false;
	initialZone = "";
	initialAccessible = false;
	initialSearch = "";

	readonly filteredActivities = computed(() => {
		let result = this.activitiesService.activities();

		const cats = this.activeCategories();
		if (cats.length > 0) {
			result = result.filter(a => {
				const catSlug = typeof a.category === "object" ? a.category.slug : (a.category as string);
				return cats.includes(catSlug);
			});
		}

		if (this.onlyFree()) {
			result = result.filter(a => a.free);
		}

		const zone = this.activeZone();
		if (zone) {
			result = result.filter(a => a.zone === zone);
		}

		if (this.onlyAccessible()) {
			result = result.filter(a => a.accessible);
		}

		const q = this.searchText().trim().toLowerCase();
		if (q) {
			result = result.filter(a => a.name.toLowerCase().includes(q));
		}

		return result;
	});

	readonly resultCount = computed(() => this.filteredActivities().length);

	constructor() {
		const params = this.route.snapshot.queryParams;

		if (params['category']) {
			const cats = (params['category'] as string).split(',').filter(Boolean);
			this.activeCategories.set(cats);
			this.initialCats = cats;
		}
		if (params['free'] === 'true') {
			this.onlyFree.set(true);
			this.initialFree = true;
		}
		if (params['zone']) {
			this.activeZone.set(params['zone']);
			this.initialZone = params['zone'];
		}
		if (params['accessible'] === 'true') {
			this.onlyAccessible.set(true);
			this.initialAccessible = true;
		}
		if (params['q']) {
			this.searchText.set(params['q']);
			this.initialSearch = params['q'];
		}

		effect(() => {
			const activities = this.filteredActivities();
			if (this.map) {
				this.renderMarkers(activities);
			}
		});

		effect(() => {
			const cats = this.activeCategories();
			const free = this.onlyFree();
			const zone = this.activeZone();
			const accessible = this.onlyAccessible();
			const q = this.searchText();

			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: {
					category: cats.length ? cats.join(',') : null,
					free: free || null,
					zone: zone || null,
					accessible: accessible || null,
					q: q || null,
				},
				replaceUrl: true,
			});
		});
	}

	ngAfterViewInit(): void {
		this.initMap();
		this.activitiesService.loadActivities();
		this.activitiesService.loadCategories();
	}

	getCurrentScreenConfig(): ScreenConfig {
		const longestSide = Math.max(window.innerWidth, window.innerHeight);

		// Busca la primera regla que sea mayor o igual al tamaño de nuestra pantalla
		return SCREEN_CONFIGS.find(config => longestSide <= config.maxSize)!;
	}

	private initMap(): void {
		const mapBounds: L.LatLngBoundsExpression = [
			[42.2, -7.3],
			[43.9, -4.5],
		];

		// Bounds del SVG — solo para calibrar el overlay
		const svgBounds: L.LatLngBoundsExpression = [
			[42.71, -7.64],
			[43.85, -4.04],
		];

		// Obtenemos la configuración exacta para la pantalla actual
		const screenConfig = this.getCurrentScreenConfig();

		this.map = L.map("map", {
			center: screenConfig.initialCenter,
			zoom: screenConfig.initialZoom,
			maxBounds: screenConfig.dragBounds,
			maxBoundsViscosity: 1.0,
			maxZoom: 12,
			zoomControl: false,
			wheelPxPerZoomLevel: 120,
			zoomSnap: 0.5,
			zoomDelta: 0.5,
		});

		// Forzamos límites de zoom dinámicos contra los bordes blancos
		const perfectMinZoom = this.map.getBoundsZoom(screenConfig.zoomBounds, true);
		this.map.setMinZoom(perfectMinZoom);

		// Evento Resize completamente plano
		window.addEventListener("resize", () => {
			this.map.invalidateSize();

			const newConfig = this.getCurrentScreenConfig();

			// Actualizamos el muro de arrastre
			this.map.setMaxBounds(newConfig.dragBounds);

			// Actualizamos el cálculo del zoom con la caja de zoom
			const newMinZoom = this.map.getBoundsZoom(newConfig.zoomBounds, true);
			this.map.setMinZoom(newMinZoom);

			if (this.map.getZoom() < newMinZoom) {
				this.map.setZoom(newMinZoom);
			}
		});

		// Controles y capas finales
		L.control.zoom({ position: "bottomright" }).addTo(this.map);
		L.imageOverlay("assets/maps/asturias_municipal.svg", svgBounds, {}).addTo(this.map);
		// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		// 	attribution: "© OpenStreetMap",
		// }).addTo(this.map);
		document.getElementById("map")!.style.background = "#f0fafd81";
		this.markersLayer.addTo(this.map);
		(window as any)["debugMap"] = this.map;
	}

	private createCategoryIcon(category: any): L.DivIcon {
		const mobile = window.innerWidth < 768;
		const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
		const size = mobile ? 24 : isTablet ? 28 : 32;
		const tip = Math.round(size * 0.45);
		const half = Math.round(size * 0.32);
		const iconPx = Math.round(size * 0.52);
		const color = category?.color || "#2A4D1E";
		const iconFile = category?.icon;

		const inner = iconFile
			? `<img src="${this.categoriesService.iconUrl(iconFile)}"
				style="width:${iconPx}px;height:${iconPx}px;object-fit:contain;" />`
			: `<span style="font-size:${iconPx}px;line-height:1;">📍</span>`;

		const html = `
			<div style="position:relative;width:${size}px;cursor:pointer;
				filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
				<div style="
					width:${size}px;height:${size}px;
					background:white;
					border-radius:50%;
					border:3px solid ${color};
					display:flex;align-items:center;justify-content:center;
					overflow:hidden;box-sizing:border-box;">
					${inner}
				</div>
				<div style="
					position:absolute;bottom:-${tip}px;left:50%;
					transform:translateX(-50%);
					width:0;height:0;
					border-left:${half}px solid transparent;
					border-right:${half}px solid transparent;
					border-top:${tip}px solid ${color};">
				</div>
			</div>`;

		return L.divIcon({
			html,
			className: "",
			iconSize: [size, size + tip],
			iconAnchor: [size / 2, size + tip + 5],
		});
	}

	private renderMarkers(activities: Activity[]): void {
		this.markersLayer.clearLayers();
		activities.forEach(activity => {
			const [lng, lat] = activity.location.coordinates;
			const icon = this.createCategoryIcon(activity.category);
			const marker = L.marker([lat, lng], { icon });
			let tooltipTimeout: ReturnType<typeof setTimeout>;

			marker.on("mouseover", () => {
				tooltipTimeout = setTimeout(() => {
					marker
						.bindTooltip(this.createTooltipHTML(activity), {
							permanent: false,
							direction: "top",
							offset: [0, -10],
							className: "custom-map-tooltip",
							opacity: 1,
						})
						.openTooltip();
				}, 250);
			});

			marker.on("mouseout", () => {
				clearTimeout(tooltipTimeout);
				marker.closeTooltip();
				marker.unbindTooltip();
			});

			marker.on("click", () => this.activitiesService.selectActivity(activity));
			marker.addTo(this.markersLayer);
		});
	}

	private createTooltipHTML(activity: Activity): string {
		return `<div>
			<strong style="font-size:13px;display:block;margin-bottom:4px">
				${activity.name}
			</strong>
			<p style="font-size:12px;color:#555;margin:0 0 6px 0;line-height:1.3">
				${activity.shortDescription?.slice(0, 60) ?? ""}...
			</p>
			<span style="font-size:11px;color:#2A4D1E;font-weight:600;cursor:pointer">
				Haz clic en el icono para ver m&aacute;s
			</span>
		</div>`;
	}

	clearFilters(): void {
		this.activeZone.set("");
		this.activeCategories.set([]);
		this.onlyFree.set(false);
		this.onlyAccessible.set(false);
		this.searchText.set("");
		this.resetSignal.update(n => n + 1);
	}

	ngOnDestroy(): void {
		this.map.remove();
	}
}
