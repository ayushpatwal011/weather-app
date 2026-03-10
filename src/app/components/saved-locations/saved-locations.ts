import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WeatherService } from '../../services/weather.service';
import { Observable } from 'rxjs';
import { SavedLocation } from '../../models/weather';

@Component({
  selector: 'app-saved-locations',
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './saved-locations.html',
  styleUrl: './saved-locations.scss',
})
export class SavedLocations {
  savedLocations$: Observable<SavedLocation[]>;
  displayedColumns: string[] = ['name', 'temp', 'actions'];

  constructor(private weatherService: WeatherService) {
    this.savedLocations$ = this.weatherService.savedLocations$;
  }

  select(location: SavedLocation) {
    this.weatherService.selectLocation(location);
  }

  remove(location: SavedLocation) {
    this.weatherService.removeLocation(location);
  }
}
