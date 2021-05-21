"use strict"

/**
 * File Name: bookings.js
 * Description: This JavaScript file is meant to be read by index.html.
 *              It shows the map and provides the various functionality on the page, including displaying user
 *              input data, enabling the use of navigation buttons (continue), validating input data, and storing
 *              the input data. 
 * 
 *              The input data for this page includes the time, date, start location and end location of the
 *              booking.
*/


/**
 * This function is responsible for displaying the name, address and marker of a location of the specfied
 * index (start: 0, end: 1) using the provided data in the object.
 * 
 * It starts by checking for invalid inputs for locationObject:
 * 1. If no data was passed (null), the function immediately exits. 
 * 2. If the location given is invalid (null coordinates), an error message is shown and the function exits.
 *    Furthermore, if a corresponding marker for the index exists, it will be restored to its previous location.
 * 
 * If the specified index doesn't have a marker, a new marker for the location is added to the map together with
 * a popup to label it as start or end. Otherwise, the marker on the page is updated with the provided
 * coordinates (redundant for dragged marker). Then, newTrip is updated with the new location data, and the the
 * new location name and address will be displayed on the page using its corresponding output references. Finally,
 * if the global variable panToCoor is set to true, the map will pan the map to the newly entered coordinates,
 * and reset the boolean to false.
 * 
 * @param {object} locationObject Object contaning the data of the new location to display
 * @param {number} index Index of the endpoint location to set
 * @returns {void}
 */

function displayLocationInfo(locationObject, index) {
    // unentered location
    if (locationObject === null) {
        return;
    }

    // invalid location
    if (locationObject.coordinates === null) {
        // restore marker to previous location if needed
        if (markers[index] !== null) {
            markers[index].setLngLat(newTrip.getEndPoint(index).coordinates);
        }

        // display error message
        window.alert("Invalid location input!");
        return;
    }

    // add new marker or change existing marker
    if (markers[index] === null) {
        const MARKER_COLORS = ["#98FB98", "#FF6347"];

        let popup = new mapboxgl.Popup({
            offset: {
                'bottom': [0, -45],
                'top': [0, 10]
            }
        })
            .setHTML(`<h6>${(index === 0) ? "Start" : "End"}</h6>`);

        markers[index] = new mapboxgl.Marker(
            {
                color: MARKER_COLORS[index],
                draggable: true
            })
            .setLngLat(locationObject.coordinates)
            .setPopup(popup)
            .addTo(map)
            .on("dragend", () => {
                addNewCoordinates([markers[index].getLngLat().lng, markers[index].getLngLat().lat]);
                markerDragFlag = false;
            });

        markers[index].getElement().addEventListener("touchstart", () => {
            markerDragFlag = true;
        })

        popup.addTo(map);
    }
    else {
        markers[index].setLngLat(locationObject.coordinates);
    }

    // update newTrip with new location
    newTrip.setEndPoint(locationObject, index);

    // update displayed name and address
    nameOutputRefs[index].innerText = locationObject.name;
    addressOutputRefs[index].innerText = locationObject.address;

    // pan to the newly entered coordinates if needed
    if (panToCoor) {
        map.panTo(locationObject.coordinates);
        panToCoor = false;
    }
}


/**
 * This function is used as the jsonp callback when calling the OpenCage Geocoder API. It is responsible for
 * initiating the corresponding code used to update the page depending on the provided data from the API.
 * 
 * This is achieved by generating and passing an object containing the data to display (name, address, coordinates)
 * to the displayLocationInfo function. To be precise, if no results were returned or the coordinates isn't in
 * Malaysia, the coordinates property of the passed object is set to null. Otherwise, the passed object will
 * contain the name, address and coordinates to display. Note that the specified index to display (whichEndIndex)
 * is determined by the radio input on the page.
 * 
 * @param {Object} data: Object passed by the OpenCage Geocoder API to the JSONP callback 
 * @returns {void}
 */
function updatePageWithData(data) {
    let newLocationObject = {};

    if (data.results.length === 0) {
        newLocationObject.coordinates = null;
    }
    else {
        let formattedString = data.results[0].formatted;
        let splitIndex = formattedString.indexOf(",");
        newLocationObject.name = formattedString.slice(0, splitIndex);
        newLocationObject.address = formattedString.slice(splitIndex + 1);
        newLocationObject.coordinates = [data.results[0].geometry.lng, data.results[0].geometry.lat];
    }

    displayLocationInfo(newLocationObject, whichEndIndex);
}


/**
 * This function is responsible for sending a web servide request to the OpenCage Geocoder API to apply reverse
 * geocoding to the provided coordinates and initiating the code to update the page with the provided data.
 * This is achieved by using the webServiceRequest function with the URL of the web service together with an
 * object containing the key-value pairs to be used in the query string, which includes the passed coordinates
 * and a JSONP callback to the updatePageWithData function. 
 * 
 * @param {number[]} coordinates: Array containing the coordinates (lng,lat)
 * @returns {null}
 */
