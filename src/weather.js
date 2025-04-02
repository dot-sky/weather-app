const KEY = "C2DGGA55DLBUPSUVXTRCWG5T5";
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

async function getForecast(city, unitGroup) {
  try {
    const url = buildURLRequest(city, unitGroup);
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      return { response, data: processInfo(json) };
    }
    return { response };
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
  return weatherDetails;
}

function encode(input) {
  const value = input.trim().toLowerCase();

  return encodeURI(value);
}

function buildURLRequest(city, unitGroup) {
  const URL =
    BASE_URL + encode(city) + "?key=" + KEY + "&unitGroup=" + unitGroup;
  return URL;
}

export { getForecast };
