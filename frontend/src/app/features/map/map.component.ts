import { Component, OnDestroy, AfterViewInit, inject, effect, signal, computed } from "@angular/core";
import { ActivitiesService, Activity } from "../../core/services/activities.service";
import { CategoriesService } from "../../core/services/categories.service";
import { ActivityPopupComponent } from "./components/activity-popup/activity-popup.component";
import { FilterPanelComponent } from "./components/filter-panel/filter-panel.component";
import { MapHeaderComponent } from "./components/map-header/map-header.component";
import * as L from "leaflet";

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
	private map!: L.Map;
	private markersLayer = L.layerGroup();

	readonly activeCategories = signal<string[]>([]);
	readonly onlyFree = signal(false);
	readonly activeZone = signal<string>("");
	readonly onlyAccessible = signal(false);
	readonly searchText = signal("");

	readonly filteredActivities = computed(() => {
		let result = this.activitiesService.activities();

		const cats = this.activeCategories();
		if (cats.length > 0) {
			result = result.filter(a => {
				const catId = typeof a.category === "object" ? a.category._id : (a.category as string);
				return cats.includes(catId);
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
		effect(() => {
			const activities = this.filteredActivities();
			if (this.map) {
				this.renderMarkers(activities);
			}
		});
	}

	ngAfterViewInit(): void {
		this.initMap();
		this.activitiesService.loadActivities();
		this.activitiesService.loadCategories();
	}

	private initMap(): void {
		const mapBounds: L.LatLngBoundsExpression = [
			[42.8, -7.5],
			[43.8, -4.2],
		];

		// Bounds del SVG — solo para calibrar el overlay
		const svgBounds: L.LatLngBoundsExpression = [
			[42.71, -7.64],
			[43.85, -4.04],
		];

		const isMobile = window.innerWidth < 768;
		const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
		const isLargeTablet = window.innerWidth >= 1024 && window.innerWidth <= 1440;
		const initialZoom = isMobile ? 8 : isTablet ? 9 : isLargeTablet ? 9 : 10;

		this.map = L.map("map", {
			center: [43.36, -5.85],
			zoom: initialZoom,
			minZoom: isMobile ? 7 : 8,
			maxZoom: 12,
			maxBounds: mapBounds, // ← usa mapBounds aquí
			maxBoundsViscosity: 1.0,
			zoomControl: false,
			wheelPxPerZoomLevel: 120,
			zoomSnap: 0.5,
			zoomDelta: 0.5,
		});

		window.addEventListener("resize", () => {
			const newMobile = window.innerWidth < 768;
			if (newMobile) {
				this.map.setZoom(8.5);
			}
		});

		L.control.zoom({ position: "bottomright" }).addTo(this.map);

		L.imageOverlay("assets/maps/asturias_municipal.svg", svgBounds, {}).addTo(this.map); // ← usa svgBounds aquí

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap",
		}).addTo(this.map);

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
				${activity.description?.slice(0, 60) ?? ""}...
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
	}

	ngOnDestroy(): void {
		this.map.remove();
	}
}
