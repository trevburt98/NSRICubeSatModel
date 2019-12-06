(function () {
    "use strict";

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOWJiYzgxNy01YzI5LTQ0NGYtOGNhNC0wOWEyNmI5Yzk0N2QiLCJpZCI6MTg0MjgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM3OTI2MDR9.rHSSiFJGfDPHhTZy1AwZF_GAzle4VTQk5UIOB4-7Yck';

    var viewer = new Cesium.Viewer('cesiumContainer', {
        shouldAnimate : true,
        selectionIndicator : false,
        baseLayerPicker : false
    });

    var tle1 = "1 25544U 98067A   19340.65162351 -.00000206  00000-0  44295-5 0  9994";
    var tle2 = "2 25544  51.6436 226.2718 0006901   6.3372  31.6165 15.50090093202011";

    var date = new Date("20" + tle1.substring(18,20), 0);
    date.setDate(tle1.substring(20, 23));
    date.setSeconds(86400 * tle1.substring(23,33));

    var jDate = Cesium.JulianDate.fromDate(date);

    console.log(jDate);

    var satrec = satellite.twoline2satrec(tle1, tle2);

    console.log(satrec);

    var currentMinutes = 0;
    var gmst = satellite.gstime(new Date());
    var positionArray = new Array();

    //Propogate our satellite out for 1 day getting point for every 5 minutes
    while(currentMinutes < 86400) {
        var positionAndVelocity = satellite.sgp4(satrec, currentMinutes);
        var positionEci = positionAndVelocity.position;
        var positionGd = satellite.eciToGeodetic(positionEci, gmst);
        var longitude = positionGd.longitude,
            latitude = positionGd.latitude;

        var longitudeStr = satellite.degreesLong(longitude);
        var latitudeStr = satellite.degreesLat(latitude);

        var cartesianCoords = Cesium.Cartesian3.fromRadians(positionGd.longitude, positionGd.latitude, positionGd.height);

        //console.log("Latitude: " + latitudeStr + ", Longitude: " + longitudeStr);

        positionArray.push(currentMinutes, cartesianCoords.x, cartesianCoords.y, cartesianCoords.z);
        currentMinutes += 300;      
    }
    
    //console.log(positionArray);
    //var date = Cesium.JulianDate.fromDate(new Date(Date.now()));
    // console.log(date);
    

    var positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.addSamplesPackedArray(positionArray, jDate);
    positionProperty.setInterpolationOptions({interpolationAlgorithm: Cesium.LagrangePolynomialApproximation, interpolationDegree: 5});
    //console.log(positionProperty);


    // var testTime = new Date(date);
    // testTime.setHours(testTime.getHours() + 1);
    // console.log(testTime);

    // console.log(positionProperty.getValue(Cesium.JulianDate.fromDate(testTime)));

    var newSatellite = viewer.entities.add({
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
        position: positionProperty
    });

    var baseStation = viewer.entities.add({
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

    console.log(newSatellite);

    //viewer.zoomTo(baseStation);

    //console.log(newSatellite);

    // var satellitePromise = Cesium.CzmlDataSource.load("./Source/SampleData/sampleOrbit.czml");

    //  satellitePromise.then(function(dataSource) {
    //     viewer.dataSources.add(dataSource);
    //     var satelliteEntities = dataSource.entities.values;
         
    //     var entity = satelliteEntities[0];

    //     console.log(entity.);
    //  });
}());
