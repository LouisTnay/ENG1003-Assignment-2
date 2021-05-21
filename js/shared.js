"use strict"

/**
 * File Name: shared.js
 * Description: This JavaScript file is meant to be read by all HTML files and loaded before the corresponding
 *              JavaScript files for each page. 
 *              User, Booking, Taxi and Trip classes are defined here.
 *              Public localStorage keys are defined here.
*/

// Keys for localStorage
const DELETION_KEY = "deletion";
const NEW_BOOKING_KEY = "newBooking";
const DETAILED_INFO_KEY = "detailedInfo";
const USER_DATA_KEY = "userData"; // stores the user class instance
const TAXI_LIST_KEY = "taxiList";

class Trip {
    // constructor
    constructor() {
        this._start = null;
        this._end = null;
        this._intermediate = [];
    }


    // accessors
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
    get intermediate() {
        return this._intermediate;
    }
    get allCoordinates() {
        const LOCATIONS = this._allLocations();
        return LOCATIONS.reduce(
            (finalArr, currentObj) => {
                finalArr.push(currentObj.coordinates);
                return finalArr;
            }, []);
    }


    // public methods
    getEndPoint(index) {
        if (index === 0) {
            return this._start;
        }
        if (index === 1) {
            return this._end;
        }
        return null;
    }

    setEndPoint(locationObject, index) {
        if (this._isValidLocationObject(locationObject)) {
            if (index === 0) {
                this._start = locationObject;
                return this;
            }
            if (index === 1) {
                this._end = locationObject;
                return this;
            }
        }
        return null;
    }

    addIntermediate(locationObj) {
        if (this._isValidLocationObject(locationObj)) {
            this._intermediate.push(Object.assign({}, locationObj));
            return this;
        }
        return null;
    }

    deleteIntermediate(deleteIndex) {
        if (deleteIndex > this._intermediate.length - 1) {
            return null;
        }
        this._intermediate.splice(deleteIndex, 1);
        return this;
    }

    editIntermediate(locationObj, editIndex) {
        if (this._isValidLocationObject(locationObj) && editIndex < this._intermediate.length) {
            Object.assign(this._intermediate[editIndex], locationObj);
            return this;
        }
        return null;
    }

    getNumOfStops() {
        let count = this._intermediate.length;
        if (this._start !== null) {
            count++;
        }
        if (this._end !== null) {
            count++;
        }

        return count;
    }

    getDistance() {
        let distance = 0;
        const LOCATIONS = this._allLocations();
        const LOCATION_COUNT = this.getNumOfStops();

        for (let i = 1; i < LOCATION_COUNT; i++) {
            distance += this._distance(LOCATIONS[i - 1], LOCATIONS[i]);
        }

        return distance;
    }

    getCenter() {
        const LOCATIONS = this._allLocations();

        let center = LOCATIONS.reduce(
            (accumulator, current) => {
                accumulator[0] += current.coordinates[0];
                accumulator[1] += current.coordinates[1];
                return accumulator;
            }, [0, 0]);

        center[0] /= LOCATIONS.length;
        center[1] /= LOCATIONS.length;
        return center;
    }

    getPathGeojson() {
        // create geojson object for the path
        const pathGeojson = {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: this.allCoordinates
                }
            }
        };

        return pathGeojson;
    }

    fromData(dataObj) {
        for (let attribute in dataObj) {
            this[attribute] = dataObj[attribute];
        }
        return this;
    }


    // private methods
    _isValidLocationObject({ name, coordinates, address }) {
        // check properties
        if (name === undefined || coordinates === undefined || address === undefined) {
            return false;
        }

        // check property values
        if (name === "" || address === "") {
            return false;
        }

        if (!Array.isArray(coordinates)) {
            return false;
        }
        if (typeof (coordinates[0]) !== "number" || coordinates[0] > 180 || coordinates[0] < -180) {
            return false;
        }
        if (typeof (coordinates[1]) !== "number" || coordinates[1] > 90 || coordinates[1] < -90) {
            return false;
        }

        return true;
    }

    _distance({ coordinates: [lng1, lat1] }, { coordinates: [lng2, lat2] }) {
        // constants
        const R = 6371;
        const DEG_TO_RAD = Math.PI / 180

        // coordinates data
        const PHI_1 = lat1 * DEG_TO_RAD;
        const PHI_2 = lat2 * DEG_TO_RAD;
        const DELTA_PHI = PHI_2 - PHI_1;
        const DELTA_LAMBDA = (lng2 - lng1) * DEG_TO_RAD;

        // intermediate values
        const a = (Math.sin(DELTA_PHI / 2)) ** 2 + Math.cos(PHI_1) * Math.cos(PHI_2) * (Math.sin(DELTA_LAMBDA / 2)) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    _allLocations() {
        let all = [];

        if (this._start !== null) {
            all.push(this._start);
        }

        all = all.concat(this._intermediate);

        if (this._end !== null) {
            all.push(this._end);
        }

        return all;
    }
}


