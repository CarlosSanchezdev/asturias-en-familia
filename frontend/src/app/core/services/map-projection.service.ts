import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MapProjectionService {
  private readonly A_LNG = 0.004863492265927784;
  private readonly B_LNG = -7.720763681427141;
  private readonly A_LAT = -0.002585444509287294;
  private readonly B_LAT = 43.82839845916549;
  private readonly SVG_W = 777.74173;
  private readonly SVG_H = 413.26299;

  latLngToCSS(lat: number, lng: number): { left: string; top: string } {
    const svgX = (lng - this.B_LNG) / this.A_LNG;
    const svgY = (lat - this.B_LAT) / this.A_LAT;
    return {
      left: (svgX / this.SVG_W * 100) + '%',
      top: (svgY / this.SVG_H * 100) + '%',
    };
  }

  latLngToSVG(lat: number, lng: number): { x: number; y: number } {
    return {
      x: (lng - this.B_LNG) / this.A_LNG,
      y: (lat - this.B_LAT) / this.A_LAT,
    };
  }

  // Corrección de coordenadas para el imageOverlay
  // Calculada empíricamente con Oviedo, Gijón y Avilés
  private readonly A_LAT_CORR = 1.027343;
  private readonly B_LAT_CORR = -1.237784;
  private readonly A_LNG_CORR = 1.063656;
  private readonly B_LNG_CORR = 0.360786;

  correctCoords(lat: number, lng: number): [number, number] {
    const corrLat = (lat - this.B_LAT_CORR) / this.A_LAT_CORR;
    const corrLng = (lng - this.B_LNG_CORR) / this.A_LNG_CORR;
    return [corrLat, corrLng];
  }
}
