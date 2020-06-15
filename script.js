// Display Current Date
const today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

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

// Generate Search History List
function genHistoryList() {
    document.querySelector('#searchHistory').innerHTML = ""
    for (var idx = 0 ; idx < searchSave.length ; idx++) {
        document.querySelector('#searchHistory').innerHTML +=
        `
        <tr>
            <td scope="row">${searchSave[idx]}</td>
        </tr>
        `
    }
}

// Main Weather Search Function
async function citySearch(cityName) {
    // API KEY
    const APIkey = '24efea332a9cf0abcfd7b79b7c7be057'
    var apiLink
    var indexUVLink
    var fiveDayLink

    // fix loading on github pages
    if (location.protocol === 'http:') {
        apiLink = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIkey}`
    } else {
        apiLink = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIkey}`
    }
    // Get Current Weather
    const weatherInfo = await fetch(apiLink).then(response => response.json())
    
    // fix loading on github pages
    if (location.protocol === 'http:') {
        indexUVLink = `http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${weatherInfo.coord.lat}&lon=${weatherInfo.coord.lon}&appid=${APIkey}`
    } else {
        indexUVLink = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${weatherInfo.coord.lat}&lon=${weatherInfo.coord.lon}&appid=${APIkey}`
    }
    // Search for UVindex with longitude/latitude from first request
    const indexUV = await fetch(indexUVLink).then(response => response.json())
    
    // fix loading on github pages
    if (location.protocol === 'http:') {
        fiveDayLink = `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIkey}`
    } else {
        fiveDayLink = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIkey}`
    }
    // Five Day Forcast Info
    const fiveDay = await fetch(fiveDayLink).then(response => response.json())

    // console.log (fiveDay)

    displayWeather(weatherInfo, indexUV, fiveDay)
}

// Function to generate weather information found
function displayWeather(weatherInfo, indexUV, fiveDay) {
    var weatherOne = document.querySelector('#generalWeather').innerHTML =
    `
    <h2>${weatherInfo.name} [ ${date} ]<img class="" src="openweathermap.org/img/wn/${weatherInfo.weather[0].icon}.png"></h2>
    <p>Temperature: ${weatherInfo.main.temp}&deg;C</p>
    <p>Humidity: ${weatherInfo.main.humidity}%</p>
    <p>Wind Speed: ${weatherInfo.wind.speed} km/h</p>
    <p>UV Index: <span id="uvExposure">${indexUV[0].value}</span></p>
    `

    // Only want to Add to Search History if New
    let searchHistoryName = `${weatherInfo.name}, ${weatherInfo.sys.country}`
    searchSave.indexOf(searchHistoryName) === -1 ? searchSave.push(searchHistoryName) : console.log("Already in Search History");

    uvCheck(indexUV[0].value)
    
    // Clear old 5day search
    document.querySelector('#fiveDay').innerHTML = ``

    //  Index Entries for Noon Forcasts ??
    for (var i = 4 ; i < 40 ; i = i + 8) {
        var shortDate = fiveDay.list[i].dt_txt.slice(0,10)
        var celTemp = Math.round(Number(fiveDay.list[i].main.temp))-273.15
        var celTempCalc = celTemp.toFixed(2)

        var weatherTwo = document.querySelector('#fiveDay').innerHTML +=
        `
        <div class="col-12 col-sm-6 col-md-6 col-lg myCard">
            <p style="font-weight:bold;">${shortDate}</p>
            <img class="" src="openweathermap.org/img/wn/${fiveDay.list[i].weather[0].icon}.png">
            <p>Temp: ${celTempCalc}&deg;C</p>
            <p>Humidity: ${fiveDay.list[i].main.humidity}%</p>
        </div>
        `
    }

    localSave(weatherOne, weatherTwo)
    genHistoryList()  
}

// Local Storage to Save Display Previous Search on Reload
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

// Search Weather by City with Search Bar
function mainSearch() {
    event.preventDefault()
    const cityName = document.querySelector('#cityBox').value
    citySearch(cityName)
}

// Search Weather on History List Click
const historySearch = document.querySelector('#searchHistory')
historySearch.addEventListener('click', function(event) {
    event.preventDefault()
    if (event.target.tagName === 'TD') {
        console.log(event)
        let goSearch = event.target.firstChild.textContent
        citySearch(goSearch)
    }
}, false)