class Taxi {
    constructor(name) {
        this._name = name;
        this._index = null;
        this._rego = "";
    }

    // accessors
    get name() {
        return this._name;
    }

    get index() {
        return this._index;
    }

    get rego() {
        return this._rego;
    }

    get logoSrc() {
        return `../img/${this._name}.svg`;
    }

    get levy() {
        const LEVY = [
            { name: "Car", value: 0 },
            { name: "SUV", value: 5 },
            { name: "Van", value: 10 },
            { name: "Minibus", value: 15 },
        ];

        return LEVY.find(({ name }) => {
            return (name === this._name);
        })
            .value;
    }

    get fareRate() {
        const FARE_RATE = 0.1 * 1000 / 115;
        return FARE_RATE;
    }

    get flagRate() {
        const FLAG_RATE = 3;
        return FLAG_RATE;
    }

    get advancedPrice() {
        const ADVANCED_PRICE = 2;
        return ADVANCED_PRICE;
    }

    get nightLevyRate() {
        const NIGHT_LEVY_RATE = 1.5;
        return NIGHT_LEVY_RATE;
    }

    // mutators
    set index(index) {
        if (typeof (index) === "number") {
            this._index = index;
        }
        return this;
    }

    set rego(rego) {
        if (typeof (rego) === "string") {
            this._rego = rego;
        }
    }

    /**
    * Method Name: fromData
    * @desc Restoring the data state of the object retrieved from local storage for a single User instance.
    * @param {Taxi} data The parsed object retrieved from local storage.
    */
    fromData(data) {
        for (let attribute in data) {
            this[attribute] = data[attribute];
        }
        return this;
    }
}


class Booking {
    // constructor
    constructor(name) {
        this._name = name;
        this._trip = new Trip();
        this._bookingTime = null;
        this._time = null;
        this._taxi = null;
        this._isAdvanced = false;
    }

    // accessors
    get name() {
        return this._name;
    }
    get trip() {
        return this._trip;
    }
    get time() {
        return this._time;
    }
    get taxi() {
        return this._taxi;
    }
    get bookingTime() {
        return this._bookingTime;
    }
    get isAdvanced() {
        return this._isAdvanced;
    }


    // mutators
    set time(time) {
        if (time instanceof Date) {
            this._time = new Date(time.valueOf());
        }
    }
    set bookingTime(bookingTime) {
        if (bookingTime instanceof Date) {
            this._bookingTime = new Date(bookingTime.valueOf());
        }
    }
    set taxi(taxi) {
        if (taxi instanceof Taxi) {
            this._taxi = new Taxi()
                .fromData(JSON.parse(JSON.stringify(taxi)));
        }
    }
    set trip(trip) {
        if (trip instanceof Trip) {
            this._trip = new Trip()
                .fromData(JSON.parse(JSON.stringify(trip)));
        }
    }
    set isAdvanced(state) {
        if (typeof (state) === 'boolean') {
            this._isAdvanced = state;
        }
    }

    // methods
    getFare(name = "") {
        // specify taxi type to calculate fare of
        let taxi;
        if (name === "") {
            taxi = this._taxi;
            if (taxi === null) {
                return null;        // ERROR: no taxi assigned
            }
        }
        else {
            taxi = new Taxi(name);
        }

        // base charge
        let fare = taxi.flagRate + taxi.levy;
        fare += this._trip.getDistance() * taxi.fareRate;

        // advanced booking charge
        if (this._isAdvanced) {
            fare += taxi.advancedPrice;
        }

        // night levy surcharge
        let calculationTime = this._isAdvanced ? this._time : new Date();
        if (calculationTime === null) {
            return null;            // ERROR: no time assigned      
        }
        if (calculationTime.getHours() >= 0 && calculationTime.getHours() <= 6) {
            fare *= taxi.nightLevyRate;
        }

        return fare;
    }

    fixBookingTime() {
        this._bookingTime = new Date();
        if (!this._isAdvanced) {
            this._time = this._bookingTime;
        }
        return this;
    }

