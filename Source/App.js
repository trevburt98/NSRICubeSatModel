(function () {
    "use strict";

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOWJiYzgxNy01YzI5LTQ0NGYtOGNhNC0wOWEyNmI5Yzk0N2QiLCJpZCI6MTg0MjgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM3OTI2MDR9.rHSSiFJGfDPHhTZy1AwZF_GAzle4VTQk5UIOB4-7Yck';

    var viewer = new Cesium.Viewer('cesiumContainer', {
        shouldAnimate : true,
        selectionIndicator : false,
        baseLayerPicker : false
    });

    var tle1 = "1 25544U 98067A   19345.90010417  .00003601  00000-0  70741-4 0  9997";
    var tle2 = "2 25544  51.6441 200.2644 0007302  25.9136 159.9168 15.50127197202820";

    var satrec = satellite.twoline2satrec(tle1, tle2);
    //console.log(satrec);
    var jDate = new Cesium.JulianDate(satrec.jdsatepoch);
    //console.log(Cesium.JulianDate.toDate(jDate));

    var currentSeconds = 0;
    var gmst = satellite.gstime(new Date());
    var positionArray = new Array();
    var sensorArray = new Array();
    var originalLong;
    var orbitTime = 0;

    //Propogate our satellite out for 1 day getting point for every 5 minutes
    while(currentSeconds <= 86400) {
        var positionAndVelocity = satellite.sgp4(satrec, (currentSeconds / 60));
        var positionEci = positionAndVelocity.position;
        var positionGd = satellite.eciToGeodetic(positionEci, gmst);
        //console.log(positionGd);

        var cartesianCoords = Cesium.Cartesian3.fromRadians(positionGd.longitude, positionGd.latitude, positionGd.height);
        var sensorCoords = Cesium.Cartesian3.fromRadians(positionGd.longitude, positionGd.latitude, 0);

        if(currentSeconds == 0) {
            originalLong = positionGd.longitude
        } else if(positionGd.longitude - 0.11 < originalLong && originalLong < positionGd.longitude + 0.1 && orbitTime == 0) {
            orbitTime = currentSeconds;
            //console.log(orbitTime);
        }

        positionArray.push(currentSeconds, cartesianCoords.x, cartesianCoords.y, cartesianCoords.z);
        sensorArray.push(currentSeconds, sensorCoords.x, sensorCoords.y, sensorCoords.z);
        currentSeconds += 300;      
    }
    
    //console.log(positionArray);
    

    var positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.addSamplesPackedArray(positionArray, jDate);
    positionProperty.setInterpolationOptions({interpolationAlgorithm: Cesium.LagrangePolynomialApproximation, interpolationDegree: 5});

    var sensorPositionProperty = new Cesium.SampledPositionProperty();
    sensorPositionProperty.addSamplesPackedArray(sensorArray, jDate);
    sensorPositionProperty.setInterpolationOptions({interpolationAlgorithm: Cesium.LagrangePolynomialApproximation, interpolationDegree: 5});
    //console.log(positionProperty);

    var newSatellite = viewer.entities.add({
        id: "Cubesat",
        name: "Our Cubesat",
        billboard: {
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADJSURBVDhPnZHRDcMgEEMZjVEYpaNklIzSEfLfD4qNnXAJSFWfhO7w2Zc0Tf9QG2rXrEzSUeZLOGm47WoH95x3Hl3jEgilvDgsOQUTqsNl68ezEwn1vae6lceSEEYvvWNT/Rxc4CXQNGadho1NXoJ+9iaqc2xi2xbt23PJCDIB6TQjOC6Bho/sDy3fBQT8PrVhibU7yBFcEPaRxOoeTwbwByCOYf9VGp1BYI1BA+EeHhmfzKbBoJEQwn1yzUZtyspIQUha85MpkNIXB7GizqDEECsAAAAASUVORK5CYII=",
            width: 20,
            height: 20
        },
        label: {
            text: "Cubesat",
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12)
        },
        position: positionProperty,
        path: {
            show: true,
            width: 2,
            material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE),
            resolution: 120,
            leadTime: orbitTime/2,
            trailTime: orbitTime/2
        }
    });

    var baseStation = viewer.entities.add({
        id: "GroundStation",
        name: "Ground Station (Scott Tech)",
        position: Cesium.Cartesian3.fromDegrees(-96.017983, 41.243094),
        label: {
            text: "Scott Tech Ground Station",
            font: "14pt monospace",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(0,-12)
        },
        billboard: {
            image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACvSURBVDhPrZDRDcMgDAU9GqN0lIzijw6SUbJJygUeNQgSqepJTyHG91LVVpwDdfxM3T9TSl1EXZvDwii471fivK73cBFFQNTT/d2KoGpfGOpSIkhUpgUMxq9DFEsWv4IXhlyCnhBFnZcFEEuYqbiUlNwWgMTdrZ3JbQFoEVG53rd8ztG9aPJMnBUQf/VFraBJeWnLS0RfjbKyLJA8FkT5seDYS1Qwyv8t0B/5C2ZmH2/eTGNNBgMmAAAAAElFTkSuQmCC",
            width: 20,
            height: 20
        }
    });

    var sensorBox = new Cesium.BoxGraphics();
    sensorBox.material = new Cesium.ColorMaterialProperty(new Cesium.Color(0.921875, 0.60546875, 0.0546875, .3));
    sensorBox.outline = true;
    sensorBox.dimensions = new Cesium.Cartesian3(80, 80, 0);

    var sensorView = viewer.entities.add({
        position: sensorPositionProperty,
        box: sensorBox
    });

    //console.log(sensorView);

    var freeViewElement = document.getElementById('freeView');
    var satelliteViewElement = document.getElementById('satelliteView');

    function setViewMode() {
        if(satelliteViewElement.checked) {
            viewer.trackedEntity = newSatellite;
        } else {
            viewer.trackedEntity = undefined;
        }
    }

    freeViewElement.addEventListener('change', setViewMode);
    satelliteViewElement.addEventListener('change', setViewMode);

    viewer.trackedEntityChanged.addEventListener(function() {
        if(viewer.trackedEntity === newSatellite) {
            freeViewElement.checked = false;
            satelliteViewElement.checked = true;
        }
    })
}());