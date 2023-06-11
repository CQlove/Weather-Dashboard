const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const currentWeatherContainer = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast');
const searchHistoryContainer = document.getElementById('search-history');
const titleForecast = document.getElementById('title-forecast');

window.onload = function () {
  // get data from localstorage
  const searchHistory = getData();

  // put data into history list
  for (const city of searchHistory) {
    addToSearchHistory(city);
  }
};

searchForm.addEventListener('submit', function(event) {
  event.preventDefault(); 
  // get city name without space around the city name and uppercase the first letter of each word
  const cityName = cityInput.value.trim().split(" "); 
  for (var i = 0; i < cityName.length; i++){
    cityName[i] = cityName[i].charAt(0).toUpperCase() + cityName[i].slice(1);
  }
  const city = cityName.join(" ");
  // check if it's empty input
  if (city !== '') {
    getWeatherData(city);
    cityInput.value = '';
  }
});

// get data
function getWeatherData(city) {
  // request from openweather and use imperial
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=ce69c4a77180f34eeb3c1184cdae3189&units=imperial`;
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ce69c4a77180f34eeb3c1184cdae3189&units=imperial`;
  
  fetch(forecastUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      displayForecast(data);
      addToSearchHistory(city);
    })
    .catch(function(error) {
      console.log('Error', error);
    });
  fetch(currentUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data1) {
      displayCurrentWeather(data1);
    })
    .catch(function(error) {
      console.log('Error', error);
    });
}

// show current weather info
function displayCurrentWeather(data1) {
  // get infor that I need from data
  const cityName = data1.name;
  var date = dayjs.unix(data1.dt).format('YYYY-MM-DD'); 
  const temperature = data1.main.temp;
  const humidity = data1.main.humidity;
  const windSpeed = data1.wind.speed;
  const icon = data1.weather[0].icon;

  // creat string that has everything I need
  const weatherInfo = `
    <h2 class="col">Current Weather in ${cityName} (${date})</h2>
    <div id="today" class="col rounded">
      <img src="http://openweathermap.org/img/wn/${icon}.png">
      <p> Temperature: ${temperature} °F</p>
      <p> Humidity: ${humidity} %</p>
      <p> Wind Speed: ${windSpeed} MPH</p>
    </div>
  `;

  // add into html
  currentWeatherContainer.innerHTML = weatherInfo;
}

let isNewH3Added = false;
function displayForecast(data) {
  titleForecast.setAttribute("class","col text-center d-block");
//  creat empty string
  let weatherInfo = '';

  // loop data list, every 8th data goes to the same time in the next day 
  for (let i = 0; i < data.list.length; i += 8) {
    const date = data.list[i].dt_txt.split(" ")[0];
    const icon = data.list[i].weather[0].icon;
    const temperature = data.list[i].main.temp;
    const humidity = data.list[i].main.humidity;
    const windSpeed = data.list[i].wind.speed;

    //creat everyday info
    const forecastHtml = `
      <div id="next-day" class="col text-center rounded">
        <p>${date}</p>
        <img src="http://openweathermap.org/img/wn/${icon}.png">
        <p>Temperature: ${temperature} °F</p>
        <p>Humidity: ${humidity} %</p>
        <p>Wind Speed: ${windSpeed} MPH</p>
      </div>
    `;

    // add everyday information into weatherInfo
    weatherInfo += forecastHtml;
  }

  // add all days into weatherInfo
  forecastContainer.innerHTML = weatherInfo;

}


function addToSearchHistory(city) {
  // to check if the city already in the list
  const existingCities = searchHistoryContainer.getElementsByTagName("a");
  for (let i = 0; i < existingCities.length; i++) {
    if (existingCities[i].textContent === city) {
      // delete previous city
      existingCities[i].parentNode.remove();
      break;
    }
  }

  // creat <a> tag for this city
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = city;

  // click the history city to fetch data again
  link.addEventListener("click", function () {
    getWeatherData(city);
  });

  // creat li tag and put a tag inside
  const listItem = document.createElement("li");
  listItem.appendChild(link);
  searchHistoryContainer.appendChild(listItem);

  // update locastorage
  const searchHistory = getData();
  searchHistory.push(city);
  saveData(searchHistory);
}

// get search history from localstorage
function getData() {
  const searchHistory = localStorage.getItem("searchHistory");
  // ? check if there has null or undefined
  return searchHistory ? JSON.parse(searchHistory) : [];
}

// save to localstorage
function saveData(searchHistory) {
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

const clearHistoryBtn = document.getElementById("clear-history-btn");
clearHistoryBtn.addEventListener("click", function () {
  const cities = searchHistoryContainer.getElementsByTagName("li");
  // Remove each city list item
  while (cities.length > 0) {
    cities[0].remove();
  }
});