    fromData(dataObject) {
        let { _name, _isAdvanced, _trip, _taxi, _time, _bookingTime } = dataObject;

        this._name = _name;
        this._isAdvanced = _isAdvanced;
        if (_trip !== null) {
            this._trip = new Trip().fromData(dataObject._trip);
        }
        if (_taxi !== null) {
            this._taxi = new Taxi().fromData(dataObject._taxi);
        }
        if (_time !== null) {
            this._time = new Date(dataObject._time);
        }
        if (_bookingTime !== null) {
            this._bookingTime = new Date(dataObject._bookingTime);
        }

        return this;
    }
}


class User {
    // constructor
    constructor() {
        this._bookings = [];
    }

    // accessors
    get bookings() {
        return this._bookings;
    }

    // methods
    /**
    * Method Name: addBooking
    * @desc Adds a booking to the User class instance in chronological order (it assumes that the bookings in the user class instance is already in chronological order)
    * @param {Booking} newBooking A new Booking class instance
    */
    addBooking(newBooking) {
        const DATA = JSON.parse(JSON.stringify(newBooking));
        let bookingCopy = new Booking().fromData(DATA).fixBookingTime();

        // add booking from latest to earliest
        for (let i in this._bookings) {
            if (bookingCopy.bookingTime >= this._bookings[i].bookingTime) {
                this._bookings.splice(i, 0, bookingCopy);
                return i;
            }
        }
        this._bookings.push(bookingCopy);
        return (this._bookings.length - 1);
    }

    deleteBooking(bookingIndex) {
        this._bookings.splice(bookingIndex, 1);
        return this;
    }

    /**
    * Method Name: fromData
    * @desc Restoring the data state of the object retrieved from local storage for a single User instance.
    * @param {Booking} data The parsed object retrieved from local storage.
    */
    fromData(data) {
        for (let i = 0; i < data._bookings.length; i++) {
            this._bookings.push(new Booking().fromData(data._bookings[i]));
        }
        return this;
    }
}


/**
 * Function Name: localStorageCheck
 * @desc check if there is data associated with the given key in localStorage
 * @param {string} key the key for localStorage
 * @return {boolean} true if there is data, false otherwise
 */
function localStorageCheck(key) {
    if (typeof (Storage) === undefined) {
        console.warn("Local storage is undefined.");
        return false;
    }

    if (localStorage.getItem(key) == null) {
        return false;
    }
    else {
        return true;
    }
}


/**
 * Function Name: localStorageUpdate
 * @desc converts data to string then saves the given data in localStorage with the given key
 * @param {string} key the key for localStorage
 * @param data the data to be stored in localStorage
 */
function localStorageUpdate(key, data) {
    if (typeof (Storage) === undefined) {
        window.alert("Sorry. The page is unable to save data because local storage is unavailable.")
        throw new Error("Local storage is unavailable. Page is unable to save data!");
        // error not caught to terminate program
    }

    let dataString = JSON.stringify(data);
    localStorage.setItem(key, dataString);
}


/**
 * Function Name: localStorageGet
 * @desc retrieves the data associated with the given key from localStorage
 * @param {string} key the key for localStorage
 * @return {any} the originally stored data (primitive data types) or object containing the data of the
 *               originally stored composite data type
 */
function localStorageGet(key) {
    if (typeof (Storage) === undefined) {
        window.alert("Sorry. The page is unable to load properly because local storage is unavailable.")
        throw new Error("Local storage is unavailable. Page is unable to load!");
        // error not caught to terminate program
    }

    let data = localStorage.getItem(key);
    try {
        data = JSON.parse(data);
    }
    catch (error) {
        console.warn(error);
    }

    return data;
}

/**
 * Function Name: navigateToPage
 * @param {string} pageSource 
 * @returns {void}
 */
function navigateToPage(pageSource) {
    // save newBooking data if required
    if (saveData !== undefined) {
        // ask to save data
        if (window.confirm("Save entered data for new booking?")) {
            if (saveData !== null) { // saveData is null for pages with no input to save
                saveData();
            }
        }
        else {
            // confirm clearing all newBooking data
            if (!window.confirm("Confirm to leave page without saving?")) {
                return;
            }
            localStorage.removeItem(NEW_BOOKING_KEY);
        }
    }

    window.location = pageSource;
}


/* Global Code on Load*/
let appUser = new User();
let newBooking;

if (localStorageCheck(USER_DATA_KEY)) {
    appUser.fromData(localStorageGet(USER_DATA_KEY));
}

if (localStorageCheck(NEW_BOOKING_KEY)) {
    newBooking = new Booking().fromData(localStorageGet(NEW_BOOKING_KEY));
}
else {
    newBooking = new Booking(`Booking ${appUser.bookings.length + 1}`);
}