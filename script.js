const today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const APIkey = '24efea332a9cf0abcfd7b79b7c7be057'
var weatherInfo
var indexUV
var fiveDay

var fakeStorage = localStorage.fakeStorage ? JSON.parse(localStorage.fakeStorage) : []

async function citySearch() {
    event.preventDefault()

    let cityName = document.querySelector('#cityBox').value
    let apiLink = 'http://api.openweathermap.org/data/2.5/weather?q='+cityName+'&units=metric&appid='+APIkey
    
    document.querySelector('#searchHistory').innerHTML +=
    `
    <tr>
        <td scope="row">${cityName}</td>
    </tr>
    `

    await fetch(apiLink)
    .then(response => response.json())
    .then(function(response){
        weatherInfo = response
        console.log (weatherInfo)
    })

    await fetch(`http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${weatherInfo.coord.lat}&lon=${weatherInfo.coord.lon}&appid=${APIkey}`)
    .then(response => response.json())
    .then(function(response){
        indexUV = response
        console.log (indexUV)
    })

    await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIkey}`)
    .then(response => response.json())
    .then(function(response){
        fiveDay = response
        console.log (fiveDay)
    })

    localStorage.fakeStorage = JSON.stringify(fakeStorage)

    displayWeather()
}

function displayWeather() {
    document.querySelector('#generalWeather').innerHTML =
    `
    <h2>${weatherInfo.name} [ ${date} ]</h2>
    <p>Temperature: ${weatherInfo.main.temp}&deg;C</p>
    <p>Humidity: ${weatherInfo.main.humidity}%</p>
    <p>Wind Speed: ${weatherInfo.wind.speed} km/h</p>
    <p>UV Index: ${indexUV[0].value}</p>
    `

    for (var i = 3 ; i < 40 ; i = i + 8) {
        var shortDate = fiveDay.list[i].dt_txt.slice(0,10)
        var celTemp = Math.round(Number(fiveDay.list[i].main.temp))-273.15
        var celTempCalc = celTemp.toFixed(2)

        document.querySelector('#fiveDay').innerHTML +=
        `
        <div class="col-12 col-sm-6 col-md-4 col-lg myCard">
            <p style="font-weight:bold;">${shortDate}</p>
            <p>${fiveDay.list[i].weather[0].icon}</p>
            <p>${celTempCalc}&deg;C</p>
            <p>${fiveDay.list[i].main.humidity}%</p>
        </div>
        `
    }
}

//  3,11,19,27,35