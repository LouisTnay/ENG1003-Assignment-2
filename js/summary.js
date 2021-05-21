"use strict"

/** 
 * File Name: summary.js
 * Desciption: This javascript file is meant to be readby the summary.html.
 *             It displays the the booking information on the top of the page and the route on the bootom of the page.
 *             It provides the button functionality (next page and make booking).
 */

/**
 * This function is repsonsible for adding a marker and popup of the specified location to the map. The required
 * coordinates, name and address data to create them is retrieved from the passed location object. The color of
 * the new marker can be specified by entering the hexadecimal color code. Otherwise, the default orange color
 * (which corresponds to an intermediate location) is used.
 * 
 * @param {object} locationObject   object containing the data of the location to display the map labels of
 * @param {string} label   label to display the object containing the data of the location
 * @param {string} markerColor   hexadecimal color code of the marker choosen 
 */

function displayMapLabels(locationObject, label = "", markerColor = "#FF8C00") {
    const { coordinates: COORDINATES, name: NAME, address: ADDRESS } = locationObject;

    let marker = new mapboxgl.Marker({
        color: markerColor,
    })
        .setLngLat(COORDINATES)
        .addTo(map)

    let popup = new mapboxgl.Popup({ offset: 45 })
        .setHTML(`
                <h6>${label}: ${NAME}</h6>
                <p>${ADDRESS}</p>`
        );

    marker.setPopup(popup)
    marker.addTo(map);
    popup.addTo(map);
}



/**
 * This function is responsible for creating HTML for scrolling list of intermidiate stops if the data stored in the key is valid.
 * Then, the bookings data will be assigned to each data column of the table and using for loop to display the data on the table.
 * 
 * @returns {void}
 */
function displayTable() {
    let tableColsRef = tableRef.getElementsByTagName("td");
    let intermediateHtml = "";
    const DISPLAY_TIME = newBooking.isAdvanced ? newBooking.time : new Date();
    const INTERMEDIATE = bookingTrip.intermediate;

    // create HTML for scrolling list of intermediate stops
    if (INTERMEDIATE.length === 0) {
        intermediateHtml = `<span style="color:grey">(None)</span>`
    }
    else {
        intermediateHtml = `
        <div id="intermediate">
            ${INTERMEDIATE.reduce((finalHtml, { name }, index) => {
            finalHtml += `<p>${index + 1}: ${name}</p>`;
            return finalHtml;
        }, "")}
        </div>`;
    }

    // array of HTML in each data column
    const SUMMARY_DATA_HTML = [
        // first row
        `${bookingTrip.start.name}`,
        DISPLAY_TIME.toDateString(),

        // second row
        `${bookingTrip.end.name}`,
        DISPLAY_TIME.toTimeString().substring(0, 5),

        // third row
        `${bookingTaxi.name}`,
        `RM ${newBooking.getFare().toFixed(2)}`,

        // fourth row
        intermediateHtml,
        `${bookingTrip.getDistance().toFixed(2)} km`
    ];

    // display data in table
    for (let i in SUMMARY_DATA_HTML) {
        // display in odd index of columns
        tableColsRef[2 * i + 1].innerHTML = SUMMARY_DATA_HTML[i];
    }
}



/**
 * This function is responsible for creating the drop down list containing the available taxi types on the page,
 * with the input values containing chosen type and the index of the corresponding first available taxi. The
 * originally selected taxi type is shown as the default option.
 * 
 * @returns {void}
 */
function displayTaxiList() {
    const OTHER_TAXIS = getOtherAvailableTaxis();
    let defaultOption = document.createElement("option");

    // original taxi type
    defaultOption.value = "-1,original";
    defaultOption.text = bookingTaxi.name;
    taxiDropdownListRef.add(defaultOption);

    // other taxi choices
    for (let { type, taxiIndex } of OTHER_TAXIS) {
        let option = document.createElement("option");
        option.value = `${taxiIndex},${type}`;
        option.text = `${type}`;

        taxiDropdownListRef.add(option)
    }
}




/**
 * This function is responsible for assigning an available taxi to the new bookings.
 *  It starts by using for loops to loop through the taxi list to find the taxi index. 
 * If it sucessfully find the available taxi of the given index, then it will be assigned to a new booking.
 * Then the local storage data is updated and it will return true.
 *  If it unsucessfully find the available taxi index,  it will return false.
 * 
 * @returns {void}
 */
