import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import "./App.css";

const API_KEY = "e5c8124dcf97a83cbf9b40657df2b783"; 

export default function App() {
  const [city, setCity] = useState("Delhi");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState("metric");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const fetchCurrentWeather = async (cityName) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
    );
    if (!res.ok) throw new Error("City not found");
    return await res.json();
  };

  const fetchForecastData = async (cityName) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
    );
    const data = await res.json();
    const now = new Date();
    return data.list.filter((item) => {
      const forecastTime = new Date(item.dt_txt);
      const hoursDiff = (forecastTime - now) / (1000 * 60 * 60);
      return hoursDiff >= 0 && hoursDiff <= 24;
    });
  };

  const fetchWeather = async (cityName) => {
    try {
      const weatherData = await fetchCurrentWeather(cityName);
      const forecastData = await fetchForecastData(cityName);
      setWeather(weatherData);
      setForecast(forecastData);
      setError("");
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, [unit, city]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleCityChange = debounce((e) => setCity(e.target.value), 500);

  const renderForecastItem = (item, index) => (
    <div key={index} className="forecast-item">
      <p>{new Date(item.dt_txt).getHours()}:00</p>
      <img
        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
        alt="weather icon"
      />
      <p>{Math.round(item.main.temp)}°</p>
    </div>
  );

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="glass-card">
    
        <div className="header">
          <div className="logo">
            <span role="img" aria-label="cloud">☁️</span> Weatherly
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              defaultValue={city}
              onChange={handleCityChange}
              placeholder="Search city..."
            />
            <button type="submit" className="search-btn">🔍</button>
            <button type="button" onClick={toggleUnit} className="unit-toggle">
              {unit === "metric" ? "°C" : "°F"}
            </button>
          </form>
        </div>

      
        {error && <p className="error">{error}</p>}

     
        {weather && (
  <div className="weather-info">
    <h2>📍 {weather.name}, {weather.sys.country}</h2>
    <p className="date">{new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    })}</p>
    
    <div className="weather-main">
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
        alt="weather icon"
        className="weather-icon"
      />
      <h3>{Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}</h3>
    </div>

    <p className="desc">{weather.weather[0].main} ({weather.weather[0].description})</p>
    <p>Feels like: {Math.round(weather.main.feels_like)}°</p>

    <div className="weather-stats">
      <div>💧 Humidity: {weather.main.humidity}%</div>
      <div>🌬️ Wind: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</div>
      <div>☀️ UV Index: 5 (static for now)</div>
    </div>
  </div>
)}


       
        {forecast.length > 0 && (
          <div className="forecast">
            <h2>Next 24 Hours</h2>
            <div className="forecast-scroll">
              {forecast.map(renderForecastItem)}
            </div>
          </div>
        )}

      
        <div className="footer">
          <p>Powered by OpenWeatherMap</p>
          <button onClick={toggleDarkMode}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
