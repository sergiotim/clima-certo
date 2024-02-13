const card = document.getElementById("card");

const apiKey = "722b6b9783e08cb4542615f6677db610";

const input = document.getElementById("input");
const button = document.getElementById("button");

const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const humidityElement = document.getElementById("umidity");
const windElement = document.getElementById("wind");
const countryElement = document.getElementById("country")

// Functions

async function searchData(cityName) {
  const link = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&lang=pt_br`;
  const request = await fetch(link);
  const data = await request.json();

  return data;
}

async function showData(cityName) {

  console.log(searchData(cityName));
  const data = await searchData(cityName);
  cityElement.innerText = data.name;
  countryElement.innerText = `, ${data.sys.country}`
  temperatureElement.innerText = parseInt(data.main.temp - 273.15);
  descriptionElement.innerText = data.weather[0].description;
  humidityElement.innerText = data.main.humidity;
  windElement.innerText = data.wind.speed;
  card.classList.remove('invisible')
  card.classList.add('visible')
}

// Events
button.addEventListener("click", (e) => {
  e.preventDefault();

  const cityName = input.value;

  showData(cityName);
});
