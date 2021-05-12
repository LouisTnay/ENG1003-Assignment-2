"use strict"

/**
 * File Name: shared.js
 * Description: This JavaScript file is meant to be read by all HTML files. 
 *              User, Booking, Taxi and Trip classes are defined here.
 *              Public localStorage keys are defined here.
*/

// Keys for localStorage
const DELETION_KEY = "deletion";
const NEW_BOOKING_KEY = "newBooking";
const DETAILED_INFO_KEY = "detailedInfo";
const USER_DATA_KEY = "userData" // stores the user class instance

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


    // mutators
    set start(locationObj) {
        if (this._isValidLocationObject(locationObj)) {
            this._start = Object.assign({}, locationObj);
        }
    }

    set end(locationObj) {
        if (this._isValidLocationObject(locationObj)) {
            this._end = Object.assign({}, locationObj);
        }
    }


    // public methods
    addIntermediate(locationObj) {
        if (this._isValidLocationObject(locationObj)) {
            this._intermediate.push(Object.assign({}, locationObj));
        }
        return this;
    }

    deleteIntermediate(deletePosition) {
        this._intermediate.splice(deletePosition - 1, 1);
        return this;
    }

    editIntermediate(locationObj, editPosition) {
        if (this._isValidLocationObject(locationObj) && editPosition <= this._intermediate.length) {
            Object.assign(this._intermediate[editPosition - 1], locationObj);
            console.log("Im here")
        }
        return this;
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
        const LOCATION_COUNT = this.numOfStops();

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

        all.concat(this._intermediate);

        if (this._end !== null) {
            all.push(this._end);
        }

        return all;
    }
}


class Taxi {
    constructor(name) {
        this._name = name;
        this._flagRate = 3;
        this._fareRate = 10 * 1000 / 115;
        this._advancedPrice = 2;
        this._nightLevyRate = 1.5;
        this._rego = 0;

        if (this._name == "Sedan") {
            this._logoSrc = "../img/Sedan.svg";
            this._levy = 0;
        }

        if (this._name == "SUV") {
            this._logoSrc = "../img/SUV.svg";
            this._levy = 5;
        }

        if (this._name == "Van") {
            this._logoSrc = "../img/Van.svg";
            this._levy = 10;
        }

        if (this._name == "Minibus") {
            this._logoSrc = "../img/Minibus.svg";
            this._levy = 15;
        }
    }

    // accessors
    get name() {
        return this._name;
    }

    get logoSrc() {
        return this._logoSrc;
    }

    get levy() {
        return this._levy;
    }

    get fareRate() {
        return this._fareRate;
    }

    get flagRate() {
        return this._flagRate;
    }

    get advancedPrice() {
        return this._advancedPrice;
    }

    get nightLevyRate() {
        return this._nightLevyRate;
    }

    /**
    * Method Name: fromData
    * @desc Restoring the data state of the object retrieved from local storage for a single User instance.
    * @param {Taxi} data The parsed object retrieved from local storage.
    */
    fromData(data) {
        this._name = data._name;
        this._logoSrc = data._logoSrc;
        this._levy = data._levy;
        this._fareRate = data._fareRate;
        this._flagRate = data._flagRate;
        this._advancedPrice = data._advancedPrice;
        this._nightLevyRate = data._nightLevyRate;//rego add-louis*****************************************************
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
            this._trip = new Trip
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
        if(name === "") {
            let taxi = this._taxi;
        }
        else {
            let taxi = new Taxi(name);
        }

        // base charge
        let fare = taxi.flagRate + taxi.levy;
        fare += this._trip.getDistance() * taxi.fareRate;

        // advanced booking charge
        if (this._isAdvanced) {
            fare += taxi.advancedPrice;
        }

        // night levy surcharge
        if (this._time.getHours >= 0 && this._time.getHours <= 6) {
            fare *= taxi.nightLevyRate;
        }

        return fare;
    }

    fixBookingTime() {
        this._bookingTime = new Date();
        if (this._isAdvanced) {
            this._time = this._bookingTime;
        }
        return this;
    }

    fromData(dataObject) {
        this._name = dataObject._name;
        this._isAdvanced = dataObject._isAdvanced;
        this._trip = new Trip().fromData(dataObject._trip);
        this._time = new Date(dataObject._time);
        this._bookingTime = new Date(dataObject._bookingTime);
        this._taxi = new Taxi().fromData(dataObject._taxi);
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
    addBooking(newBooking) {
        this._bookings.push(
            new Booking().fromData(JSON.parse(JSON.stringify(newBooking)))
        );
        return this;
    }

    deleteBooking(bookingIndex) {
        this._bookings.splice(bookingIndex, 1);
        return this;
    }

    //create an editBooking class

    /**
    * Method Name: fromData
    * @desc Restoring the data state of the object retrieved from local storage for a single User instance.
    * @param {Booking} data The parsed object retrieved from local storage.
    */
    fromData(data) {
        this._bookings = [];
        for (let i = 0; i < data._bookings.length; i++) {
            this._bookings.push([]); // check later -louis*************************************************************
            this._bookings[i]
            this._bookings[i].fromData(data._bookings[i]);
        }
        return this;
    }
}
