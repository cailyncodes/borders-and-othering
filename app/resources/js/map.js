'use strict';

/**
 * Must be included after all other js files.
 */
var gMap, map, gl;
var displayMexico, displayUnitedStates, displayTexas;
var mexicoLayers, unitedStatesLayers, texasLayers, borderLayers;
var indigenousData, indigenousLayer;
var imagesZoom;
var slideIndex = 1;

var displayMapping = {
    "start": "content-1",
    "content-1": "content-2",
    "content-2": "content-3",
    "content-3": "content-4",
    "content-4": "content-5",
    "content-5": "content-6",
    "content-6": "content-7",
    "content-7": "content-8",
    "content-8": "content-9",
    // "content-9": "content-10",
    "content-9": "end"
}, displayMappingReverse;

var mapDisplayMapping = {
    "content-4": {
        "current-map": "google-map",
        "next-map": "main-map"
    },
    "content-8": {
        "current-map": "main-map",
        "next-map": "images"
    }
};

var mapDisplayMappingReverse = {
    "content-5": {
        "current-map": "main-map",
        "prev-map": "google-map"
    },
    "content-9": {
        "current-map": "images",
        "prev-map": "main-map"
    }
}

function swap(json){
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
  }

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    displayMappingReverse = swap(displayMapping);

    document.getElementById("next-display").addEventListener("click", function(e) {
        document.getElementById('prev-display').classList.remove('hidden');
        var currentElm = document.querySelector(".content:not(.hidden)");
        var currentId = currentElm.id;
        var nextId = displayMapping[currentId];
        var nextElm = document.getElementById(nextId);
        if (nextElm) {
            changeDisplay(currentElm, nextElm);
        }
        var mapDisplay = mapDisplayMapping[currentId];
        if (mapDisplay) {
            var currentMapId = mapDisplay["current-map"];
            var nextMapId = mapDisplay["next-map"];
            var currentMap = document.getElementById(currentMapId);
            var nextMap = document.getElementById(nextMapId);
            changeDisplay(currentMap, nextMap);
            initMainMap();
        }

        if (nextId == 'content-6') {
            drawIndigenousLands();
        }

        if (nextId == 'content-7') {
            drawGeoJSONData();
        }

        if (nextId == 'content-8') {
            removeGeoJSONData();
            updatePlacenames('English', 'Country');
        }

        if (nextId == 'content-9') {
            removePlacenames();
            if (!imagesZoom) {
                var images = document.querySelectorAll(".slide img");
                wheelzoom(images);
                imagesZoom = true;
                window.setTimeout(function() {
                    showSlides(slideIndex);
                }, 3000);
            }            
        }

        if (nextId == 'end') {
            document.getElementById('next-display').classList.add("hidden");
        }
    });
    document.getElementById("prev-display").addEventListener("click", function(e) {
        document.getElementById('next-display').classList.remove('hidden');
        var currentElm = document.querySelector(".content:not(.hidden)");
        var currentId = currentElm.id;
        var prevId = displayMappingReverse[currentId];
        var prevElm = document.getElementById(prevId);
        if (prevElm) {
            changeDisplay(currentElm, prevElm);
        }
        var mapDisplay = mapDisplayMappingReverse[currentId];
        if (mapDisplay) {
            var currentMapId = mapDisplay["current-map"];
            var prevMapId = mapDisplay["prev-map"];
            var currentMap = document.getElementById(currentMapId);
            var prevMap = document.getElementById(prevMapId);
            changeDisplay(currentMap, prevMap);
            initMainMap();
        }

        if (prevId == 'content-5') {
            removeIndigenousLands();
        }

        if (prevId == 'content-6') {
            removeGeoJSONData();
        }

        if (prevId == 'content-7') {
            drawGeoJSONData();
            removePlacenames();
        }

        if (prevId == 'content-8') {
            updatePlacenames('English', 'Country');
        }

        if (prevId == 'start') {
            document.getElementById('prev-display').classList.add("hidden");
        }
    });

    document.getElementById("time").addEventListener("input", function(e) {
        var input = e.target.valueAsNumber;

        document.getElementById('time-display').innerHTML = (new Date(input)).toLocaleDateString('en-US', {month:"long",year:"numeric"});

        updateGeoJSONBasedOnTime(input, 2629800000);
    });

    document.getElementById('language-placename-control').addEventListener('input', function(e) {
        var select = e.target;
        var selectedOptions = select.selectedOptions;
        var value = selectedOptions[0].value;
        var labelElm = document.querySelector('#placename-label-control select');
        var label = labelElm.selectedOptions[0].value;
        updatePlacenames(value, label);
    });
    document.getElementById('placename-label-control').addEventListener('input', function(e) {
        var select = e.target;
        var selectedOptions = select.selectedOptions;
        var value = selectedOptions[0].value;
        var langElm = document.querySelector('#language-placename-control select');
        var lang = langElm.selectedOptions[0].value;
        updatePlacenames(lang, value);
    });

    initGoogleMapBaseMapControl();

    document.getElementById("load").classList.add("hidden");
}

