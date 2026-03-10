import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, map } from 'rxjs';
import { Location, SavedLocation, WeatherData } from '../models/weather';

@Injectable({
    providedIn: 'root'
})
export class WeatherService {
    private savedLocationsSubject = new BehaviorSubject<SavedLocation[]>([]);
    public savedLocations$ = this.savedLocationsSubject.asObservable();

    private selectedLocationSubject = new BehaviorSubject<Location | null>(null);
    public selectedLocation$ = this.selectedLocationSubject.asObservable();

    private selectedWeatherSubject = new BehaviorSubject<WeatherData | null>(null);
    public selectedWeather$ = this.selectedWeatherSubject.asObservable();

    selectLocation(location: Location | null) {
        this.selectedLocationSubject.next(location);
        if (location) {
            this.getWeather(location.lat, location.lon).subscribe(weather => {
                this.selectedWeatherSubject.next(weather);
            });
        } else {
            this.selectedWeatherSubject.next(null);
        }
    }
    constructor(private http: HttpClient) {
        const saved = localStorage.getItem('weather_saved_locations');
        if (saved) {
            try {
                this.savedLocationsSubject.next(JSON.parse(saved));
            } catch (e) { }
        }
    }

    // OpenStreetMap Nominatim for Geocoding (City -> Lat, Lon)
    searchCity(query: string): Observable<Location[]> {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        return this.http.get<any[]>(url).pipe(
            map(res => res.map(item => ({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                name: item.display_name
            }))),
            catchError(() => of([]))
        );
    }

    // OpenStreetMap Nominatim for Reverse Geocoding (Lat, Lon -> City)
    reverseGeocode(lat: number, lon: number): Observable<Location | null> {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        return this.http.get<any>(url).pipe(
            map(res => ({
                lat,
                lon,
                name: res.display_name || 'Unknown Location'
            })),
            catchError(() => of(null))
        );
    }

    // Open-Meteo for Weather data
    getWeather(lat: number, lon: number): Observable<WeatherData | null> {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        return this.http.get<WeatherData>(url).pipe(
            catchError(() => of(null))
        );
    }

    saveLocation(location: SavedLocation) {
        const current = this.savedLocationsSubject.value;
        // prevent duplicates
        if (!current.find(l => l.lat === location.lat && l.lon === location.lon)) {
            const updated = [...current, location];
            this.savedLocationsSubject.next(updated);
            localStorage.setItem('weather_saved_locations', JSON.stringify(updated));
        }
    }

    removeLocation(location: SavedLocation) {
        const current = this.savedLocationsSubject.value;
        const updated = current.filter(l => !(l.lat === location.lat && l.lon === location.lon));
        this.savedLocationsSubject.next(updated);
        localStorage.setItem('weather_saved_locations', JSON.stringify(updated));
    }
}
