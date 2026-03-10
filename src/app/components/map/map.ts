import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { WeatherService } from '../../services/weather.service';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  private map!: Map;
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer({ source: this.vectorSource });
  private subscription = new Subscription();

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.initMap();

    // Listen to selected location and saved locations to update pins
    this.subscription.add(
      combineLatest([
        this.weatherService.selectedLocation$,
        this.weatherService.savedLocations$
      ]).subscribe(([selected, saved]) => {
        this.updateMarkers(selected, saved);

        if (selected) {
          this.map.getView().animate({
            center: fromLonLat([selected.lon, selected.lat]),
            zoom: 12,
            duration: 1000
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initMap() {
    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      }),
      controls: [] // We'll use custom controls
    });

    this.map.on('click', (event) => {
      const coords = toLonLat(event.coordinate);
      const lon = coords[0];
      const lat = coords[1];

      this.weatherService.reverseGeocode(lat, lon).subscribe(loc => {
        if (loc) {
          this.weatherService.selectLocation(loc);
        }
      });
    });
  }

  private updateMarkers(selected: any, saved: any[]) {
    this.vectorSource.clear();

    const createMarker = (lat: number, lon: number, isSelected: boolean) => {
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      });

      // Different colored pins based on status
      const iconUrl = isSelected
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' // Green for selected
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'; // Blue for saved

      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: iconUrl,
          scale: isSelected ? 1 : 0.5
        })
      });

      marker.setStyle(iconStyle);
      return marker;
    };

    // Add saved location markers
    if (saved && saved.length > 0) {
      saved.forEach(loc => {
        this.vectorSource.addFeature(createMarker(loc.lat, loc.lon, false));
      });
    }

    // Add selected location marker
    if (selected) {
      // Avoid double pin if selected is also saved
      const isAlsoSaved = saved.some(s => s.lat === selected.lat && s.lon === selected.lon);
      if (!isAlsoSaved) {
        this.vectorSource.addFeature(createMarker(selected.lat, selected.lon, true));
      } else {
        // Find existing non-selected marker and make it selected style
        this.vectorSource.clear();
        saved.forEach(loc => {
          const isSelectedLoc = loc.lat === selected.lat && loc.lon === selected.lon;
          this.vectorSource.addFeature(createMarker(loc.lat, loc.lon, isSelectedLoc));
        });
      }
    }
  }

  // --- Map Controls ---
  panMap(direction: 'up' | 'down' | 'left' | 'right') {
    const view = this.map.getView();
    const currentCenter = view.getCenter();
    if (!currentCenter) return;

    const resolution = view.getResolution() || 1;
    // Tweak this value to determine pan distance across zoom levels
    const panRatio = 200 * resolution;

    let dx = 0;
    let dy = 0;

    switch (direction) {
      case 'up': dy = panRatio; break;
      case 'down': dy = -panRatio; break;
      case 'left': dx = -panRatio; break;
      case 'right': dx = panRatio; break;
    }

    view.animate({
      center: [currentCenter[0] + dx, currentCenter[1] + dy],
      duration: 250
    });
  }

  zoomMap(delta: number) {
    const view = this.map.getView();
    const currentZoom = view.getZoom() || 2;
    view.animate({
      zoom: currentZoom + delta,
      duration: 250
    });
  }

  geolocate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.weatherService.reverseGeocode(lat, lon).subscribe(loc => {
          if (loc) {
            loc.name = `Current Location (${loc.name})`;
            this.weatherService.selectLocation(loc);
          }
        });
      }, (error) => {
        alert('Could not determine your location. Please ensure location services are enabled.');
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }
}
