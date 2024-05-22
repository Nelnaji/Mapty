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


if(navigator.geolocation)
    // gather coordonates
navigator.geolocation.getCurrentPosition(function(position){

    // store the coordonates
        let {latitude} = position.coords
        let {longitude} = position.coords

        // store map in map
        const map = L.map('map').setView([latitude, longitude], 13);
// display map
// https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png pour un autre style
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // marker crée
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('My location')
            .openPopup();

    }, function(){
        alert('Could not get your position.')
    }
);
                                                                                                                                

