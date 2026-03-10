# Modern Weather Map Application 🌍🌤️

Welcome to the **Modern Weather Map**! This project is a visually stunning, beginner-friendly Angular application that combines interactive maps with live weather data.

This project was built with **Angular 21**, **OpenLayers** (for maps), **Chart.js** (for weather graphs), and **Angular Material** (for UI components).

## ✨ Features

- **Interactive Fullscreen Map**: Built with OpenLayers. You can pan, zoom, click, and even use the "Locate Me" button to find your current area.
- **Smart Search**: Search for any city in the world, or enter raw Latitude and Longitude coordinates.
- **Live Weather Data**: Get the current temperature and a beautiful 7-day forecast graph built with Chart.js.
- **Saved Locations**: Bookmark your favorite places. The app remembers them and plots blue pins on the map for easy access.

---

## 🚀 Getting Started (For Beginners)

If you are new to Angular, don't worry! Follow these steps to get the project running on your own computer.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Open your terminal (or Command Prompt).
2. Navigate into the project folder (`weather`).
3. Run the following command to install all the required libraries:
   ```bash
   npm install
   ```

### Running the App
Once everything is installed, start the local development server:
```bash
npm start
```
Open your browser and navigate to `http://localhost:4200/`. You should see the map!

---

## 🧩 Understanding the Code (Project Structure)

The code is organized into a few simple pieces inside the `src/app/` folder. Here is how they work together:

### 1. `components/` (The Visual Parts)
Components are the building blocks of the screen.
- **`map`**: Controls the OpenLayers map (`map.ts`), handles map clicks, places the red/blue pins, and interacts with the browser's Geolocation API.
- **`search-bar`**: The input box where you type city names or coordinates. It asks the data service to find the location.
- **`weather-panel`**: Displays the current temperature and draws the 7-day forecast line chart using Chart.js.
- **`saved-locations`**: The list in the sidebar. It uses an Angular Material Table (`mat-table`) to show your bookmarked places.

### 2. `services/` (The Brains)
Services handle data behind the scenes.
- **`weather.service.ts`**: This is the most vital file for data! 
  - It talks to **Nominatim (OpenStreetMap)** to convert City Names into Map Coordinates (and vice versa).
  - It talks to the **Open-Meteo API** to fetch the live weather and 7-day forecast (without needing any API keys!).
  - It safely stores your bookmarked locations into the browser's memory (`localStorage`) so they don't disappear when you refresh the page.

### 3. `models/` (The Data Shapes)
- **`weather.ts`**: Defines what our data look like (e.g., what properties a `Location` or `WeatherData` object has). This makes TypeScript happy and helps prevent typing errors.

---

## 🛠️ Built With (Free APIs)

This project uses entirely free APIs that require no authentication keys:
- [Nominatim OpenStreetMap](https://nominatim.org/) - For Geocoding (Text to Coordinates) and Reverse Geocoding.
- [Open-Meteo](https://open-meteo.com/) - For incredibly fast, free weather forecasting data.

Enjoy exploring the weather code!
