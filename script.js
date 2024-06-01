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

// workout class
class Workout {
  date = new Date();
  // relying on the time to create a unique ID is a bad idea if there are many users using the app at the same time.
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    // this.date=...
    // this.id=...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

// extending workout class to Cycling and Running
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// houray the classes are working
// const run1 = new Running([39,-12], 5.2, 24, 178)
// const cycle1 = new Cycling([39,-12], 27, 95, 523)

// console.log(run1, cycle1)

////////////////////////////////////////////////////////////////
///////////////////////////////////////
// regrouping the app working machinery, in the App class

class App {
  // setting up private class field
  #map;
  #mapEvent;
  #workouts = [];
  // this constructor method is executed immediately as the page loads.
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    // gather coordonates
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Could not get your position.');
      }
    );
  }

  _loadMap(position) {
    // store the coordonates
    let { latitude } = position.coords;
    let { longitude } = position.coords;

    // store map in map
    this.#map = L.map('map').setView([latitude, longitude], 13);
    // display map
    // https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png pour un autre style
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // marker crée
    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('My location')
      .openPopup();

    // handling clicks on map

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // these functions are called helper functions, good idea to always create them.
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form

    const type = inputType.value;
    // the + sign transforms to number
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check if data is valid

    // If workout running, create running object

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers !');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout cycling, create cyclin object

    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs have to be positive numbers !');
      }

      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }
    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    this.renderWorkoutMarker(workout);
    // render workout on list

    //  hide form + clear input field

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
