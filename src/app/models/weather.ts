export interface Location {
    lat: number;
    lon: number;
    name: string;
}

export interface SavedLocation extends Location {
    temp: number | 'N/A';
}

export interface CurrentWeather {
    temperature: number;
    time: string;
}

export interface DailyForecast {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
}

export interface WeatherData {
    current_weather?: CurrentWeather;
    daily?: DailyForecast;
}
