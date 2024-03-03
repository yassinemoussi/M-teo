var xhr = new XMLHttpRequest();
const latitude = 34.6786;
const longitude = -1.9086;

xhr.open('GET', `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=eb97ceae3feb5222f29e2e9b3277b558&units=metric`);

var data;

xhr.onload = function () {
    data = JSON.parse(xhr.response);
    Header();
    MeteoHeure();
    MeteoSemaine();
    SunsetSunrise();
}

xhr.onerror = function () {
    console.log('The request has failed');
};

xhr.send();

function Header() {
    const currentDateTime = new Date();
    const day = currentDateTime.toLocaleDateString('en-US',{weekday: 'long'});

    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const time = `${hours}:${minutes}`;

    document.getElementById('currentDateTime').innerText = `${day}, ${time}`;
    document.getElementById('temperature').innerText = `${Math.round(data.list[0].main.temp)}°C`;
    document.getElementById('ville').innerText = data.city.name;
    document.getElementById('details').innerText = `Feels like ${Math.round(data.list[0].main.feels_like)}°, ${data.list[0].weather[0].description}`;
    document.querySelector('.icon-sun').className = `fas ${getWeatherIcon(data.list[0].weather[0].icon)}`;
}

function MeteoHeure() {
    var data = JSON.parse(xhr.response);
    let html = '<table>';
    let hoursHtml = '<tr>';
    let precipitationHtml = '<tr>';
    let newSun = "<tr>";
    let temperatureHtml = '<tr>';
    let newRain = "<tr>";

    const uniqueHours = new Set();

    for (let i = 0; data.list && i < data.list.length; i++) {
        const hour = data.list[i];
        const timestamp = new Date(hour.dt * 1000);
        const time = `${timestamp.getHours()}:${timestamp.getMinutes() < 10 ? '0' : ''}${timestamp.getMinutes()}`;
        const temperature = Math.round(hour.main.temp);
        // Ajout de cette ligne pour obtenir les précipitations
        const precipitation = hour.rain ? hour.rain['3h'] : 0; 

        if (!uniqueHours.has(time)) {
            hoursHtml += `<th>${time}</th>`;
            newSun += `<td><i class="fas ${getWeatherIcon(hour.weather[0].icon)}" style="color: #f0d02d;"></i></td>`;
            temperatureHtml += `<td>${temperature}°C</td>`;
            newRain += `<td><i class="fas fa-droplet" style="color: #ffffff; font-size: 1rem;"></i>${precipitation}%</td>`; 
            uniqueHours.add(time);
        }
    }

    hoursHtml += '</tr>';
    temperatureHtml += '</tr>';
    newRain += '</tr>';
    html += hoursHtml + newSun + temperatureHtml + newRain + '</table>';
    document.getElementById('MeteoHeure').innerHTML = html;
}

function MeteoSemaine() {
    if (data.list && data.list.length > 0 && data.list[0].main && data.list[0].weather && data.list[0].weather.length > 0) {
        const semaineTable = document.getElementById('MeteoSemaine');
        const jours = ['Today', 'Tomorrow', 'Day after Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];

        semaineTable.innerHTML = '';

        const currentDate = new Date();

        for (let i = 0; i < 7; i++) {
            const forecastIndex = i * Math.floor(data.list.length / 7);

            if (forecastIndex < data.list.length) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + i);

                const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'long' });
                const precipitation = data.list[forecastIndex].rain ? data.list[forecastIndex].rain['3h'] : 0; // Ajout de cette ligne pour obtenir les précipitations

                const row = `
                    <table class="journee">
                        <tr>
                            <td>${dayName}</td>
                            <td><i class="fas fa-droplet" style="color: #f3f1f1;"></i> ${precipitation} %</td> <!-- Ajout de cette ligne pour afficher les précipitations -->
                            <td><i class="fas ${getWeatherIcon(data.list[forecastIndex].weather[0].icon)}" style="color: #f0d02d;"></i></td>
                            <td><i class="fas fa-moon" style="color: #f0d02d;"></i></td>
                            <td>${Math.round(data.list[forecastIndex].main.temp)}°</td>
                            <td>${Math.round(data.list[forecastIndex].main.temp) - 7}°</td>
                        </tr>
                    </table>
                `;
                semaineTable.innerHTML += row;
            }
        }
    } else {
        throw new Error('Invalid data format in API response');
    }
}

function SunsetSunrise() {
    const sunriseTimestamp = data.city.sunrise;
    const sunsetTimestamp = data.city.sunset;

    const sunriseTime = new Date(sunriseTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(sunsetTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sunriseSunsetHtml = `
        <table>
            <tr>
                <td>Sunset</td>
                
                <td>Sunrise</td>
            </tr>

            <tr>
                <td>${sunsetTime}</td>
                
                <td>${sunriseTime}</td>
            </tr>
            <tr>
                <td><i class="fas fa-sun" style="color: #f0d02d; font-size: 6.5rem;"></i></td>
                <td><i class="fas fa-sun" style="color: #f0d02d; font-size: 6.5rem;"></i></td>
            </tr>
            <tr class="position-arrouw">
                <td><i class="fa-solid fa-arrow-down" style="color: #ffffff; font-size: 5rem;"></i></td>
                <td><i class="fa-solid fa-arrow-up" style="color: #ffffff; font-size: 5rem;"></i></td>
            </tr>
        </table>
    `;

    document.getElementById('SunsetSunrise').innerHTML = sunriseSunsetHtml;
}


function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fa-sun',
        '02d': 'fa-cloud-sun',
        '03d': 'fa-cloud',
        '04d': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-sun-rain',
        '11d': 'fa-bolt',
        '13d': 'fa-snowflake',
        '50d': 'fa-smog',
        '01n': 'fa-moon',
        '02n': 'fa-cloud-moon',
        '03n': 'fa-cloud',
        '04n': 'fa-cloud',
        '09n': 'fa-cloud-showers-heavy',
        '10n': 'fa-cloud-moon-rain',
        '11n': 'fa-bolt',
        '13n': 'fa-snowflake',
        '50n': 'fa-smog'
    };
    return iconMap[iconCode] || 'fa-question';
}
