from flask import Flask, request, jsonify, render_template
import sqlite3
import requests

app = Flask(__name__)

DATABASE = 'countries.db'
API_URL = 'https://restcountries.com/v3.1/all'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS countries (name TEXT PRIMARY KEY)''')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_country', methods=['POST'])
def add_country():
    country = request.json.get('country', '').strip().title()
    countries = [c['name']['common'] for c in requests.get(API_URL).json()]
    if country in countries:
        with sqlite3.connect(DATABASE) as conn:
            if conn.execute('SELECT 1 FROM countries WHERE name = ?', (country,)).fetchone():
                return jsonify({'message': 'Country already exists.'})
            conn.execute('INSERT INTO countries (name) VALUES (?)', (country,))
        return jsonify({'message': 'Country added successfully!'})
    return jsonify({'message': 'Invalid country name.'})

@app.route('/get_countries')
def get_countries():
    with sqlite3.connect(DATABASE) as conn:
        # Recupera los países y los ordena alfabéticamente
        countries = sorted([row[0] for row in conn.execute('SELECT name FROM countries')])

    locations = []
    for country in countries:
        response = requests.get(f"https://restcountries.com/v3.1/name/{country}")
        if response.status_code == 200:
            data = response.json()[0]
            lat, lng = data['latlng']
            locations.append({'name': country, 'lat': lat, 'lng': lng})
        else:
            locations.append({'name': country, 'lat': None, 'lng': None})

    return jsonify({'countries': countries, 'locations': locations})



@app.route('/delete_country', methods=['DELETE'])
def delete_country():
    country = request.json.get('country')
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('DELETE FROM countries WHERE name = ?', (country,))
    return jsonify({'message': 'Country deleted successfully!'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)

