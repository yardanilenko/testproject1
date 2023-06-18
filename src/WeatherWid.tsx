import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import { availablecities } from './avcities';
import './WeatherWid.css';

const API_KEY = 'dc433395fc4c6add5e5c6e8d5dfbbd63';

interface WeatherData {
  name: string;
  weather: Weather[];
  main: Temperature;
}

interface Weather {
  icon: string;
  description?: string;
}

interface Temperature {
  temp: number;
  temp_min: number;
  temp_max: number;
}

const WeatherWid: React.FC = () => {
  const [city, setCity] = useState('');
  const [defaultCity, setDefaultCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const fetchWeatherDataByGeolocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        const options = {
          method: 'GET',
          url: 'https://geocodeapi.p.rapidapi.com/GetNearestCities',
          params: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            range: '0'
          },
          headers: {
            'X-RapidAPI-Key': 'ec93e45d2emsh0f43e6ca32aef13p106fdcjsn9d66bbda34c4',
            'X-RapidAPI-Host': 'geocodeapi.p.rapidapi.com'
          }
        };

        const response = await axios.request(options);
        const nearestCity = response.data[0].City;

        setDefaultCity(nearestCity);
        setCity(nearestCity);
        fetchWeatherData(nearestCity);
      } catch (error) {
        console.error('Error fetching geolocation:', error);
      }
    };

    fetchWeatherDataByGeolocation();
  }, []);

  const fetchWeatherData = async (cityName: string) => {
    try {
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
      );
      setWeather(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleCityChange = (selectedOption: any) => {
    setCity(selectedOption?.value || '');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (city.trim() !== '') {
      fetchWeatherData(city);
    } else {
      fetchWeatherData(defaultCity);
    }
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius((prevIsCelsius) => !prevIsCelsius);
  };

  const convertTemperature = (temperature: number) => {
    return isCelsius ? Math.round(temperature - 273.15) : Math.round((temperature - 273.15) * 1.8 + 32);
  };

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      borderRadius: 0,
      borderColor: '#ced4da',
      boxShadow: 'none',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : 'white',
      color: state.isSelected ? 'white' : 'black',
    }),
  };

  const toggleTheme = () => {
    setIsDarkTheme((prevIsDarkTheme) => !prevIsDarkTheme);
  };

  return (
    <div className={isDarkTheme ? 'dark-theme' : 'light-theme'}>
      <div className="container">
        <button onClick={toggleTheme} className="theme-toggle-button">
          {isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </button>
        <div className="card mt-4">
          <h1 className="card-title">Weather App</h1>
          <form onSubmit={handleSubmit} className="weather-form">
            <div className="select-wrapper">
              <Select
                value={{ value: city, label: city }}
                onChange={handleCityChange}
                options={availablecities.map((city) => ({ value: city, label: city }))}
                styles={selectStyles}
                placeholder="Select a city"
                isClearable
              />
            </div>
            <button type="submit" className="btn btn-primary submit-button">
              Get Weather
            </button>
          </form>
          <div className="card-body">
            {isLoading ? (
              <p>Loading...</p>
            ) : weather ? (
              <div>
                <h2 className="mt-3 mb-0">{weather.name}</h2>
                {weather.weather && weather.weather[0]?.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                    alt="Weather Icon"
                  />
                )}
                <p className="mb-0 med-font">{weather.weather[0]?.description}</p>
                <div className="temperature">
                  <h1 className="large-font">{convertTemperature(weather.main.temp)} {isCelsius ? '°C' : '°F'}</h1>
                  <p>Min: {convertTemperature(weather.main.temp_min)} {isCelsius ? '°C' : '°F'}</p>
                  <p>Max: {convertTemperature(weather.main.temp_max)} {isCelsius ? '°C' : '°F'}</p>
                </div>
                <div className="switch">
                  <button onClick={toggleTemperatureUnit} className="btn btn-secondary">
                    {isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
                  </button>
                </div>
              </div>
            ) : (
              <p>No weather data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWid;
