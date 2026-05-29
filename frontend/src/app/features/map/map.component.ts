import { Component, OnDestroy, AfterViewInit, inject, effect, signal, computed } from "@angular/core";
import { ActivitiesService, Activity } from "../../core/services/activities.service";
import { MapProjectionService } from "../../core/services/map-projection.service";
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
	private readonly projection = inject(MapProjectionService);
	private map!: L.Map;
	private markersLayer = L.layerGroup();

	readonly activeCategories = signal<string[]>([]);
	readonly onlyFree = signal(false);
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

		const q = this.searchText().trim().toLowerCase();
		if (q) {
			result = result.filter(a => a.name.toLowerCase().includes(q));
		}

		return result;
	});

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

		this.map = L.map("map", {
			center: [43.36, -5.85],
			zoom: 8,
			minZoom: 7,
			maxZoom: 12,
			maxBounds: mapBounds, // ← usa mapBounds aquí
			maxBoundsViscosity: 1.0,
			zoomControl: false,
			wheelPxPerZoomLevel: 120,
			zoomSnap: 0.5,
			zoomDelta: 0.5,
		});

		L.control.zoom({ position: "bottomright" }).addTo(this.map);

		L.imageOverlay("assets/maps/asturias_municipal.svg", svgBounds, {
			opacity: 0.5,
		}).addTo(this.map); // ← usa svgBounds aquí

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap",
		}).addTo(this.map);

		document.getElementById("map")!.style.background = "#f0fafd81";
		this.markersLayer.addTo(this.map);
		(window as any)["debugMap"] = this.map;
	}

	private readonly CATEGORY_EMOJI: Record<string, string> = {
		rutas: "🥾",
		acuario: "🐟",
		caballos: "🐴",
		museos: "🏛️",
		parques: "🌳",
		playas: "🏖️",
		faros: "🗼",
	};

	private createCategoryIcon(category: any): L.DivIcon {
		const mobile = window.innerWidth < 768;
		const size = mobile ? 44 : 36;
		const fontSize = mobile ? 22 : 18;
		const emoji = this.CATEGORY_EMOJI[category?.slug] ?? "📍";
		const color = category?.color || "#2A4D1E";

		const html = `<div style="
			width:${size}px;height:${size}px;
			background:${color};
			border-radius:50%;
			border:2px solid white;
			box-shadow:0 2px 6px rgba(0,0,0,0.3);
			display:flex;align-items:center;justify-content:center;
			cursor:pointer;
			font-size:${fontSize}px;line-height:1;
		">${emoji}</div>`;

		return L.divIcon({
			html,
			className: "",
			iconSize: [size, size],
			iconAnchor: [size / 2, size / 2],
		});
	}

	private renderMarkers(activities: Activity[]): void {
		this.markersLayer.clearLayers();
		activities.forEach(activity => {
			const [lng, lat] = activity.location.coordinates;
			const icon = this.createCategoryIcon(activity.category);
			const marker = L.marker([lat, lng], { icon });
			marker.bindTooltip(activity.name);
			marker.on("click", () => this.activitiesService.selectActivity(activity));
			marker.addTo(this.markersLayer);
		});
	}

	ngOnDestroy(): void {
		this.map.remove();
	}
}
