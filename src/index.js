import { format, parseISO } from "date-fns";
import { getForecast } from "./weather.js";

import "./style.css";

import { processedData } from "./test.js";

console.log(processedData);

// const data = getForecast("london").then((res) => console.log(res));

class WeatherApp {
  static #units = {
    us: {
      temp: "°F",
      feelslike: "°F",
      windspeed: "mph",
      humidity: "%",
      precipprob: "%",
    },
    metric: {
      temp: "°C",
      feelslike: "°C",
      windspeed: "kph",
      humidity: "%",
      precipprob: "%",
    },
  };

  static #icons = WeatherApp.#importAssets(
    require.context("./assets/forecast", false, /\.(svg)$/)
  );
  static #uiIcons = WeatherApp.#importAssets(
    require.context("./assets/icons", false, /\.(svg)$/)
  );

  static #importAssets(files) {
    let assets = {};
    files.keys().forEach((item) => {
      const name = item.replace("./", "");
      assets[name.replace(".svg", "")] = files(item);
    });
    return assets;
  }
  constructor(doc) {
    this.doc = doc;
    this.forecast = processedData;
    this.selectedDay = 0;
    this.unitGroup = "us";
    this.location = "london";

    this.cacheDOM();
    this.attachEvents();
    this.renderApp();
    console.log(WeatherApp.#icons);
  }
  cacheDOM() {
    this.searchBox = this.doc.querySelector("#search");
    this.searchBtn = this.doc.querySelector(".search-icon");
    this.celsiusBtn = this.doc.querySelector("#celsius");
    this.celsiusBtnLabel = this.doc.querySelector("#celsius-label");
    this.fahrenheitBtn = this.doc.querySelector("#fahrenheit");
    this.fahrenheitBtnLabel = this.doc.querySelector("#fahrenheit-label");

    this.date = this.doc.querySelector(".forecast-date");
    this.locationDesc = this.doc.querySelector(".forecast-location");
    this.forecastMainIcon = this.doc.querySelector("#forecast-icon-day");
    this.forecastTemp = this.doc.querySelector("#forecast-temp");
    this.forecastDesc = this.doc.querySelector(".forecast-desc");
    this.limitTempWrapper = this.doc.querySelector(".limit-temp-forecast");
    this.todayMaxTemp = this.doc.querySelector("#max-temp");
    this.todayMinTemp = this.doc.querySelector("#min-temp");

    this.forecastDetails = this.doc.querySelector(".forecast-details");
    this.weekForecast = this.doc.querySelector(".week-forecast");
    this.hourForecast = this.doc.querySelector(".hour-forecast");
  }

  // Events
  attachEvents() {
    this.searchBtn.addEventListener("click", () => this.updateLocation());
    this.celsiusBtn.addEventListener("click", () =>
      this.clickUnitGroupBtn("metric")
    );
    this.fahrenheitBtn.addEventListener("click", () =>
      this.clickUnitGroupBtn("us")
    );
  }

  updateLocation() {
    this.location = this.searchBox.value;
    this.fetchForecast();
  }

  async fetchForecast() {
    this.forecast = await getForecast(this.location, this.unitGroup);

    this.renderApp();
  }

  clickUnitGroupBtn(unit) {
    if (unit === "us") {
      this.fahrenheitBtnLabel.classList.add("checked");
      this.celsiusBtnLabel.classList.remove("checked");
    } else {
      this.celsiusBtnLabel.classList.add("checked");
      this.fahrenheitBtnLabel.classList.remove("checked");
    }

    this.updateUnitGroup(unit);
  }

  updateUnitGroup(unitGroup) {
    if (this.unitGroup !== unitGroup) {
      this.unitGroup = unitGroup;
      this.fetchForecast();
    }
  }

  // Events end
  renderApp() {
    this.renderForecast();
    this.renderForecastDetails();
    this.renderWeekForecast();
  }

  renderForecast() {
    const today = this.forecast.days[this.selectedDay];
    this.date.textContent = format(parseISO(today.datetime), "EEEE, d MMMM y ");
    this.forecastMainIcon.setAttribute("src", WeatherApp.#icons[today.icon]);

    this.locationDesc.textContent = this.forecast.resolvedAddress;
    this.forecastTemp.textContent = this.formatValue("temp", today.temp);
    this.forecastDesc.textContent = today.description;
    this.todayMaxTemp.textContent = this.formatValue("temp", today.tempmax);
    this.todayMinTemp.textContent = this.formatValue("temp", today.tempmin);
  }

  renderForecastDetails() {
    this.forecastDetails.textContent = "";

    const realFeel = this.createForecastElement("feelslike");
    const precipProb = this.createForecastElement("precipprob");
    const humidity = this.createForecastElement("humidity");
    const wind = this.createForecastElement("windspeed");

    this.forecastDetails.appendChild(realFeel);
    this.forecastDetails.appendChild(precipProb);
    this.forecastDetails.appendChild(humidity);
    this.forecastDetails.appendChild(wind);
  }

  createForecastElement(element) {
    const wrapper = this.doc.createElement("div");
    const icon = this.doc.createElement("img");
    const detailDesc = this.doc.createElement("span");
    const detailValue = this.doc.createElement("span");

    detailDesc.textContent = element;
    detailValue.textContent = this.formatValue(
      element,
      this.forecast.days[this.selectedDay][element]
    );
    icon.setAttribute("src", WeatherApp.#uiIcons[element]);

    wrapper.classList.add("detail-wrapper");
    icon.classList.add("icon-sm");
    detailDesc.classList.add("detail-desc");
    detailValue.classList.add("detail-value");

    wrapper.appendChild(icon);
    wrapper.appendChild(detailDesc);
    wrapper.appendChild(detailValue);

    return wrapper;
  }

  renderWeekForecast() {
    this.weekForecast.textContent = "";

    const days = this.forecast.days;
    for (let i = 0; i < 7; i++) {
      const dayForecast = this.createDayForecastElem(days[i], i === 0);
      this.weekForecast.appendChild(dayForecast);
    }
  }
  renderHourlyForecast() {}

  createDayForecastElem(day, today) {
    const dayForecastElem = this.doc.createElement("div");
    const dayTitle = this.doc.createElement("div");
    const date = this.doc.createElement("div");
    const icon = this.doc.createElement("img");
    const temp = this.doc.createElement("div");

    dayTitle.textContent = format(day.datetime, "eee");
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
  createHourForecastElem() {}

  // Formatters

  formatValue(element, value) {
    return value + " " + WeatherApp.#units[this.unitGroup][element];
  }
}

(function (document) {
  const app = new WeatherApp(document);
})(document);