function updatePlacenames(language, label) {
    if (label == 'All') {
        label = ['Country', 'State', 'Settlement'];
    } else {
        label = [label];
    }
    for (var i = 0; i < label.length; ++i) {
        var labelType = label[i].toLowerCase();
        var textSize = labelType == 'country' ? 12 : label[i] == 'state' ? 11 : 10;
        var clearByPrefix = i == 0 ? 'local-name' : '';
        var dataName;
        switch (language) {
            case "Local Names":
                dataName = 'name';
                break;
            case "English":
                dataName = 'name_en';
                break;
            case "Spanish":
                dataName = 'name_es';
                break;
            case "French":
                dataName = 'name_fr';
                break;
            case "German":
                dataName = 'name_de';
                break;
            case "Arabic":
                dataName = 'name_ar';
                break;
            case "Korean":
                dataName = 'name_ko';
                break;
            case "Japanese":
                dataName = 'name_ja';
                break;
            case "Russian":
                dataName = 'name_ru';
                break;
            case "Portuguese":
                dataName = 'name_pt';
                break;
            default:
                console.error("Invalid Google Maps Basemap");
                break;
            
        }
        updateStyle(gl._glMap, placeNameOverlay, {
            isNewLayer: false,
            completeUpdate: true,
            clearByPrefix: clearByPrefix,
            layerId: 'local-name-'+labelType,
            params: ['local-name-'+labelType, dataName, [labelType], textSize]
        });
    }
}

function removePlacenames() {
    updateStyle(gl._glMap, placeNameOverlay, {
        clearByPrefix: 'local-name-',
        doRemove: true
    });
}

function changeDisplay(current, next) {
    current.classList.add("hidden");
    next.classList.remove("hidden");
}

