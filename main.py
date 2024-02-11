import requests

API_KEY = '722b6b9783e08cb4542615f6677db610'
city = input('CIDADE:')
link = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&lang=pt_br'
request = requests.get(link).json()

description = request['weather'][0]['description']
temperature_K = request['main']['temp']
temperature_C = temperature_K - 273.15
print(description,f'{temperature_C:.2f}°C')