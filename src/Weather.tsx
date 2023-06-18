import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import { availablecities } from './avcities';

const API_KEY = 'dc433395fc4c6add5e5c6e8d5dfbbd63';

interface WeatherData {
  name: string;
  weather: Weather[];
  main: Temperature;
}

interface Weather {
  icon: string;
}

interface Temperature {
  temp: number;
  temp_min: number;
  temp_max: number;
}

const Weather: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [defaultCity, setDefaultCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeatherDataByGeolocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (position: GeolocationPosition) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

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
        });
      } catch (error) {
        console.error('Error fetching geolocation:', error);
      }
    };

    fetchWeatherDataByGeolocation();
  }, []);

  const fetchWeatherData = async (cityName: string) => {
    try {
      const response: AxiosResponse<WeatherData> = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
      );
      setWeather(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleCityChange = (selectedOption: any) => {
    if (selectedOption) {
      setCity(selectedOption.value);
    } else {
      setCity('');
    }
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

  return (
    <div className="container">
      <div className="card mt-4">
        <div className="card-body">
          <h1 className="card-title">Weather App</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <Select
              value={{ value: city, label: city }}
              onChange={handleCityChange}
              options={availablecities.map((city) => ({ value: city, label: city }))}
              styles={selectStyles}
              placeholder="Select a city"
              isClearable
            />
            <button type="submit" className="btn btn-primary">Get Weather</button>
          </form>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            weather && (
              <div>
                <h2 className="card-subtitle mb-3">{weather.name}</h2>
                {weather.weather && weather.weather[0] && weather.weather[0].icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                    alt="Weather Icon"
                  />
                )}
                <p className="temperature">{convertTemperature(weather.main.temp)} {isCelsius ? '°C' : '°F'}</p>
                <p className="temperature-range">Min: {convertTemperature(weather.main.temp_min)} {isCelsius ? '°C' : '°F'}</p>
                <p className="temperature-range">Max: {convertTemperature(weather.main.temp_max)} {isCelsius ? '°C' : '°F'}</p>
                <div className="switch">
                  <button onClick={toggleTemperatureUnit} className="btn btn-secondary">
                    {isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
