import "./style.css";
import { getForecast } from "./weather.js";
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

  constructor(doc) {
    this.doc = doc;
    this.forecast = processedData;
    this.selectedDay = 0;
    this.unitGroup = "metric";

    this.cacheDOM();
    this.attachEvents();
    this.renderApp();
  }
  cacheDOM() {
    this.searchBox = this.doc.querySelector("#search");
    this.searchBtn = this.doc.querySelector(".search-icon");
    this.celsiusBtn = this.doc.querySelector("#celsius-btn");
    this.fahrenheitBtn = this.doc.querySelector("#fahrenheit-btn");

    this.date = this.doc.querySelector(".forecast-date");
    this.locationDesc = this.doc.querySelector(".forecast-location");
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
    this.searchBtn.addEventListener("click", () => this.fetchForecast());
    this.celsiusBtn.addEventListener("click", () =>
      this.setUnitGroup("metric")
    );
    this.fahrenheitBtn.addEventListener("click", () => this.setUnitGroup("us"));
  }

  async fetchForecast() {
    const place = this.searchBox.value;
    console.log(place);
    this.forecast = await getForecast(place, this.unitGroup);
    this.renderApp();
    console.log(this.forecast);
  }

  setUnitGroup(unitGroup) {
    this.unitGroup = unitGroup;
  }
  // Events end
  renderApp() {
    this.renderForecast();
    this.renderForecastDetails();
    this.renderWeekForecast();
  }

  renderForecast() {
    const today = this.forecast.days[this.selectedDay];
    console.log(today);
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
    const iconWrapper = this.doc.createElement("span");
    const detailDesc = this.doc.createElement("span");
    const detailValue = this.doc.createElement("span");

    detailDesc.textContent = element;
    detailValue.textContent = this.formatValue(
      element,
      this.forecast.days[this.selectedDay][element]
    );

    wrapper.classList.add("detail-wrapper");
    iconWrapper.classList.add("icon-wrapper");
    detailDesc.classList.add("detail-desc");
    detailValue.classList.add("detail-value");

    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(detailDesc);
    wrapper.appendChild(detailValue);

    return wrapper;
  }

  renderWeekForecast() {
    this.weekForecast.textContent = "";

    const days = this.forecast.days;
    for (let i = 0; i < 7; i++) {
      const dayForecast = this.createDayForecastElem(days[i]);
      this.weekForecast.appendChild(dayForecast);
    }
  }
  renderHourlyForecast() {}

  createDayForecastElem(day) {
    const dayForecastElem = this.doc.createElement("div");
    const date = this.doc.createElement("div");
    const icon = this.doc.createElement("div");
    const temp = this.doc.createElement("div");

    date.textContent = day.datetime;
    icon.textContent = day.icon;
    temp.textContent = this.formatValue("temp", day.temp);

    dayForecastElem.classList.add("day-forecast");
    date.classList.add("day-date");
    date.classList.add("h4");
    icon.classList.add("day-icon");
    temp.classList.add("day-temp");

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
