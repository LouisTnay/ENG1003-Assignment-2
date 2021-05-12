"use strict"

/* functions */
function dispLocations() {
    for(let i in markers) {
        markers[i].marker.remove();
        markers[i].popup.remove();
    }

    markers = [];
    for (let i in locations) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#FF8C00" })
            .setLngLat(location.coordinates);
    
        let popup = new mapboxgl.Popup({ offset: 45 })
            .setText(location.description);
    
        marker.setPopup(popup)
    
        marker.addTo(map);
        popup.addTo(map);

        markers.push({
            marker: marker,
            popup: popup
        });
    }
}

function toggleMarker() {
    if(layerStates.marker) {
        for(let i in markers) {
            markers[i].marker.remove();
            markers[i].popup.remove();
            layerStates.marker = false;
        }
    }
    else {
        dispLocations();
        layerStates.marker = true;
    }
}


/* Global Code */
// variables
mapboxgl.accessToken = "pk.eyJ1IjoiamxpbTAxNTkiLCJhIjoiY2tud3E1NDF0MGR1cDJvcGJuanh4NGJqZiJ9.cz5fuPVq9Cz3GJ-oJwWFgw";
let locations = [
    {
        coordinates: [101.6076, 3.0728],
        description: "Sunway Pyramid"
    },
    {
        coordinates: [101.6035, 3.0671],
        description: "Sunway University"
    },
    {
        coordinates: [101.6051, 3.0670],
        description: "Lagoon View"
    },
    {
        coordinates: [101.6086, 3.0661],
        description: "Sunway Medical Centre"
    }
];
let map = new mapboxgl.Map({
    container: 'map',
    center: [101.6025, 3.0684],
    zoom: 16,
    style: 'mapbox://styles/mapbox/dark-v10'
});

let markers = [];
let layerStates = {
    marker: true
}



// on load actions
dispLocations();

