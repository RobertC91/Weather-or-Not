let APIKey = "b670bcc37dadd49d84c807bac25765c8";

let cityInput = $("#city-input");
let searchBtn = $("#search-button");
let clearEl = $("#clear-button");
let searchedCities = $("#searched");

let currentCity;

function getWeather(data) {
  let oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${data.lat}&lon=${data.lon}&units=imperial&appid=` + APIKey;

  fetch(oneCallUrl)
    .then(function (response) {
      data = response.json();
      return data;
    })
    .then(function (data) {
      console.log(data);

      // ===================Current Weather================= //

      let currentConditionsEl = $("#currentConditions");
      currentConditionsEl.addClass("border border-dark");

      let cityNameEl = $("<h2>");
      cityNameEl.text(currentCity);
      currentConditionsEl.append(cityNameEl);

      let currentCityDate = data.current.dt;
      currentCityDate = moment.unix(currentCityDate).format(" (MM/DD/YYYY)");
      let currentDateEl = $("<span>");
      currentDateEl.text(currentCityDate);
      cityNameEl.append(currentDateEl);

      let currentIcon = data.current.weather[0].icon;
      let currentWeatherIcon = $("<img>");
      currentWeatherIcon.attr("src","https://openweathermap.org/img/wn/" + currentIcon + "@2x.png"
      );
      cityNameEl.append(currentWeatherIcon);

      let currentTemp = data.current.temp;
      let currentTempEl = $("<p>");
      currentTempEl.text("Temp: " + currentTemp + "°F");
      currentConditionsEl.append(currentTempEl);

      let currentWind = data.current.wind_speed;
      let currentWindEl = $("<p>");
      currentWindEl.text("Wind: " + currentWind + " MPH");
      currentConditionsEl.append(currentWindEl);

      let currentHumidity = data.current.humidity;
      let currentHumidityEl = $("<p>");
      currentHumidityEl.text("Humidity: " + currentHumidity + " %");
      currentConditionsEl.append(currentHumidityEl);

      // ==================5-day Forecast================== //

      let fiveDayHeader = $("#fiveDayForecastHeader");
      let fivedayHeaderEl = $("<h2>");
      fivedayHeaderEl.text("5-Day Forecast: ");
      fiveDayHeader.append(fivedayHeaderEl);

      let fiveDayForecastEl = $("#fiveDayForecast");

      for (let i = 1; i <= 5; i++) {
        let date;
        let temp;
        let icon;
        let wind;
        let humidity;

        date = data.daily[i].dt;
        date = moment.unix(date).format("MM/DD/YYYY");

        temp = data.daily[i].temp.day;
        icon = data.daily[i].weather[0].icon;
        wind = data.daily[i].wind_speed;
        humidity = data.daily[i].humidity;

        let card = document.createElement("div");
        card.classList.add("card", "col-2", "m-1", "bg-dark", "text-white");

        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `<h6>${date}</h6>
                              <img src= "https://openweathermap.org/img/wn/${icon}.png"> </><br>
                              ${temp} °F<br>
                              ${wind} MPH <br>
                              ${humidity}%`;

        card.appendChild(cardBody);
        fiveDayForecastEl.append(card);
      }
    });
  return;
}
// ====================History=========================

function displaySearchHistory() {
  let storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  let pastSearchesEl = document.getElementById("searched");

  pastSearchesEl.innerHTML = "";

  for (i = 0; i < storedCities.length; i++) {
    var pastCityBtn = document.createElement("button");
    pastCityBtn.classList.add("btn", "btn-dark", "my-2", "past-city");
    pastCityBtn.setAttribute("style", "width: 100%");
    pastCityBtn.textContent = `${storedCities[i].city}`;
    pastSearchesEl.appendChild(pastCityBtn);
  }
  return;
}
// =================Coordinates==========================

function getCoordinates() {
  let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=` + APIKey;

  let storedCities = JSON.parse(localStorage.getItem("cities")) || [];

  fetch(queryURL)
    .then(function (response) {
      data = response.json();
      return data;
    })
    .then(function (data) {
      console.log(data);

      let cityInfo = {
        city: currentCity,
        lat: data.coord.lat,
        lon: data.coord.lon,
      };

      storedCities.push(cityInfo);
      localStorage.setItem("cities", JSON.stringify(storedCities));

      displaySearchHistory();

      return cityInfo;
    })
    .then(function (data) {
      getWeather(data);
    });
  return;
}
// ==============Clear History===============

function handleClearHistory(event) {
  event.preventDefault();
  var pastSearchesEl = document.getElementById("searched");

  localStorage.removeItem("cities");
  pastSearchesEl.innerHTML = "";

  return;
}

function clearCurrentCityWeather() {
  var currentConditionsEl = document.getElementById("currentConditions");
  currentConditionsEl.innerHTML = "";

  var fiveDayForecastHeaderEl = document.getElementById(
    "fiveDayForecastHeader"
  );
  fiveDayForecastHeaderEl.innerHTML = "";

  var fiveDayForecastEl = document.getElementById("fiveDayForecast");
  fiveDayForecastEl.innerHTML = "";

  return;
}

function handleCityFormSubmit(event) {
  event.preventDefault();
  currentCity = cityInput.val().trim();

  clearCurrentCityWeather();
  getCoordinates();

  return;
}
// =====================Search Previous Cities====================

function getPastCity(event) {
  var element = event.target;

  if (element.matches(".past-city")) {
    currentCity = element.textContent;

    clearCurrentCityWeather();

    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=` + APIKey;

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(function (data) {
        var cityInfo = {
          city: currentCity,
          lon: data.coord.lon,
          lat: data.coord.lat,
        };
        return cityInfo;
      })
      .then(function (data) {
        getWeather(data);
      });
  }
  return;
}

displaySearchHistory();

searchBtn.on("click", handleCityFormSubmit);

clearEl.on("click", handleClearHistory);

searchedCities.on("click", getPastCity);
