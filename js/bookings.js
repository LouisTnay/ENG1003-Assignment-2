"use strict"

/**
 * File Name: bookings.js
 * Description: This JavaScript file is meant to be read by bookings.html .
 *              It updates the data on the bookings list depending on the page.
 *              It provides the button functionality (next page or previous page).
 *              Displays the current page at the centre of the bottom of the page.
 *              Implements the detailed bookings information link for each booking in the list.
*/

let bookingIndex1 = 0;
let bookingIndex2 = 0;
let bookingIndex3 = 0;
let pageNumber = 1;

/**
 * Function Name: infoIconClick
 * @desc Called when the info icon (in the bookings list page) is clicked.
 *       Redirects the user to the detailed booking information page (detailed.html).
 *       Updates the value in localStorage at the location associated with DETAILED_INFO_KEY with the selected booking.
 * @param {number} identifier The number to identify which info icon is clicked in the page.
 */
function infoIconClick(identifier) {
    if (identifier == 1) {
        localStorageUpdate(DETAILED_INFO_KEY, bookingIndex1);
        window.location.href = "detailed.html";

    }
    else if (identifier == 2) {
        localStorageUpdate(DETAILED_INFO_KEY, bookingIndex2);
        window.location.href = "detailed.html";
    }
    else if (identifier == 3) {
        localStorageUpdate(DETAILED_INFO_KEY, bookingIndex3);
        window.location.href = "detailed.html";
    }
}

/**
 * Function Name: getMaxPageNumber
 * @desc Calculates the maximum number of pages according to the number of bookings made.
 * @returns Maximum number of booking pages.
 */
function getMaxPageNumber() {
    let pages = Math.ceil(appUser.bookings.length/3);
    if (pages == 0) {
        pages = 1;
    }
    return pages;
}

/**
 * Function Name: checkDigits
 * @desc converts a 1 digit number to 2 digits by adding a zero to the left
 * @param {String} digits 
 */
 function checkDigits(digits) {
    if (digits < 10) {
      digits = "0" + digits;
    }
    return digits;
  }

/**
 * Function Name: updateBookingListPage
 * @desc Updates the details for each row in the list according to the page number.
 *       Updates the displayed page number at the bottom of the page.
 *       Removes the "Next" button when at the last page and removes the "Previous" button when at the first page
 * @param {number} pageNumber The number of the page to be displayed.
 */
