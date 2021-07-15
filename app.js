'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


// This class holds the data that is common in type of workout
class Workout {
    id = (Date.now() + '').slice(-10) //generating id using date
    date = new Date();
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords; // an array [lat,log]
        this.distance = distance; // in km
        this.duration = duration; // in min

    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Nov']

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    click() {
        this.clicks++;
        // return this
    }
}


class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPace();

        this._setDescription();

    }

    calcPace() {
        // minutes/km
        this.pace = this.distance / this.duration

    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed()
        this._setDescription();
    }

    calcSpeed() {
        //km/h
        this.speed = this.distance / (this.duration / 60)

    }

}







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
    #mapZoomLevel = 15
    #mapEvent
    #workouts = []

    constructor() {
        //Get user's position
        this._getPosition();
        //get data from local storage
        this._getLocalStorage();


        //Attach event Handlers
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))

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

        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.#map);


        //Handling clicks on map
        this.#map.on('click', this._showForm.bind(this))

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });





    };

    //click on the map
    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus();

    }

    //hide form whenever for new input
    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => (form.style.display = 'grid'), 1000)
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

        const { lat, lng } = this.#mapEvent.latlng

        let workout


        //if workout is running, then create running object
        if (type === 'running') {
            const cadence = +inputCadence.value
            //check if data is valid using gaurd clause
            if (
                !validInputs(distance, duration, cadence) ||
                !checkPositive(distance, duration, cadence)
            )
                return alert('Enter only positive numbers!')

            workout = new Running([lat, lng], distance, duration, cadence)

        }

        //if workout is cycling, then create cyling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value

            //check if data is valid using gaurd clause
            if (
                !validInputs(distance, duration, elevation) ||
                !checkPositive(distance, duration)
            )
                return alert('Enter only positive numbers!')

            workout = new Cycling([lat, lng], distance, duration, elevation)

        }

        //add new object to workout array i.e the coords of where user is running
        this.#workouts.push(workout)

        //render workout on map as marker
        this._renderWorkoutMarker(workout)

        //render workout on list
        this._renderWorkout(workout)

        //hide form and clear input field
        this._hideForm()

        //set local storage to all workouts
        this._setLocalStorage()


    }


    _renderWorkoutMarker(workout) {
        //add marker
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 255,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,


            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();

    }

    //rendering workouts
    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
            </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                   <span class="workout__unit">min</span>
                </div>

        `;

        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                      <span class="workout__icon">⚡️</span>
                       <span class="workout__value">${workout.pace.toFixed(1)}</span>
                      <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            
        `;
        }

        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            
            `;

        }

        form.insertAdjacentHTML('afterend', html)

    }


    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout')

        //gaurd clause
        if (!workoutEl) return;

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })

        //using public interface
        // workout.click()
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'))

        if (!data) return;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        });
    }

    reset() {
        localStorage.removeItem('workouts')
        location.reload();
    }
}

const app = new App()


///edit workout
//delete workout
//delete all workout
//sort
//confirm messages