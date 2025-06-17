import React, { useState, useEffect } from 'react';

const Weather = () => {
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [displayCity, setDisplayCity] = useState('Paris');

  const API_KEY = "da047c990502641398390859c447b121";
  
  const cityNames = ['New York', 'Hyderabad', 'London', 'Sydney', 'Pennsylvania', 'Tokyo', 'Bengaluru'];

  // Cycling through city names display
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayCity(cityNames[index]);
      index = (index + 1) % cityNames.length;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherEmoji = (weatherId) => {
    switch (true) {
      case (weatherId >= 200 && weatherId < 300):
        return '⚡';
      case (weatherId >= 300 && weatherId < 400):
        return '🌦️';
      case (weatherId >= 500 && weatherId < 600):
        return '🌨️';
      case (weatherId >= 600 && weatherId < 700):
        return '❄️';
      case (weatherId >= 700 && weatherId < 800):
        return '🌁';
      case (weatherId === 800):
        return '☀️';
      case (weatherId >= 801 && weatherId < 810):
        return '🌤️';
      default:
        return "❔";
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeatherByCoords(lat, lon);
        },
        () => {
          setError("Cannot retrieve location");
        }
      );
    } else {
      setError("Geolocation not supported");
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error("Could not fetch weather data");
      }

      const weather = await weatherResponse.json();
      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      processForecastData(forecast);
    } catch (err) {
      setError("Could not fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError('');
    
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error("Could not fetch weather data");
      }

      const weather = await weatherResponse.json();
      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      processForecastData(forecast);
      
      // Add to search history if not already present
      if (!searchHistory.includes(city)) {
        setSearchHistory(prev => [...prev, city]);
      }
    } catch (err) {
      setError("Enter a Valid City Name...");
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (data) => {
    const forecastList = data.list;
    const dailyForecasts = [];
    const today = new Date().getDate();
    
    // Get unique days for forecast
    const uniqueDays = new Set();
    
    for (let i = 0; i < forecastList.length; i++) {
      const forecastDate = new Date(forecastList[i].dt * 1000);
      const forecastDay = forecastDate.getDate();
      
      // Skip today's data and get next 5 days
      if (forecastDay !== today && !uniqueDays.has(forecastDay)) {
        uniqueDays.add(forecastDay);
        dailyForecasts.push(forecastList[i]);
        
        if (dailyForecasts.length >= 5) break;
      }
    }
    
    setForecastData(dailyForecasts);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!cityInput.trim()) {
      setError("Enter a City Name...");
      return;
    }
    
    fetchWeatherByCity(cityInput.trim());
    setCityInput('');
    setShowHistory(false);
  };

  const handleHistoryClick = (city) => {
    setCityInput(city);
    fetchWeatherByCity(city);
    setShowHistory(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white text-center py-6 mb-8 rounded-2xl shadow-2xl border border-indigo-500/30">
          <h1 className="text-4xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            WEATHER REPORT
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-2 rounded-full"></div>
        </div>
        
        {/* Animated City Display */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-2xl inline-block shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <p className="text-2xl font-bold animate-pulse">{displayCity}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 mb-10">
          <button 
            onClick={getCurrentLocation}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            📍 Current Location
          </button>

          <div className="relative">
            <div className="flex gap-3">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="Enter City Name"
                className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-indigo-300 p-4 min-w-80 text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300"
              />
              <button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '⏳ Loading...' : '🔍 Get Weather'}
              </button>
            </div>
            
            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl mt-2 max-h-40 overflow-y-auto z-10 shadow-xl">
                {searchHistory.map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(city)}
                    className="p-4 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 cursor-pointer border-b border-indigo-100 last:border-b-0 text-gray-700 font-medium transition-all duration-200"
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Current Weather Display */}
        {weatherData && (
          <div className="max-w-5xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold">📍 {weatherData.name}</div>
                    <div className="text-sm opacity-90">({getCurrentDate()})</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold">🌡️ {(weatherData.main.temp - 273.15).toFixed(1)}°C</div>
                    <div className="text-sm opacity-90">Temperature</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-teal-500 to-green-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold">💧 {weatherData.main.humidity}%</div>
                    <div className="text-sm opacity-90">Humidity</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold">💨 {weatherData.wind.speed} m/s</div>
                    <div className="text-sm opacity-90">Wind Speed</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold capitalize">{weatherData.weather[0].description}</div>
                    <div className="text-sm opacity-90">Condition</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-4xl mb-1">
                      {getWeatherEmoji(weatherData.weather[0].id)}
                    </div>
                    <div className="text-sm opacity-90">Weather</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5 Day Forecast */}
        {forecastData.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white text-center py-4 mb-8 rounded-2xl shadow-xl border border-indigo-500/30">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                5 Day Forecast
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {forecastData.map((forecast, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg text-white rounded-3xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 rounded-xl mb-4 shadow-lg">
                      <p className="font-bold text-sm">
                        📅 {formatDate(forecast.dt_txt)}
                      </p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-2 border border-orange-300/30">
                        <p><span className="font-bold">🌡️ Temperature:</span> {(forecast.main.temp - 273.15).toFixed(1)}°C</p>
                      </div>
                      <div className="bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-lg p-2 border border-teal-300/30">
                        <p><span className="font-bold">💧 Humidity:</span> {forecast.main.humidity}%</p>
                      </div>
                      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg p-2 border border-violet-300/30">
                        <p><span className="font-bold">💨 Wind:</span> {forecast.wind.speed} m/s</p>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg p-2 border border-indigo-300/30">
                        <p className="capitalize font-bold">{forecast.weather[0].description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-gradient-to-br from-yellow-400 to-orange-500 inline-block p-3 rounded-2xl shadow-lg">
                      <div className="text-3xl">
                        {getWeatherEmoji(forecast.weather[0].id)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;