function updateBookingsListPage(pageNumber) {
    let bookingNameDisplayText = "";
    let bookingDateDisplayText = "";
    let pickUpDisplayText = "";
    let distanceDisplayText = "";
    let destinationDisplayText = "";
    let fareDisplayText = "";
    let stopsDisplayText = "";
    let bookingsListTableHTML = "";

    let bookingsListPageNumber = document.getElementById("bookingsListPageNumber");
    let previousButtonDiv = document.getElementById("previousButtonDiv");
    let continueButtonDiv = document.getElementById("continueButtonDiv");
    let bookingsListTableDiv = document.getElementById("bookingsListTableDiv");

    let counter = 1;

    bookingsListPageNumber.innerText = `Page ${pageNumber} of ${getMaxPageNumber()}`;

    if (pageNumber == 1) {
        previousButtonDiv.innerHTML = ``;
    }
    else {
        previousButtonDiv.innerHTML = `
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="bookingsListPreviousButton()">
                Previous
            </button>
        `;
    }

    if (pageNumber == getMaxPageNumber()) {
        continueButtonDiv.innerHTML =  ``;
    }
    else {
        continueButtonDiv.innerHTML = `
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="bookingsListNextButton()">
                Next
            </button>
        `;
    }

    bookingIndex1 = pageNumber * 3 - 3;
    bookingIndex2 = pageNumber * 3 - 2;
    bookingIndex3 = pageNumber * 3 - 1;

    for (let i = 3; i > 0; i = i - 1) {
        if ((pageNumber * 3 - i) == appUser.bookings.length) {
            break;
        }
        
        bookingNameDisplayText = `${appUser.bookings[pageNumber * 3 - i].name}`;
        bookingDateDisplayText = `(${appUser.bookings[pageNumber * 3 - i].time.getDate()}.${checkDigits(appUser.bookings[pageNumber * 3 - i].time.getMonth() + 1)}.${checkDigits(appUser.bookings[pageNumber * 3 - i].time.getFullYear())}, ${checkDigits(appUser.bookings[pageNumber * 3 - i].time.getHours())}:${checkDigits(appUser.bookings[pageNumber * 3 - i].time.getMinutes())})`;
        pickUpDisplayText = appUser.bookings[pageNumber * 3 - i].trip.start.name;
        distanceDisplayText = `${appUser.bookings[pageNumber * 3 - i].trip.getDistance().toFixed(2)} km`;
        destinationDisplayText = appUser.bookings[pageNumber * 3 - i].trip.end.name;
        fareDisplayText = `RM ${appUser.bookings[pageNumber * 3 - i].getFare().toFixed(2)}`;
        stopsDisplayText = appUser.bookings[pageNumber * 3 - i].trip.intermediate.length;

        let time = new Date;
        let differentiation = "";
        if (appUser.bookings[pageNumber * 3 - i].time.getTime() > time.getTime()) {
            differentiation = `Future`;
        }
        else {
            differentiation = `Commenced`;
        }

        bookingsListTableHTML += `
            <tr class="bookingRow">
                <td>
                    <div class="bookingListDataDiv">
                        <span class="bookingName">${bookingNameDisplayText}</span>
                        <span class="bookingDate">${bookingDateDisplayText}  (${differentiation})</span>
                        <table class="bookingInfoTable">
                            <tr class="taxiInnerTableDataRow">
                                <td>
                                    <span>Pick Up:</span>
                                </td>
                                <td>
                                    <span>${pickUpDisplayText}</span>
                                </td>
                                <td>
                                    <span>Distance: </span>
                                </td>
                                <td>
                                    <span>${distanceDisplayText}</span>
                                </td>
                            </tr>
                            <tr class="taxiInnerTableDataRow">
                                <td>
                                    <span>Destination: </span>
                                </td>
                                <td>
                                    <span>${destinationDisplayText}</span>
                                </td>
                                <td>
                                    <span>Fare: </span>
                                </td>
                                <td>
                                    <span>${fareDisplayText}</span>
                                </td>
                            </tr>
                            <tr class="taxiInnerTableDataRow">
                                <td>
                                    <span>No. of Stops: </span>
                                </td>
                                <td>
                                    <span>${stopsDisplayText}</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <td class="infoIconBox">
                    <button onclick="infoIconClick(${counter})" class="infoIconButton">
                        <img src="img/infoIcon.svg" class="infoIcon">
                    </button>
                </td>
            </tr>
        `;
        counter++;
    }

    if ((pageNumber * 3 - 3) == appUser.bookings.length) {
        bookingsListTableDiv.innerHTML = `
            <h4>
                No bookings made.
            </h4>
        `;
        return;
    }

    bookingsListTable.innerHTML = bookingsListTableHTML;
}

/**
 * Function Name: previousButton
 * @desc Decrements the page number and then calls a function to update the page.
 */
function bookingsListPreviousButton() {
    pageNumber = pageNumber - 1;
    if (pageNumber < 1) {
        alert("Bug detected: Page number is out of allowed range.")
    }
    updateBookingsListPage(pageNumber);
}

/**
 * Function Name: nextButton
 * @desc Increments the page number and then calls a function to update the page.
 */
function bookingsListNextButton() {
    pageNumber++;
    if (pageNumber > getMaxPageNumber()) {
        alert("Bug detected: Page number is out of allowed range.")
        pageNumber = pageNumber - 1;
    }
    updateBookingsListPage(pageNumber);
}

// display deleted booking if it exists
if (localStorageCheck(DELETION_KEY)) {
    window.alert(`Successfully deleted the booking "${localStorageGet(DELETION_KEY)}"!`);
    localStorage.removeItem(DELETION_KEY);
}

updateBookingsListPage(pageNumber);