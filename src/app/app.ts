import { Component, signal } from '@angular/core';
import { MapComponent } from './components/map/map';
import { SearchBar } from './components/search-bar/search-bar';
import { WeatherPanel } from './components/weather-panel/weather-panel';
import { SavedLocations } from './components/saved-locations/saved-locations';

@Component({
  selector: 'app-root',
  imports: [MapComponent, SearchBar, WeatherPanel, SavedLocations],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weather');
}
