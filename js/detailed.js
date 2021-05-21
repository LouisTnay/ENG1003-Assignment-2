"use strict"

/**
 * File Name: detailed.js
 * Desciption: This javascript file is meant to be read by the detailed.html.
 *             It contains the function of displayBookingData() which displays the booking data in the table.
 *             It contains the function of displayMapLabels() which display the route on the map.
 *             It provides the button functionality (change taxi and delete booking).
 * 
 */

/**
 * This function is repsonsible for adding a marker and popup of the specified location to the map. The required
 * coordinates, name and address data to create them is retrieved from the passed location object. The color of
 * the new marker can be specified by entering the hexadecimal color code. Otherwise, the default orange color
 * (which corresponds to an intermediate location) is used.
 * 
 * @param {object} locationObject object containing the data of the location to display the map labels of
 * @param {string} [markerColor="#FF8C00"] hexadecimal color code of the marker to be created
 */
function displayMapLabels(locationObject, label = "", markerColor = "#FF8C00") {
    const { coordinates: COORDINATES, name: NAME, address: ADDRESS } = locationObject;

    let marker = new mapboxgl.Marker({
        color: markerColor,
    })
        .setLngLat(COORDINATES)
        .addTo(map)

    let popup = new mapboxgl.Popup({
        offset: {
            'bottom': [0, -45],
            'top': [0, 10]
        }
    })
        .setHTML(`
                <h6>${label}: ${NAME}</h6>
                <p>${ADDRESS}</p>`
        );

    marker.setPopup(popup)
    marker.addTo(map);
    popup.addTo(map);
}



function displayBookingData() {
    // header text
    bookingNameRef.innerText = booking.name;
    bookingDateRef.innerText = booking.bookingTime.toLocaleString();

    // specifications table
    const INTERMEDIATE = bookingTrip.intermediate;
    let intermediateHtml;
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

    const TABLE_DATA_HTML = [
        booking.time.toDateString(),
        booking.time.toTimeString().substring(0, 5),
        `${bookingTaxi.name} (${bookingTaxi.rego})`,
        `${bookingTrip.getDistance().toFixed(2)} km`,
        `RM ${booking.getFare().toFixed(2)}`,
        `${bookingTrip.start.name}`,
        `${bookingTrip.end.name}`,
        intermediateHtml
    ];

    let tableColsRef = tableRef.getElementsByTagName("td");
    for (let i in TABLE_DATA_HTML) {
        // assign odd index of columns (right columns)
        tableColsRef[2 * i + 1].innerHTML = TABLE_DATA_HTML[i];
    }
}


/**
 * This function loops through taxiList and retrieves the index of the first available taxi of each type
 * excluding the originally chosen taxi in bookingTaxi. It then returns an array of objects containing the type
 * and index of each found taxi. If a certain type of taxi is not available, it is excluded from the final array.
 * 
 * @returns {Object[]} array of objects containing the index and type of the available taxis of each type
 */
function getOtherAvailableTaxis() {
    let typesToFind = ["Car", "Van", "SUV", "Minibus"];
    let availableTaxis = [];
    let oldType = bookingTaxi.name;

    // remove current taxi from list of taxis to find
    for (let i in typesToFind) {
        if (typesToFind[i] === oldType) {
            typesToFind.splice(i, 1);
        }
    }

    for (let taxiIndex in taxiList) {
        let { "type": type, "available": available } = taxiList[taxiIndex];
        let indexInTypeList;

        // skip if unavailable
        if (!available) {
            continue;
        }

        // skip if already found
        indexInTypeList = typesToFind.indexOf(type);
        if (indexInTypeList === -1) {
            continue;
        }

        availableTaxis.push({
            type: type,
            taxiIndex: taxiIndex
        });
        typesToFind.splice(indexInTypeList, 1);
        if (typesToFind.length === 0) {
            break;
        }
    }

    return availableTaxis;
}



/**
 * This function is responsible for creating the drop down list containing the available taxi types on the page.
 * The originally selected taxi type is shown as the default option. If isChoosable is false, a special message
 * is displayed to show that the taxi cannot be changed.
 * 
 * @param {boolean} isChoosable Boolean used to determine whether options should be available for choosing
 * @returns {void}
 */
function displayTaxiList(isChoosable) {
    const OTHER_TAXIS = getOtherAvailableTaxis();
    let defaultOption = document.createElement("option");
    defaultOption.text = `${bookingTaxi.name}`;

    // only show defaultOption if not choosable
    if (!isChoosable) {
        taxiDropdownListRef.add(defaultOption);
        return;
    }

    // original taxi type
    defaultOption.value = "-1,original";
    defaultOption.text += "(current)";
    taxiDropdownListRef.add(defaultOption);

    // other taxi choices
    for (let { type, taxiIndex } of OTHER_TAXIS) {
        let option = document.createElement("option");
        option.value = `${taxiIndex},${type}`;
        option.text = `${type} (RM ${booking.getFare(type).toFixed(2)})`;

        taxiDropdownListRef.add(option)
    }
}



