const apiKey = 'a0306a3f3c9b2b9cdbc091e590be691f';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDetails = document.getElementById('current-weather-details');
const forecastDetails = document.getElementById('forecast-details');
const historyList = document.getElementById('history-list');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName) {
        getCoordinates(cityName)
            .then(coords => getWeatherData(coords.lat, coords.lon, cityName))
            .then(() => addToHistory(cityName));
    }
});

function getCoordinates(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    return fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('City not found!');
                throw new Error('City not found');
            }
            return { lat: data[0].lat, lon: data[0].lon };
        });
}

function getWeatherData(lat, lon, cityName) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data.list[0], cityName);
            displayForecast(data.list);
        });
}

function displayCurrentWeather(weather, cityName) {
    currentWeatherDetails.innerHTML = `
        <h3>${cityName} (${new Date(weather.dt_txt).toLocaleDateString()})</h3>
        <p>Temperature: ${weather.main.temp} °C</p>
        <p>Humidity: ${weather.main.humidity} %</p>
        <p>Wind Speed: ${weather.wind.speed} m/s</p>
        <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}">
    `;
}

function displayForecast(forecastList) {
    forecastDetails.innerHTML = '';
    for (let i = 0; i < forecastList.length; i += 8) {
        const weather = forecastList[i];
        forecastDetails.innerHTML += `
            <div>
                <h4>${new Date(weather.dt_txt).toLocaleDateString()}</h4>
                <p>Temp: ${weather.main.temp} °C</p>
                <p>Wind: ${weather.wind.speed} m/s</p>
                <p>Humidity: ${weather.main.humidity} %</p>
                <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}">
            </div>
        `;
    }
}

function addToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    if (!history.includes(cityName)) {
        history.push(cityName);
        localStorage.setItem('history', JSON.stringify(history));
        updateHistory();
    }
}

function updateHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    historyList.innerHTML = '';
    history.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            getCoordinates(city)
                .then(coords => getWeatherData(coords.lat, coords.lon, city));
        });
        historyList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', updateHistory);