function addNewCoordinates(coordinates) {
    const URL = "https://api.opencagedata.com/geocode/v1/json";
    const QUERY_OBJECT = {
        "q": `${coordinates[1]}+${coordinates[0]}`,
        "jsonp": "updatePageWithData",
        "key": openCageToken,
        "no_annotations": 1,
        "limit": 1,
        "countrycode": "MY"
    };
    webServiceRequest(URL, QUERY_OBJECT);
}


/**
 * This function is responsible for saving all data input on the page (date, time, trip start & end) into
 * newBooking, after which the data for newBooking in local storage is also updated.
 * 
 * @returns {void}
 */
function saveData() {
    if (timeChoiceIndex === 1) {
        newBooking.isAdvanced = true;
        newBooking.time = new Date(dateInputRef.value + " " + timeInputRef.value);
    }
    else {
        // newBooking.time is not overwritten to temporarily store the input to show when returning to the page
        // this won't be a problem as it will be overwritten as neccessary when the booking is placed
        newBooking.isAdvanced = false;
    }

    newBooking.trip = newTrip;
    localStorageUpdate(NEW_BOOKING_KEY, newBooking);
}


/**
 * This function is responsible for completing the neccessary input validation and data saving for this page
 * before redirecting the user to the next page (intermediate.html). If the time, start and end have not all been
 * input, an alert is shown to the user and the function exits. Otherwise, the saveData() is called, after which
 * the user is redirected to the next page.
 * 
 * @returns {void}
 */
function continueToNextPage() {
    // input validation
    if (timeChoiceIndex === 1) {
        if (dateInputRef.value === "" || timeInputRef.value === "") {
            window.alert("Please ensure the time is filled in completely.");
            return;
        }

        if (new Date(dateInputRef.value + " " + timeInputRef.value) <= new Date()) {
            window.alert("Please ensure the time specified is in the future.");
            return;
        }
    }
    if (newTrip.start === null || newTrip.end === null) {
        window.alert("Both the start and end locations must be chosen.");
        return;
    }

    saveData();
    window.location = "intermediate.html";
}


/**
 * This function is responsible for enabling or disabling the date and time inputs on the page depending on the
 * given index. Furthermore, the background color of the div containing the input elements will be changed to
 * reflect the input mode (disabled: grey, enabled: transparent). An index of 0 corresponds to disabling, while
 * an index of 1 means the opposite.
 * 
 * @param {number} index index of the input mode 
 * @returns 
 */
function setTimeInputMode(index) {
    if (index === 0) {
        timeInputDiv.style["background-color"] = "rgb(214,214,214)";
        dateInputRef.disabled = true;
        timeInputRef.disabled = true;
        return;
    }

    if (index === 1) {
        timeInputDiv.style["background-color"] = "transparent";
        dateInputRef.disabled = false;
        timeInputRef.disabled = false;
    }
}



/* Global Code on Load */
// used tokens
mapboxgl.accessToken = "pk.eyJ1IjoiamxpbTAxNTkiLCJhIjoiY2tud3E1NDF0MGR1cDJvcGJuanh4NGJqZiJ9.cz5fuPVq9Cz3GJ-oJwWFgw";
let openCageToken = "01de3ec0a3364b45bc19d278307c756a";

// global variables
let newTrip = newBooking.trip;
let markers = [null, null];
let currentCoordinates = null;
let timeChoiceIndex = newBooking.isAdvanced ? 1 : 0;
let whichEndIndex = 0;
let panToCoor = false;
let markerDragFlag = false;

// page input element references
let timeChoiceRef = document.getElementsByName("timeChoice");
let timeInputDiv = document.getElementById("time-input-indentation");
let dateInputRef = document.getElementById("dateInput");
let timeInputRef = document.getElementById("timeInput");
let whichEndRef = document.getElementsByName("whichEnd");
let currentLocationButton = document.getElementById("currentLocationButton");
let continueButton = document.querySelector("#continueButtonDiv button");

// page output element references
let subtitleRef = document.querySelector(".subtitle");
let nameOutputRefs = [document.getElementById("startName"), document.getElementById("endName")];
let addressOutputRefs = [document.getElementById("startAddress"), document.getElementById("endAddress")];


//--- Page Initialization ---
// display subtitle
if (appUser.bookings.length === 0) {
    subtitleRef.innerText = "Hello. Let's make our first booking.";
}
else {
    const GREETINGS = [
        "Yay", "Hey there handsome", "What's the craic", "Yipee", "Woohoo", "Namaste", "How you doin'",
        "Howdy-doody", "G'day", "Top o' the morning to ya laddies", "Sup", "Yo", "What's up buttercup",
        "What's cookin', good lookin'", "I'll get you, my pretty", "Generic greeting!", "Hi, honeybunch",
        "What's crackin'", "Selamat sejahtera" 
    ];
    subtitleRef.innerText = 
    `${GREETINGS[Math.floor(Math.random() * GREETINGS.length)]}! Let's make ${newBooking.name}.`;
}
    
