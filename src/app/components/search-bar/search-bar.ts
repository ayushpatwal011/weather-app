import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  searchType: 'city' | 'coords' = 'city';
  query: string = '';
  latQuery: number | null = null;
  lonQuery: number | null = null;

  constructor(private weatherService: WeatherService) { }

  onSearch() {
    if (!this.query.trim()) return;

    this.weatherService.searchCity(this.query).subscribe(locations => {
      if (locations && locations.length > 0) {
        // Select the best match (first one)
        this.weatherService.selectLocation(locations[0]);
      } else {
        alert('Location not found');
      }
    });
  }

  onSearchCoords() {
    if (this.latQuery === null || this.lonQuery === null) {
      alert('Please enter both latitude and longitude');
      return;
    }

    this.weatherService.reverseGeocode(this.latQuery, this.lonQuery).subscribe(loc => {
      if (loc) {
        this.weatherService.selectLocation(loc);
      } else {
        alert('Invalid coordinates or location not found');
      }
    });
  }
}