function assignTaxi() {
    const NEW_TAXI_TYPE = newBooking.taxi.name;

    for (let taxiIndex in taxiList) {
        if (taxiList[taxiIndex].type === NEW_TAXI_TYPE && taxiList[taxiIndex].available) {
            // successfully found taxi
            taxiList[taxiIndex].available = false;
            newBooking.taxi.rego = taxiList[taxiIndex].rego;
            newBooking.taxi.index = Number(taxiIndex);
            localStorageUpdate(TAXI_LIST_KEY, taxiList);
            return true;
        }
    }

    // failed to find taxi
    return false;
}



/**
 * This function is responsible for creating a new booking. Upon confirmation, the function will show a confirmation prompt to user.
 * If the user rejects the confirmation, the functionwill showanother prompt to the user whether he want to leave the current page.
 * The user will return to the main page and the booking data will be deleted if he confirm the confirmation prompt, 
 * else the user will remain on the current page.
 * Otherwise, the function will create a new booking and then the local storage is updated. 
 * Then, the user will be redirect to next page which is detailed information page.
 * 
 * @returns {void}
 */
function addNewBooking() {
    if (window.confirm("Confirm to making this booking? ") === true) {
        // assign taxi
        if (assignTaxi() === false) {
            window.alert("The chosen taxi type is unavailable currently.");
            return;
        }

        // add new booking
        let bookingIndex = appUser.addBooking(newBooking);

        // update local storage
        localStorageUpdate(USER_DATA_KEY, appUser);
        localStorageUpdate(DETAILED_INFO_KEY, bookingIndex);
        localStorage.removeItem(NEW_BOOKING_KEY);

        // redicrect
        window.location = "detailed.html"
    }
    else {
        if (window.confirm("The data will be deleted if you quit this page. Are you sure you want to quit this page? ") == true) {
            localStorage.clearItem(NEW_BOOKING_KEY);
            window.location = "main.html"
        }
        else {
            return;
        }
    }
}



/* Global Code on Load*/
// Used Tokens
mapboxgl.accessToken = "pk.eyJ1IjoiamxpbTAxNTkiLCJhIjoiY2tud3E1NDF0MGR1cDJvcGJuanh4NGJqZiJ9.cz5fuPVq9Cz3GJ-oJwWFgw";

// Global Variables
let bookingTrip = newBooking.trip;
let bookingTaxi = newBooking.taxi;
let saveData = null;

// HTML Elements
let tableRef = document.getElementById("summaryTable");
let makeBookingButton = document.querySelector("#continueButtonDiv button");
let previousButton = document.getElementById("previousButton");


// Restore taxiList
if (localStorageCheck(TAXI_LIST_KEY)) {
    taxiList = localStorageGet(TAXI_LIST_KEY);
}


// Page Initialization
let map = new mapboxgl.Map({
    container: 'map',
    center: bookingTrip.getCenter(),
    zoom: 8,
    style: 'mapbox://styles/mapbox/dark-v10'
});

map.on("load", () => {
    // add markers and popups to map
    const START = bookingTrip.start;
    const END = bookingTrip.end;
    const INTERMEDIATE = bookingTrip.intermediate;

    displayMapLabels(START, "Start", "#98FB98");
    displayMapLabels(END, "End", "#FF6347");
    INTERMEDIATE.forEach((current, index) => {
        displayMapLabels(current, String(index + 1));
    });

    // show path
    map.addLayer({
        id: 'path',
        type: 'line',
        source: bookingTrip.getPathGeojson(),
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': 'rgba(175, 238, 238, 0.5)',
            'line-width': 6
        }
    });


    // zoom to appropriate level to see markers
    let bounds = new mapboxgl.LngLatBounds();
    bookingTrip.allCoordinates.forEach((current) => {
        bounds.extend(current);
    });
    map.fitBounds(bounds, { padding: 50 });
});

displayTable();


// Event Listeners
makeBookingButton.addEventListener("click", addNewBooking);
previousButton.addEventListener("click", () => {
    window.location = "taxi.html";
})