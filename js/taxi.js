"use strict"

/**
 * File Name: taxi.js
 * Description: This JavaScript file is meant to be read by taxi.html
 *              Updates the taxis displayed in the table (only shows available taxis)
 *              Saves the chosen taxi to appData User instance when the continue button or the previous button is clicked
 *              A saved taxi (from newBooking) is displayed as a selected radio button
*/

let carRego = "";
let suvRego = "";
let vanRego = "";
let minibusRego = "";

let carFare = newBooking.getFare("Car");
let suvFare = newBooking.getFare("SUV");
let vanFare = newBooking.getFare("Van");
let minibusFare = newBooking.getFare("Minibus");

let carFlag = false;
let suvFlag = false;
let vanFlag = false;
let minibusFlag = false;
let continueFlag = false;

/**
    * Function Name: updateTaxiDisplay
    * @desc Updates the taxis displayed in the table to show only the available taxis
    */
function updateTaxiDisplay() {
    let carDisplay = document.getElementById("carDisplay");
    let suvDisplay = document.getElementById("suvDisplay");
    let vanDisplay = document.getElementById("vanDisplay");
    let minibusDisplay = document.getElementById("minibusDisplay");
    let carFareDisplay = document.getElementById("sedanFare");
    let suvFareDisplay = document.getElementById("suvFare");
    let vanFareDisplay = document.getElementById("vanFare");
    let minibusFareDisplay = document.getElementById("minibusFare");
    let distanceDisplay = document.getElementById("estimatedDistance");
    let carRadio = document.getElementById("carRadio");
    let suvRadio = document.getElementById("suvRadio");
    let vanRadio = document.getElementById("vanRadio");
    let minibusRadio = document.getElementById("minibusRadio");
    let taxiTableDiv = document.getElementById("taxiTableDiv");

    for (let i = 0; i < taxiList.length; i++) {
        if (taxiList[i].available == true) {
            if (taxiList[i].type == "Car") {
                carFlag = true;
            }
            else if (taxiList[i].type == "SUV") {
                suvFlag = true;
            }
            else if (taxiList[i].type == "Van") {
                vanFlag = true;
            }
            else if (taxiList[i].type == "Minibus") {
                minibusFlag = true;
            }
        }
    }

    carFareDisplay.innerHTML = `Fare: RM ${carFare.toFixed(2)}`;
    suvFareDisplay.innerHTML = `Fare: RM ${suvFare.toFixed(2)}`;
    vanFareDisplay.innerHTML = `Fare: RM ${vanFare.toFixed(2)}`;
    minibusFareDisplay.innerHTML = `Fare: RM ${minibusFare.toFixed(2)}`;

    if (carFlag == false) {
        carDisplay.innerHTML = ``;
    }

    if (suvFlag == false) {
        suvDisplay.innerHTML = ``;
    }

    if (vanFlag == false) {
        vanDisplay.innerHTML = ``;
    }

    if (minibusFlag == false) {
        minibusDisplay.innerHTML = ``;
    }

    if (carFlag == false && suvFlag == false && vanFlag == false && minibusFlag == false) {
        taxiTableDiv.innerHTML = `
            <h4>
                Sorry, no taxis available. Please try again later.
            </h4>
        `;
        continueButtonDiv.innerHTML = ``;
        return;
    }

    if (newBooking.taxi == null) {
        if (carFlag == true) {
            carRadio.checked = true;
        }
        else if (suvFlag == true) {
            suvRadio.checked = true;
        }
        else if (vanFlag == true) {
            vanRadio.checked = true;
        }
        else if (minibusFlag == true) {
            minibusRadio.checked = true;
        }
    }
    else {
        if (newBooking.taxi.name == "Car") {
            carRadio.checked = true;
        }
        else if (newBooking.taxi.name == "SUV") {
            suvRadio.checked = true;
        }
        else if (newBooking.taxi.name == "Van") {
            vanRadio.checked = true;
        }
        else if (newBooking.taxi.name == "Minibus") {
            minibusRadio.checked = true;
        }
    }

    let distance = newBooking.trip.getDistance();
    distanceDisplay.innerText = `Estimated Trip Distance: ${distance.toFixed(2)} km`;
}

/**
    * Function Name: saveData
    * @desc Confirms with the user if they want to save the selected taxi; then saves the selected taxi. Then redirects the user to the route summary page (summary.html).
    */
function saveData() {
    let carRadio = document.getElementById("carRadio");
    let suvRadio = document.getElementById("suvRadio");
    let vanRadio = document.getElementById("vanRadio");
    let minibusRadio = document.getElementById("minibusRadio");

    if (carFlag == true) {
        if (carRadio.checked == true) {
            newBooking.taxi = new Taxi("Car");
        }
    }
    if (suvFlag == true) {
        if (suvRadio.checked == true) {
            newBooking.taxi = new Taxi("SUV");
        }
    }
    if (vanFlag == true) {
        if (vanRadio.checked == true) {
            newBooking.taxi = new Taxi("Van");
        }
    }
    if (minibusFlag == true) {
        if (minibusRadio.checked == true) {
            newBooking.taxi = new Taxi("Minibus");
        }
    }
}

/**
    * Function Name: taxiContinue
    * @desc Confirms with the user if they want to save the selected taxi; then saves the selected taxi. Then redirects the user to the route summary page (summary.html).
    */
function taxiContinue() {
    let carRadio = document.getElementById("carRadio");
    let suvRadio = document.getElementById("suvRadio");
    let vanRadio = document.getElementById("vanRadio");
    let minibusRadio = document.getElementById("minibusRadio");

    if (carFlag == true) {
        if (carRadio.checked == true) {
            continueFlag = true;
        }
    }
    if (suvFlag == true) {
        if (suvRadio.checked == true) {
            continueFlag = true;
        }
    }
    if (vanFlag == true) {
        if (vanRadio.checked == true) {
            continueFlag = true;
        }
    }
    if (minibusFlag == true) {
        if (minibusRadio.checked == true) {
            continueFlag = true;
        }
    }

    if (continueFlag == true) {
        saveData();
        localStorageUpdate(NEW_BOOKING_KEY, newBooking);
        window.location.href = "summary.html";
    }
    else {
        alert("Please select a taxi type to continue.");
    }
}


/**
    * Function Name: taxiPreviousPage
    * @desc Saves the selected taxi. Then redirects the user to the route intermediate stops selection page (intermediate.html).
    */
function taxiPreviousPage() {
    saveData();
    window.location.href = "intermediate.html";
}

if (localStorageCheck(TAXI_LIST_KEY)) {
    taxiList = localStorageGet(TAXI_LIST_KEY);
}

updateTaxiDisplay();