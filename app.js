'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


// This class holds the data that is common in type of workout
class Workout {
    id = (Date.now() + '').slice(-10) //generating id using date
    date = new Date();

    constructor(coords, distance, duration) {
        this.coords = coords; // an array [lat,log]
        this.distance = distance; // in km
        this.duration = duration; // in min

    }
}


class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPace();

    }

    calcPace() {
        // minutes/km
        this.pace = this.distance / this.duration

    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed()
    }

    calcSpeed() {
        //km/h
        this.speed = this.distance / (this.duration / 60)

    }

}

const run = new Running([39, -12], 5.2, 24, 178)
const cycle = new Cycling([39, -12], 27, 95, 523)





///////////APPLICATION ARCHITECTURE
//this class stores all workout info

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class App {
    #map
    #mapEvent
    //load page

    constructor() {
        this._getPosition();


        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', this._toggleElevationField);

    }

    //****Geolocation Api
    //if it geolocation exists
    _getPosition() {
        if (navigator.geolocation)
            //loadMap gets returned as regular function, this in regular function points to global. so we bind it and call on current object
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                console.log('success');
            })
        else {
            alert('Sorry unable to get your current location. check to see if your browser is allowed to locate your current location.')
        }
    }

    //set position/coordinates
    _loadMap(position) {

        const coords = [position.coords.latitude, position.coords.longitude]

        this.#map = L.map('map').setView(coords, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.#map);


        //Handling clicks on map
        this.#map.on('click', this._showForm.bind(this))



    };

    //click on the map
    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus();

    }

    //chenge input depending on workout
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    //submit the form
    _newWorkout(e) {
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const checkPositive = (...checkNum) => checkNum.every(num => num >= 0)
        e.preventDefault()

        // Get data from form
        //value = selected option
        const type = inputType.value;
        const distance = +inputDistance.value
        const duration = +inputDuration.value


        //if workout is running, then create running object
        if (type === 'running') {
            const cadence = +inputCadence.value
            //check if data is valid using gaurd clause
            if (!validInputs(distance, duration, cadence) || (!checkPositive(distance, duration, cadence))
            )
                return alert('Enter only positive numbers!')

        }

        //if workout is cycling, then create cyling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value

            //check if data is valid using gaurd clause
            if (!validInputs(distance, duration, elevation) || (!checkPositive(distance, duration, elevation))
            )
                return alert('Enter only positive numbers!')

        }

        //add new object to workout array i.e the coords of where user is running

        //render workout on map as marker

        //render workout on list

        //hide form and clear input field
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

        //display marker
        const { lat, lng } = this.#mapEvent.latlng
        //add marker
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 255,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup',


            }))
            .setPopupContent('Running')
            .openPopup();
    }
}

const app = new App()
