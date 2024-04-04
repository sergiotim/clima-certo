const card = document.getElementById("card");

const apiKeyOpenWeather = "722b6b9783e08cb4542615f6677db610";
const apiKeyUnsplash = "y4FelYkkOKM8V10hT5QNI6fWZ4SJlTbdaGMLRn_Nv-I";

const input = document.getElementById("input");
const button = document.getElementById("button");

const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const humidityElement = document.getElementById("umidity");
const windElement = document.getElementById("wind");
const countryElement = document.getElementById("country");
const backgroundElement = document.getElementById("background")

// Functions

async function searchData(cityName) {
  const link = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKeyOpenWeather}&lang=pt_br`;
  const request = await fetch(link);
  const data = await request.json();

  return data;
}

async function searchImage(cityName) {
  const link = `https://api.unsplash.com/search/photos/?client_id=${apiKeyUnsplash}&query=${cityName}`;
  const request = await fetch(link);
  const dataImage = await request.json()
  console.log(dataImage.results[0].urls.full)

  return dataImage.results[0].urls.full

}

async function showData(cityName) {
  const data = await searchData(cityName);
  console.log(data);
  const linkCountry = `https://flagsapi.com/${data.sys.country}/flat/24.png`;
  const linkBackground = await searchImage(data.name)

  cityElement.innerText = data.name;
  countryElement.setAttribute("src", linkCountry);
  temperatureElement.innerText = parseInt(data.main.temp - 273.15);
  descriptionElement.innerText = data.weather[0].description;
  humidityElement.innerText = data.main.humidity;
  windElement.innerText = data.wind.speed;
  card.classList.remove("invisible");
  card.classList.add("visible");

  
  backgroundElement.style.backgroundImage = `url(${linkBackground})`

}

// Events
button.addEventListener("click", (e) => {
  e.preventDefault();

  const cityName = input.value;

  showData(cityName);
});