/**
 * This function is responsible for changing the taxi of the booking. It starts by confirming with the user about
 * the change. Upon confirmation, if the function detects that the chosen option in the dropdown list is the same
 * as the original type, it will alert the user that no changes were made and exit. Otherwise, the taxi of the
 * given index is assigned to the current booking and set unavailable. The index of the original taxi is also
 * used to reset its availability. Then local storage data for appUser is updated, and the page is reloaded.
 * 
 * @returns {void}
 */
function changeTaxi() {
    // confirmation
    if (!window.confirm("Confirm to change taxi?")) {
        return;
    }

    // no changes alert
    let [newTaxiIndex, newTaxiType] = taxiDropdownListRef.value.split(",");
    newTaxiIndex = Number(newTaxiIndex);
    if (newTaxiIndex === -1) {
        window.alert("No changes were made.");
        return;
    }

    // deallocate old taxi and assign new taxi
    let newTaxi = new Taxi(newTaxiType);
    newTaxi.rego = taxiList[newTaxiIndex].rego;
    newTaxi.index = newTaxiIndex;

    taxiList[bookingTaxi.index].available = true;
    taxiList[newTaxiIndex].available = false;
    appUser.bookings[bookingIndex].taxi = newTaxi;

    // update local storage
    localStorageUpdate(TAXI_LIST_KEY, taxiList);
    localStorageUpdate(USER_DATA_KEY, appUser);

    // refresh page
    window.location = "bookings.html";
}




/**
 * This function is responsible for intiating the steps for deleting the booking. Upon calling, the function will
 * first show a confirmation prompt to the user. Upon rejection, the function exits. Otherwise, the function will
 * permananetly delete the booking from appUser, and update local storage with the changed appUser. The name of
 * the booking is then stored in local storage, and the user is redirected to the main page. 
 * 
 * @returns {void}
 */
function deleteBooking() {
    // confirmation
    if (!window.confirm("Confirm to delete this booking?")) {
        return;
    }

    // deallocate taxi and delete booking
    taxiList[bookingTaxi.index].available = true;
    appUser.deleteBooking(bookingIndex);

    // update local storage
    localStorageUpdate(TAXI_LIST_KEY, taxiList);
    localStorageUpdate(USER_DATA_KEY, appUser);
    localStorageUpdate(DELETION_KEY, booking.name);
    window.location = "bookings.html";
}



/* Global Code on Load */
// used tokens
mapboxgl.accessToken = "pk.eyJ1IjoiamxpbTAxNTkiLCJhIjoiY2tud3E1NDF0MGR1cDJvcGJuanh4NGJqZiJ9.cz5fuPVq9Cz3GJ-oJwWFgw";

// global variables
let bookingIndex = null;
let booking = null;
let bookingTrip = null;
let bookingTaxi = null;

// page input element references
let changeTaxiButton = document.getElementById("changeTaxiButton");
let deleteButton = document.getElementById("deleteButton");

// page output element references
let taxiDropdownListRef = document.getElementById("taxiDropdownList");
let bookingNameRef = document.getElementById("bookingName");
let bookingDateRef = document.getElementById("bookingDate");
let tableRef = document.getElementById("specificationsTable");


/* Retrieve Data from Local Storage */
if (!localStorageCheck(DETAILED_INFO_KEY)) {
    window.alert("An error occured!");
    window.location = "index.html";
}
else {
    bookingIndex = localStorageGet(DETAILED_INFO_KEY);
    booking = appUser.bookings[bookingIndex];
    bookingTrip = booking.trip;
    bookingTaxi = booking.taxi;
}

if (localStorageCheck(TAXI_LIST_KEY)) {
    taxiList = localStorageGet(TAXI_LIST_KEY);
}


/* Page Initialization */
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
    map.fitBounds(bounds, { padding: 150 });
});

// display booking data on page
displayBookingData();

// initialize delete, change taxi button and dropdown list (time-dependent)
if (booking.time < new Date()) {
    deleteButton.innerText = "Past Booking";
    changeTaxiButton.innerText = "Unavailable";
    displayTaxiList(false);
}
else if (booking.time <= new Date().setHours(23, 59, 59, 999)) {
    deleteButton.innerText = "Planned for Today";
    changeTaxiButton.innerText = "Unavailable";
    displayTaxiList(false);
}
else {
    deleteButton.disabled = false;
    deleteButton.innerText = "Delete Booking"
    deleteButton.addEventListener("click", deleteBooking);

    changeTaxiButton.disabled = false;
    changeTaxiButton.innerText = "Change Taxi";
    changeTaxiButton.addEventListener("click", changeTaxi);

    displayTaxiList(true);
}

