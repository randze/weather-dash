const today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

const APIkey = '24efea332a9cf0abcfd7b79b7c7be057'
var weatherInfo
var indexUV
var fiveDay

// localstorage variables
var haveLastSearch = localStorage.searchSave ? true : false
var searchSave = localStorage.searchSave ? JSON.parse(localStorage.searchSave) : []

if (haveLastSearch) {
    genHistoryList()

    let weatherOne = JSON.parse(localStorage.saveOne)
    let weatherTwo = JSON.parse(localStorage.saveTwo)

    document.querySelector('#generalWeather').innerHTML = weatherOne
    document.querySelector('#fiveDay').innerHTML = weatherTwo

    let indexNum = document.querySelector('#uvExposure').textContent
    uvCheck(indexNum)
}

function genHistoryList() {
    for (var idx = 0 ; idx < searchSave.length ; idx++) {
        document.querySelector('#searchHistory').innerHTML +=
        `
        <tr>
            <td scope="row">${searchSave[idx]}</td>
        </tr>
        `
    }
}

async function citySearch() {
    event.preventDefault()

    let cityName = document.querySelector('#cityBox').value
    let apiLink = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIkey}`
    
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

    displayWeather()
}

// Function to generate weather information found
function displayWeather() {
    var weatherOne = document.querySelector('#generalWeather').innerHTML =
    `
    <h2>${weatherInfo.name} [ ${date} ]<img class="" src="http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}.png"></h2>
    <p>Temperature: ${weatherInfo.main.temp}&deg;C</p>
    <p>Humidity: ${weatherInfo.main.humidity}%</p>
    <p>Wind Speed: ${weatherInfo.wind.speed} km/h</p>
    <p>UV Index: <span id="uvExposure">${indexUV[0].value}</span></p>
    `

    searchSave.push(`${weatherInfo.name}, ${weatherInfo.sys.country}`)

    uvCheck(indexUV[0].value)
    
    // Clear old 5day search
    document.querySelector('#fiveDay').innerHTML = ``

    //  Index Entries for Noon Forcasts 3,11,19,27,35
    for (var i = 3 ; i < 40 ; i = i + 8) {
        var shortDate = fiveDay.list[i].dt_txt.slice(0,10)
        var celTemp = Math.round(Number(fiveDay.list[i].main.temp))-273.15
        var celTempCalc = celTemp.toFixed(2)

        var weatherTwo = document.querySelector('#fiveDay').innerHTML +=
        `
        <div class="col-12 col-sm-6 col-md-6 col-lg myCard">
            <p style="font-weight:bold;">${shortDate}</p>
            <img class="" src="http://openweathermap.org/img/wn/${fiveDay.list[i].weather[0].icon}.png">
            <p>Temp: ${celTempCalc}&deg;C</p>
            <p>Humidity: ${fiveDay.list[i].main.humidity}%</p>
        </div>
        `
    }

    localSave(weatherOne, weatherTwo)
    
    // Display search history
    genHistoryList()
    
}

function localSave(saveOne, saveTwo) {
    haveLastSearch = true
    localStorage.searchSave = JSON.stringify(searchSave)
    localStorage.saveOne = JSON.stringify(saveOne)
    localStorage.saveTwo = JSON.stringify(saveTwo)
}


// favorable, moderate, or severe UVindex based on "https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html"
function uvCheck(value) {
    if (value >= 6) {
        document.getElementById("uvExposure").style.background="red";
    } else if (value > 2) {
        document.getElementById("uvExposure").style.background="yellow";
    } else {
        document.getElementById("uvExposure").style.background="green";
    }
}



