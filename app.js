'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

//****Geolocation Api

//if it geolocation exists
if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function (position) {
        //if getting current possition successfull then
        // const { latitude } = position.coords;
        // const { longitude } = position.coords;
        // console.log(latitude, longitude);

        const coords = [position.coords.latitude, position.coords.longitude]


        map = L.map('map').setView(coords, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);


        //Handling clicks on map
        function onMapClick(mapE) {
            // alert("You clicked the map at " + mapEvent.latlng);

            mapEvent = mapE
            form.classList.remove('hidden')
            inputDistance.focus();


        }

        map.on('click', onMapClick)

    }, function () {
        // getting current possition NOT successfull then
        alert('Could NOT get your current location, please check if you have your browser location on')
    })


form.addEventListener('submit', function (e) {
    e.preventDefault()

    //clear input field
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

    //display marker
    const { lat, lng } = mapEvent.latlng
    //add marker
    L.marker([lat, lng]).addTo(map)
        .bindPopup(L.popup({
            maxWidth: 255,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',


        }))
        .setPopupContent('Running')
        .openPopup();
})

inputType.addEventListener('change', function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

})