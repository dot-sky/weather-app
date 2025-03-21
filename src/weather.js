import { data } from "./test.js";
const KEY = "C2DGGA55DLBUPSUVXTRCWG5T5";
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

async function getInfo(city) {
  try {
    const url = addKey(BASE_URL + city);
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      return processInfo(json);
    }
  } catch (error) {
    console.log(error);
    return "error";
  }
}

function processInfo(json) {
  const { datetime, ...currentConditions } = json.currentConditions;
  const today = { ...json.days[0], ...currentConditions };
  const weatherDetails = {
    resolvedAddress: json.resolvedAddress,
    description: json.description,
    days: json.days,
  };
  weatherDetails.days[0] = today;
  // console.log(weatherDetails);
  return weatherDetails;
}

function addKey(url) {
  return url + "?key=" + KEY;
}

// processInfo(data);

export { getInfo };
