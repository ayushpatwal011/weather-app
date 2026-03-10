import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WeatherService } from '../../services/weather.service';
import { Location, WeatherData } from '../../models/weather';
import { Observable, Subscription } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-weather-panel',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './weather-panel.html',
  styleUrl: './weather-panel.scss',
})
export class WeatherPanel implements OnInit, OnDestroy {
  @ViewChild('forecastChart', { static: false }) forecastChart!: ElementRef;

  location$: Observable<Location | null>;
  weather$: Observable<WeatherData | null>;

  private chart: Chart | null = null;
  private weatherSub!: Subscription;
  private currentLoc: Location | null = null;

  constructor(private weatherService: WeatherService) {
    this.location$ = this.weatherService.selectedLocation$;
    this.weather$ = this.weatherService.selectedWeather$;
  }

  ngOnInit() {
    this.weatherSub = this.weather$.subscribe(weather => {
      if (weather && weather.daily) {
        // give view a tick to render canvas if it just appeared
        setTimeout(() => this.renderChart(weather), 0);
      }
    });
    this.weatherService.selectedLocation$.subscribe(loc => this.currentLoc = loc);
  }

  ngOnDestroy() {
    this.weatherSub?.unsubscribe();
    this.chart?.destroy();
  }

  saveLocation() {
    if (!this.currentLoc) return;

    let temp: number | 'N/A' = 'N/A';
    // Get current value of weather from service synchronously if possible or keep default
    // We can subscribe once but let's just use the current weather if available
    this.weatherService.selectedWeather$.subscribe(w => {
      if (w?.current_weather) {
        temp = w.current_weather.temperature;
      }
    }).unsubscribe();

    this.weatherService.saveLocation({
      ...this.currentLoc,
      temp
    });
  }

  private renderChart(weather: WeatherData) {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.forecastChart || !weather.daily) return;

    const ctx = this.forecastChart.nativeElement;
    const labels = weather.daily.time.map(t => new Date(t).toLocaleDateString('en-US', { weekday: 'short' }));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Max Temp (°C)',
            data: weather.daily.temperature_2m_max,
            borderColor: '#ff7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Min Temp (°C)',
            data: weather.daily.temperature_2m_min,
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide legend to save space
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
  }
}
