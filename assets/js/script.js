const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const weatherDataDiv = document.querySelector(".weather-data");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "d71fd30353f26675eaa4b5a0551932ef"; // API key for OpenWeatherMap API

// Fetch weather data from OpenWeatherMap API
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather Icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const currentDate = new Date().getDate();
        const sixDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            return forecastDate === currentDate || forecastDate > currentDate;
        }).slice(0, 6); // Get today's forecast and the next five days forecast

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        sixDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    })
    .catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

// Function to update search history
const updateSearchHistory = (cityName) => {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    displaySearchHistory();
}

// Function to display search history
const displaySearchHistory = () => {
    const historyList = document.querySelector(".history-list");
    historyList.innerHTML = '';
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.style.width = '100%';
        button.style.margin = '5px 0';
        button.style.padding = '10px 0';
        button.style.cursor = 'pointer';
        button.style.outline = 'none';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.fontSize = '1rem';
        button.style.color = '#323D4F';
        button.style.background = '#AEAEAE';
        button.style.transition = '0.2s ease';
        button.addEventListener('click', () => {
            getCityCoordinates(city);
        });
        historyList.appendChild(button);
    });
}

// Locate the searched city on the map
const getCityCoordinates = (cityName = null) => {
    cityName = cityName || cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (name, latitude, and longitude) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
        weatherDataDiv.style.display = "block";
        updateSearchHistory(name);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());