function initMainMap() {
    if (map) {
        return;
    }
    map = L.map('main-map').setView([29.739, -103.938], 4);

    L.tileLayer('', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    displayMexico = L.featureGroup([]).addTo(map);
    displayUnitedStates = L.featureGroup([]).addTo(map);
    displayTexas = L.featureGroup([]).addTo(map);

    mexicoLayers = L.geoJSON([]);
    unitedStatesLayers = L.geoJSON([]);
    texasLayers = L.geoJSON([]);

    indigenousLayer = L.geoJSON([], {
        style: function (feature) {
            return {
                color: "#aa00aa77",
                stroke: false,
            };
        },
        // onEachFeature: function (feature, layer) {
        //     layer.bindPopup('');
        //     layer.on('click', function(e) {
        //         var overlaps = [];
        //         var point = e.latlng;
        //         indigenousLands.eachLayer(function(layer) {
        //             var bounds = layer.getBounds();
        //             if (bounds.contains(point)) {
        //                 overlaps.push(layer);
        //             }
        //         });
        //         console.log(overlaps.length);
        //         var names = overlaps.map(function(overlap) {
        //             return overlap.feature.properties.Name;
        //         });
        //         layer.setPopupContent(names.join(', '));
        //         layer.openPopup();
        //     });
        // }
    });
    indigenousLayer.on('click', function(e) {
        var overlaps = [];
        var point = e.latlng;
        indigenousLayer.eachLayer(function(layer) {
            var bounds = layer.getBounds();
            if (bounds.contains(point)) {
                overlaps.push(layer);
            }
        });
        var names = overlaps.map(function(overlap) {
            return overlap.feature.properties.Name;
        });
        var elm = document.getElementById('indigenous-point-click');
        elm.innerHTML = 'The point you clicked on is located on the land of the following indigenous groups: ' + names.join(', ') + '.';
    });

    var token = 'pk.eyJ1IjoiY2FpbHluY29kZXMiLCJhIjoiY2p0dXJ3aWo0MDIxNjN6bWYxbTg4djRkaSJ9.USG8kkczoyTQfgCAxIQTsQ';
    var styleUrl = window.location.hostname == "localhost" ? './resources/geostyles/base.json' : './geostyles/base.json';
    gl = L.mapboxGL({
        accessToken: token,
        style: styleUrl
    }).addTo(map);
}

function drawIndigenousLands() {
    if (!indigenousData) {
        fetchIndigenousData();
    }
    indigenousLayer.addTo(map);
}

function fetchIndigenousData() {
    fetch('./geodata/indigenous-territories.json')
    .then(function(data) {
        return data.json();
    })
    .then(function(data) {
        console.log(data);
        indigenousLayer.addData(data);
        indigenousData = true;
    });
}

function removeIndigenousLands() {
    map.removeLayer(indigenousLayer);
}

function drawGeoJSONData() {
    if (!borderLayers) {
        fetchGeoJSONData();
    }
    var time = document.getElementById("time").valueAsNumber;
    document.getElementById('time-display').innerHTML = (new Date(time)).toLocaleDateString('en-US', {month:"long",year:"numeric"});
    updateGeoJSONBasedOnTime(+(new Date(time)), 2629800000);
    borderLayers = true;
}

function fetchGeoJSONData() {
    fetch('./geodata/full.geojson')
    .then(function(data) {
        return data.json();
    })
    .then(function(data) {
        console.log(data);
        for (var i = 0; i < data.features.length; ++i) {
            var layer = data.features[i];
            switch (layer.properties.name) {
                case "United States":
                    unitedStatesLayers.addData(layer);
                    break;
                case "Mexico":
                    mexicoLayers.addData(layer);
                    break;
                case "Texas":
                    texasLayers.addData(layer);
                    break;
                default:
                    console.error("Invalid GeoJSON data");
                    break;
            }
        }
        document.getElementById('time-display').innerHTML = (new Date(-3471292800000)).toLocaleDateString('en-US', {month:"long",year:"numeric"});
        updateGeoJSONBasedOnTime(-3471292800000, 2629800000);
    });
}

function removeGeoJSONData() {
    displayMexico.clearLayers();
    displayTexas.clearLayers();
    displayUnitedStates.clearLayers();
}

function updateGeoJSONBasedOnTime(startInput, __interval) {
    displayMexico.clearLayers();
    mexicoLayers.eachLayer(function(layer) {
        var start = layer.feature.properties['START_DATE'];
        var end = layer.feature.properties['END_DATE'];
        var startTime = new Date(start);
        var endTime = new Date(end);
        if ((+startTime <= startInput) && (+endTime > startInput))
            displayMexico.addLayer(layer);
    });
    displayMexico.setStyle(
        {
            color: "#0000ffcc",
            weight: 1
        }
    );

    displayUnitedStates.clearLayers();
    unitedStatesLayers.eachLayer(function(layer) {
        var start = layer.feature.properties['START_DATE'];
        var end = layer.feature.properties['END_DATE'];
        var startTime = new Date(start);
        var endTime = new Date(end);
        if ((+startTime <= startInput) && (+endTime > startInput))
            displayUnitedStates.addLayer(layer);
    });
    displayUnitedStates.setStyle(
        {
            color: "#00ff00cc",
            weight: 1
        }
    );

    displayTexas.clearLayers();
    texasLayers.eachLayer(function(layer) {
        var start = layer.feature.properties['START_DATE'];
        var end = layer.feature.properties['END_DATE'];
        var startTime = new Date(start);
        var endTime = new Date(end);
        if ((+startTime <= startInput) && (+endTime > startInput))
            displayTexas.addLayer(layer);
    });
    displayTexas.setStyle(
        {
            color: "#ff0000cc",
            weight: 1
        }
    );
}

function initGoogleMap() {
    if (gMap) {
        return;
    }
    gMap = new google.maps.Map(document.getElementById('google-map'), {
        center: {
            lat: 29.739,
            lng: -103.938
        },
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });
}

function initGoogleMapBaseMapControl() {
    document.getElementById("google-maps-basemap-control").addEventListener('input', function(e) {
        var select = e.target;
        var selectedOptions = select.selectedOptions;
        var value = selectedOptions[0].value;
        switch (value) {
            case "Roadmap":
                gMap.setMapTypeId('roadmap');
                break;
            case "Satellite":
                gMap.setMapTypeId('satellite');
                break;
            case "Terrain":
                gMap.setMapTypeId('terrain');
                break;
            case "Hybrid":
                gMap.setMapTypeId('hybrid');
                break;
            default:
                console.error("Invalid Google Maps Basemap");
                break;
        }
    });
}

function updateStyle(map, data, options) {
    // debugger
    var isNewLayer = options.isNewLayer;
    var completeUpdate = options.completeUpdate;
    var doRemove = options.doRemove;
    var layerId = options.layerId || '';
    var params = options.params;
    var clearByPrefix = options.clearByPrefix;
    var style = map.getStyle();
    if (doRemove) {
        var layers = style.layers;
        var toRemove = [];
        var layer, i;
        for (i = 0; i < layers.length; ++i) {
            if (layers[i].id.startsWith(clearByPrefix)) {
                toRemove.push(i);
            }
        }
        for (var j = 0; j < toRemove.length; ++j) {
            style.layers.splice(toRemove[j] - j, 1);
            map.setStyle(style);
            return;
        }
    }
    if (clearByPrefix) {
        var layers = style.layers;
        var toRemove = [];
        var layer, i;
        for (i = 0; i < layers.length; ++i) {
            if (layers[i].id.startsWith(clearByPrefix)) {
                toRemove.push(i);
            }
        }
        for (var j = 0; j < toRemove.length; ++j) {
            style.layers.splice(toRemove[j] - j, 1);
            map.setStyle(style);
        }
    }
    if (isNewLayer) {
        var newLayer = data(...params);
        console.log(newLayer)
        style.layers.push(newLayer);
    } else {
        var layers = style.layers;
        var layer, i;
        for (i = 0; i < layers.length; ++i) {
            if (layers[i].id == layerId) {
                layer = layers[i];
                break;
            }
        }
        if (!layer) {
            return updateStyle(map, data, {
                isNewLayer: true,
                params: params
            })
        }
        if (completeUpdate) {
            style.layers.splice(i, 1);
            map.setStyle(style);
            return updateStyle(map, data, {
                isNewLayer: true,
                params: params
            })
        } else {
            // TODO
        }
    }
    console.log(style)
    map.setStyle(style);
}

var language = "name_ar";
var classes = ['country'];
function placeNameOverlay(id, language, classes, textSize) {
    return {
        "id": id,
        "type": "symbol",
        "source": "composite",
        "source-layer": "place_label",
        "layout": {
            "text-field": [
                "match",
                ["get", "class"], 
                classes,
                ["get", language],
                ""
            ],
            "text-size": textSize
        },
        "paint": {
            "text-halo-color": "hsl(0, 0%, 100%)",
            "text-halo-width": 2,
            "text-halo-blur": 0
        }
    }
}

function adminOverlay() {
    return {
        "id": "admin",
        "type": "line",
        "source": "composite",
        "source-layer": "admin",
        "layout": {},
        "paint": {}
    };
}

function terrainOverlay(opacity) {
    return {
        "id": "terrain",
        "type": "hillshade",
        "source": "terrain-mapbox",
        "layout": {},
        "paint": {
            "hillshade-exaggeration": 0.95,
            "hillshade-illumination-direction": 355,
            "hillshade-accent-color": "hsl(0, 0%, 35%)",
            "hillshade-highlight-color": "hsl(0, 0%, 90%)"
        }
    };
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slide");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].classList.add("hidden");
    }
    var slide = slides[slideIndex-1];
    slide.classList.remove("hidden");
    slide.querySelector('img').classList.add('img-100');
} 