// display the time and date input data if it exists
timeChoiceRef[timeChoiceIndex].checked = true;
setTimeInputMode(timeChoiceIndex);
if (newBooking.time !== null) {
    const TIME = newBooking.time;
    const YYYY = String(TIME.getFullYear());
    let MM = String(Number(TIME.getMonth()) + 1);
    let DD = String(TIME.getDate());

    if (DD.length !== 2) {
        DD = "0" + DD;
    }
    if (MM.length !== 2) {
        MM = "0" + MM;
    }
    dateInputRef.value = `${YYYY}-${MM}-${DD}`;
    timeInputRef.value = TIME.toTimeString().slice(0, 5);
}

// display map
let map = new mapboxgl.Map({
    container: 'map',
    zoom: 8,
    center: (() => {
        const START = newTrip.start;
        const END = newTrip.end;

        if (START === null && END === null) {
            const CAPITAL_CITY = [101.6942371, 3.1516964];
            return CAPITAL_CITY;
        }
        if (START !== null && END === null) {
            return START.coordinates;
        }
        if (END !== null && START === null) {
            return END.coordinates;
        }
        const CENTER = [(START.coordinates[0] + END.coordinates[0]) / 2, (START.coordinates[1] + END.coordinates[1]) / 2];
        return CENTER;
    })(),   // immediately invoke to get the coordinates to use
    style: 'mapbox://styles/mapbox/dark-v10'
});

// display the location info if it exists
map.on("load", () => {
    displayLocationInfo(newTrip.start, 0);
    displayLocationInfo(newTrip.end, 1);

    // zoom to appropriate level to see markers if they exist
    const START = newTrip.start;
    const END = newTrip.end;
    if (START !== null && END !== null) {
        let bounds = new mapboxgl.LngLatBounds();
        bounds.extend(START.coordinates);
        bounds.extend(END.coordinates);
        map.fitBounds(bounds, { padding: 150 });
    }
    else {
        // use 12 as default zoom level
        map.setZoom(12);
    }
});

// create current location marker
navigator.geolocation.getCurrentPosition(
    // success
    (pos) => {
        currentCoordinates = [pos.coords.longitude, pos.coords.latitude];
        currentLocationButton.disabled = false;

        // initialize current location point
        map.addSource('point', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': currentCoordinates
                    }
                }]
            }
        });

        map.addLayer({
            'id': 'point',
            'type': 'circle',
            'source': 'point',
            'paint': {
                'circle-color': '#4264fb',
                'circle-stroke-color': 'white',
                'circle-radius': 12,
                'circle-stroke-width': 4
            }
        });
    },

    // failure
    (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        window.alert("Unable to get current location! Enable location services and refresh to retry.");
    }
)


//--- Event Listeners ---
// set event listeners for the timeChoice radio
timeChoiceRef.forEach(((currentRef, index) => {
    currentRef.addEventListener("click", () => {
        setTimeInputMode(index);
        timeChoiceIndex = index;
    });
}));

// set event listeners for the whichEnd radio
whichEndRef.forEach((currentRef, index) => {
    currentRef.addEventListener("click", () => {
        whichEndIndex = index;
    });
});

// set event listener to add new location on tap
map.on('click', (e) => {
    addNewCoordinates([e.lngLat.lng, e.lngLat.lat]);
});

// set event listener for entering current location
currentLocationButton.addEventListener("click", () => {
    panToCoor = true;
    addNewCoordinates(currentCoordinates);
});

// set event listener for continue button
continueButton.addEventListener("click", continueToNextPage);

// constantly update current location coordinates
let watchHandler = navigator.geolocation.watchPosition(
    (pos) => {
        currentCoordinates = [pos.coords.longitude, pos.coords.latitude];

        // update current location marker
        map.getSource("point").setData({
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': currentCoordinates
                    }
                }
            ]
        });
    }
);

// change current location marker by dragging
map.on('touchstart', 'point', (e) => {
    // don't drag together with other location markers
    if(markerDragFlag) {
        return;
    } 

    // prevent map from panning
    e.preventDefault();

    // stop watchPosition from working once marker is adjusted
    navigator.geolocation.clearWatch(watchHandler);

    let draggingPoint = (e) => {   
        currentCoordinates = [e.lngLat.lng, e.lngLat.lat];
        map.getSource('point').setData({
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': currentCoordinates
                    }
                }
            ]
        });
    }

    map.on('touchmove', draggingPoint);

    map.once('touchend', () => {
        map.off("touchmove", draggingPoint);
    });
});