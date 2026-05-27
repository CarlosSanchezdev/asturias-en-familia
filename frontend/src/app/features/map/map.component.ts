import { Component, OnDestroy, AfterViewInit, inject, effect } from "@angular/core";
import { ActivitiesService, Activity } from "../../core/services/activities.service";
import { MapProjectionService } from "../../core/services/map-projection.service";
import * as L from "leaflet";

@Component({
	selector: "aef-map",
	standalone: true,
	templateUrl: "./map.component.html",
	styleUrl: "./map.component.scss",
})
export class MapComponent implements AfterViewInit, OnDestroy {
	readonly activitiesService = inject(ActivitiesService);
	private readonly projection = inject(MapProjectionService);
	private map!: L.Map;
	private markersLayer = L.layerGroup();

	constructor() {
		// effect() requiere contexto de inyección → va en el constructor
		effect(() => {
			const activities = this.activitiesService.activities();
			if (this.map) {
				this.renderMarkers(activities);
			}
		});
	}

	ngAfterViewInit(): void {
		// El elemento #map debe existir en el DOM antes de inicializar Leaflet
		this.initMap();
		this.activitiesService.loadActivities();
	}

	private initMap(): void {
		const asturiasBounds: L.LatLngBoundsExpression = [
			[42.9144, -7.5979],
			[43.9364, -4.0417],
		];

		this.map = L.map("map", {
			center: [43.36, -5.85],
			zoom: 8,
			minZoom: 7,
			maxZoom: 12,
			maxBounds: asturiasBounds,
			maxBoundsViscosity: 1.0,
			zoomControl: true,
			wheelPxPerZoomLevel: 120,
			zoomSnap: 0.5,
			zoomDelta: 0.5,
		});

		// this.map.on('click', (e: L.LeafletMouseEvent) => {
		// 	console.log('CLICK lat:', e.latlng.lat.toFixed(4), 'lng:', e.latlng.lng.toFixed(4));
		// });

		L.imageOverlay("assets/maps/asturias_municipal.svg", asturiasBounds).addTo(this.map);

		// Marcadores de calibración — ELIMINAR DESPUÉS DE CALIBRAR
		const ciudadesRef = [
			{ name: "Oviedo", lat: 43.3614, lng: -5.8593, color: "red" },
			{ name: "Gijón", lat: 43.5454, lng: -5.6618, color: "blue" },
			{ name: "Avilés", lat: 43.5547, lng: -5.9249, color: "green" },
		];

		ciudadesRef.forEach(ciudad => {
			L.marker([ciudad.lat, ciudad.lng])
				.bindTooltip(ciudad.name, { permanent: true, direction: "top" })
				.addTo(this.map);
		});

		document.getElementById("map")!.style.background = "#FDF8F0";

		this.markersLayer.addTo(this.map);
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
		const emoji = this.CATEGORY_EMOJI[category?.slug] ?? "📍";
		const color = category?.color || "#2A4D1E";

		const html = `<div style="
			width:36px;height:36px;
			background:${color};
			border-radius:50%;
			border:2px solid white;
			box-shadow:0 2px 6px rgba(0,0,0,0.3);
			display:flex;align-items:center;justify-content:center;
			cursor:pointer;
			font-size:18px;line-height:1;
		">${emoji}</div>`;

		return L.divIcon({
			html,
			className: "",
			iconSize: [36, 36],
			iconAnchor: [18, 18],
		});
	}

	private renderMarkers(activities: Activity[]): void {
		this.markersLayer.clearLayers();
		activities.forEach(activity => {
			console.log("category:", activity.category);
			const [lng, lat] = activity.location.coordinates;
			const [corrLat, corrLng] = this.projection.correctCoords(lat, lng);

			const icon = this.createCategoryIcon(activity.category);
			const marker = L.marker([corrLat, corrLng], { icon });
			marker.bindTooltip(activity.name);
			marker.on("click", () => this.activitiesService.selectActivity(activity));
			marker.addTo(this.markersLayer);
		});
	}

	ngOnDestroy(): void {
		this.map.remove();
	}
}

