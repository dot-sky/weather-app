import { getForecast } from "./weather.js";

export class EventsController {
  constructor(document) {
    this.doc = document;
    this.cacheDOM();
  }

  cacheDOM() {
    this.doc = document;
    this.celsiusBtnLabel = this.doc.querySelector("#celsius-label");
    this.fahrenheitBtnLabel = this.doc.querySelector("#fahrenheit-label");
    this.searchBox = this.doc.querySelector("#search");
    this.errorBox = this.doc.querySelector(".error-box");
    this.errorMsg = this.doc.querySelector("#error-msg");
  }

  validateSearchInput(input) {
    if (input.validity.valueMissing) {
      input.setCustomValidity("Type a place to start");
    } else {
      input.setCustomValidity("");
    }
  }

  clickUnitGroupBtn(unit, updateUnitGroup) {
    if (unit === "us") {
      this.fahrenheitBtnLabel.classList.add("checked");
      this.celsiusBtnLabel.classList.remove("checked");
    } else {
      this.celsiusBtnLabel.classList.add("checked");
      this.fahrenheitBtnLabel.classList.remove("checked");
    }

    updateUnitGroup(unit);
  }

  submitSearch(event, unitGroup, updateForecast, updateLocation) {
    event.preventDefault();
    this.fetchForecast(
      this.searchBox.value,
      unitGroup,
      updateForecast,
      updateLocation
    );
  }

  async fetchForecast(location, unitGroup, updateforecast, updateWindow) {
    const res = await getForecast(location, unitGroup);
    if (res.response.ok) {
      updateforecast(location, res.data);
      updateWindow();
      this.hideErrorMsg();
    } else {
      this.handleInvalidRequest();
    }
  }

  handleInvalidRequest() {
    this.errorMsg.textContent = `We can't find the forecast for this place, try again or look for other location`;
    this.errorBox.classList.remove("hidden");
  }

  hideErrorMsg() {
    this.errorBox.classList.add("hidden");
  }
}
