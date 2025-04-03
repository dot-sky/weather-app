import { format, parseISO } from "date-fns";
import { EventsController } from "./eventsController.js";
import "./style.css";

class WeatherApp {
  static #units = {
    us: {
      templong: "°F",
      temp: "°",
      feelslike: "°",
      windspeed: "mph",
      humidity: "%",
      precipprob: "%",
    },
    metric: {
      templong: "°C",
      temp: "°",
      feelslike: "°",
      windspeed: "kph",
      humidity: "%",
      precipprob: "%",
    },
  };

  static #elementsLabel = {
    temp: "Temperature",
    feelslike: "Real feel",
    windspeed: "Wind",
    humidity: "Humidity",
    precipprob: "Precipitation",
  };

  static #icons = WeatherApp.#importAssets(
    require.context("./assets/forecast", false, /\.(svg)$/)
  );

  static #uiIcons = WeatherApp.#importAssets(
    require.context("./assets/icons", false, /\.(svg)$/)
  );

  constructor(doc) {
    this.doc = doc;
    this.forecast = "";
    this.selectedDay = 0;
    this.unitGroup = "us";
    this.location = "london";
    this.eventsController = new EventsController(this.doc);

    this.cacheDOM();
    this.bindEvents();
    this.eventsController.fetchForecast(
      this.location,
      this.unitGroup,
      this.updateForecast.bind(this),
      this.updateWindow.bind(this)
    );
  }

  cacheDOM() {
    this.searchForm = this.doc.querySelector(".search-form");
    this.searchBox = this.doc.querySelector("#search");
    this.searchBtn = this.doc.querySelector(".search-btn");
    this.celsiusBtn = this.doc.querySelector("#celsius");
    this.fahrenheitBtn = this.doc.querySelector("#fahrenheit");

    this.date = this.doc.querySelector(".forecast-date");
    this.locationDesc = this.doc.querySelector(".forecast-location");
    this.forecastMainIcon = this.doc.querySelector("#forecast-icon-day");
    this.forecastTemp = this.doc.querySelector("#forecast-temp");
    this.forecastDesc = this.doc.querySelector(".forecast-desc");
    this.todayMaxTemp = this.doc.querySelector("#max-temp");
    this.todayMinTemp = this.doc.querySelector("#min-temp");

    this.forecastDetails = this.doc.querySelector(".forecast-details");
    this.weekForecast = this.doc.querySelector(".week-forecast");
    this.hoursForecast = this.doc.querySelector(".hours-forecast");
  }

  // Events
  bindEvents() {
    this.searchBtn.addEventListener("click", () =>
      this.eventsController.validateSearchInput(this.searchBox)
    );

    this.celsiusBtn.addEventListener("click", () =>
      this.eventsController.clickUnitGroupBtn(
        "metric",
        this.updateUnitGroup.bind(this)
      )
    );

    this.fahrenheitBtn.addEventListener("click", () =>
      this.eventsController.clickUnitGroupBtn(
        "us",
        this.updateUnitGroup.bind(this)
      )
    );

    this.searchForm.addEventListener("submit", (event) =>
      this.eventsController.submitSearch(
        event,
        this.unitGroup,
        this.updateForecast.bind(this),
        this.updateWindow.bind(this)
      )
    );
  }

  updateForecast(location, data) {
    this.location = location;
    this.forecast = data;
  }

  updateLocation(location) {
    this.location = location;
  }

  updateSelectedDay(index) {
    this.selectDay(index);
    this.updateWindow();
  }

  selectDay(index) {
    if (index >= 0 && index < this.forecast.days.length)
      this.selectedDay = index;
  }

  updateUnitGroup(unitGroup) {
    if (this.unitGroup !== unitGroup) {
      this.unitGroup = unitGroup;
      this.eventsController.fetchForecast(
        this.location,
        this.unitGroup,
        this.updateForecast.bind(this),
        this.updateWindow.bind(this)
      );
    }
  }

  // Events end
  updateWindow() {
    this.renderForecast();
    this.renderForecastDetails();
    this.renderWeekForecast();
    this.renderHoursForecast();
  }

  renderForecast() {
    const today = this.forecast.days[this.selectedDay];
    this.date.textContent = format(parseISO(today.datetime), "EEEE, d MMMM y ");
    this.forecastMainIcon.setAttribute("src", WeatherApp.#icons[today.icon]);

    this.locationDesc.textContent = this.forecast.resolvedAddress;
    this.forecastTemp.textContent = this.formatValue("templong", today.temp);
    this.forecastDesc.textContent = today.description;
    this.todayMaxTemp.textContent = this.formatValue("temp", today.tempmax);
    this.todayMinTemp.textContent = this.formatValue("temp", today.tempmin);
  }

  renderForecastDetails() {
    this.forecastDetails.textContent = "";

    const realFeel = this.createForecastElement(
      this.forecast.days[this.selectedDay],
      "feelslike"
    );
    const precipProb = this.createForecastElement(
      this.forecast.days[this.selectedDay],
      "precipprob"
    );
    const humidity = this.createForecastElement(
      this.forecast.days[this.selectedDay],
      "humidity"
    );
    const wind = this.createForecastElement(
      this.forecast.days[this.selectedDay],
      "windspeed"
    );

    this.forecastDetails.appendChild(realFeel);
    this.forecastDetails.appendChild(precipProb);
    this.forecastDetails.appendChild(humidity);
    this.forecastDetails.appendChild(wind);
  }

  createForecastElement(forecast, element, short) {
    const wrapper = this.doc.createElement("div");
    const icon = this.doc.createElement("img");
    const detailDesc = this.doc.createElement("span");
    const detailValue = this.doc.createElement("span");

    detailDesc.textContent = WeatherApp.#elementsLabel[element] + ":";
    detailValue.textContent = this.formatValue(element, forecast[element]);
    icon.setAttribute("src", WeatherApp.#uiIcons[element]);

    wrapper.classList.add("detail-wrapper");
    icon.classList.add("icon-sm");
    detailDesc.classList.add("detail-desc");
    detailValue.classList.add("detail-value");

    wrapper.appendChild(icon);
    if (!short) {
      wrapper.appendChild(detailDesc);
    }
    wrapper.appendChild(detailValue);

    return wrapper;
  }

  renderWeekForecast() {
    this.weekForecast.textContent = "";

    const days = this.forecast.days;
    for (let i = 0; i < 7; i++) {
      const dayForecast = this.createDayForecastElem(days[i], i === 0);
      dayForecast.addEventListener("click", () => this.updateSelectedDay(i));
      this.weekForecast.appendChild(dayForecast);
    }
  }

  createDayForecastElem(day, today) {
    const dayForecastElem = this.doc.createElement("div");
    const dayTitle = this.doc.createElement("div");
    const date = this.doc.createElement("div");
    const icon = this.doc.createElement("img");
    const temp = this.doc.createElement("div");

    dayTitle.textContent = format(parseISO(day.datetime), "eee");
    if (today) {
      dayTitle.textContent = "Today";
    }

    date.textContent = format(parseISO(day.datetime), "MMM d");
    temp.textContent = this.formatValue("temp", day.temp);
    icon.setAttribute("src", WeatherApp.#icons[day.icon]);

    dayForecastElem.classList.add("day-forecast");
    dayTitle.classList.add("h5");
    date.classList.add("day-date");
    date.classList.add("small");
    icon.classList.add("icon-md");
    temp.classList.add("day-temp");

    dayForecastElem.appendChild(dayTitle);
    dayForecastElem.appendChild(date);
    dayForecastElem.appendChild(icon);
    dayForecastElem.appendChild(temp);

    return dayForecastElem;
  }

  renderHoursForecast() {
    this.hoursForecast.textContent = "";

    const hours = this.forecast.days[this.selectedDay].hours;
    let height = 48 * 6;

    for (let i in hours) {
      const hourForecast = this.createHourForecastElem(hours[i]);
      this.hoursForecast.appendChild(hourForecast);
    }
    this.hoursForecast.scrollTo(0, height);
  }

  createHourForecastElem(hour) {
    const hourForecastElem = this.doc.createElement("div");
    const hourElem = this.doc.createElement("span");
    const icon = this.doc.createElement("img");
    const temp = this.doc.createElement("span");
    const wind = this.createForecastElement(hour, "windspeed", true);
    const precipProb = this.createForecastElement(hour, "precipprob", true);

    hourElem.textContent = this.formatHour(hour.datetime);
    icon.setAttribute("src", WeatherApp.#icons[hour.icon]);
    temp.textContent = this.formatValue("temp", hour.temp);

    hourForecastElem.classList.add("hour-forecast");
    hourElem.classList.add("hour");
    icon.classList.add("icon-sm");
    temp.classList.add("hour-temp");

    hourForecastElem.appendChild(hourElem);
    hourForecastElem.appendChild(icon);
    hourForecastElem.appendChild(temp);
    hourForecastElem.appendChild(wind);
    hourForecastElem.appendChild(precipProb);

    return hourForecastElem;
  }

  // Formatters

  formatValue(element, value) {
    let formatted = value;
    if (element === "windspeed" || element === "templong") formatted += " ";
    formatted += WeatherApp.#units[this.unitGroup][element];
    return formatted;
  }

  formatHour(hour) {
    const hourISO = parseInt(hour.slice(0, 3));
    let formattedHour = "";
    if (hourISO === 12) {
      formattedHour += 12 + " PM";
    } else if (hourISO > 12) {
      formattedHour += hourISO - 12 + " PM";
    } else {
      formattedHour += hourISO + " AM";
    }
    return formattedHour;
  }

  // Static functions

  static #importAssets(files) {
    let assets = {};
    files.keys().forEach((item) => {
      const name = item.replace("./", "");
      assets[name.replace(".svg", "")] = files(item);
    });
    return assets;
  }
}

(function (doc) {
  const app = new WeatherApp(doc);
})(document);
