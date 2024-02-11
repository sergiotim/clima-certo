const apiKey =  '722b6b9783e08cb4542615f6677db610'
// const cityName = prompt('CIDADE')
const link = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&lang=pt_br`


const getData = async (city) => {

    const request = await fetch(link)
    const data = await request.json()
    const temperature_K = data.main.temp - 273.15
    const description = data.weather[0].
    console.log(temperature_K)


}

getData(cityName)


// API_KEY = '722b6b9783e08cb4542615f6677db610'
// city = input('CIDADE:')
// link = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&lang=pt_br'
// request = requests.get(link).json()

// description = request['weather'][0]['description']
// temperature_K = request['main']['temp']
// temperature_C = temperature_K - 273.15
// print(description,f'{temperature_C:.2f}°C')