function showAddCountry() {
    document.getElementById('content').innerHTML = `
        <form id="addCountryForm">
            <label for="countryName">Country Name:</label>
            <input type="text" id="countryName" name="countryName" required>
            <button type="submit">Add Country</button>
        </form>
    `;
    document.getElementById('addCountryForm').onsubmit = async function (e) {
        e.preventDefault();
        const countryName = document.getElementById('countryName').value.trim();
        const response = await fetch('/add_country', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: countryName }),
        });
        const result = await response.json();
        alert(result.message);
    };
}
function showCountries() {
    fetch('/get_countries')
        .then(response => response.json())
        .then(data => {
            document.getElementById('content').innerHTML = `
                <div id="map" style="height: 500px;"></div>
                <ul>${data.countries.map(country => `<li>${country}</li>`).join('')}</ul>
            `;
            renderMap(data.locations);
        });
}
function showDeleteCountry() {
    fetch('/get_countries')
        .then(response => response.json())
        .then(data => {
            document.getElementById('content').innerHTML = `
                <form id="deleteCountryForm">
                    <label for="countryName">Select Country:</label>
                    <select id="countryName">${data.countries.map(country => `<option>${country}</option>`).join('')}</select>
                    <button type="submit">Delete Country</button>
                </form>
            `;
            document.getElementById('deleteCountryForm').onsubmit = async function (e) {
                e.preventDefault();
                const countryName = document.getElementById('countryName').value;
                const response = await fetch('/delete_country', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: countryName }),
                });
                const result = await response.json();
                alert(result.message);
            };
        });
}
function renderMap(locations) {
    // Elimina el mapa existente si ya está creado
    const mapContainer = document.getElementById('map');
    if (mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null;
    }

    const map = L.map('map').setView([20, 0], 2); // Configura el mapa centrado
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Agrega marcadores para cada país
    locations.forEach(location => {
        if (location.lat && location.lng) {
            L.marker([location.lat, location.lng])
                .addTo(map)
                .bindPopup(location.name);
        }
    });
}
