(function () {
    "use strict";

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOWJiYzgxNy01YzI5LTQ0NGYtOGNhNC0wOWEyNmI5Yzk0N2QiLCJpZCI6MTg0MjgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM3OTI2MDR9.rHSSiFJGfDPHhTZy1AwZF_GAzle4VTQk5UIOB4-7Yck';

    var viewer = new Cesium.Viewer('cesiumContainer', {
        shouldAnimate : true,
        selectionIndicator : false,
        baseLayerPicker : false
    });

    var tle1 = "1 25544U 98067A   19336.28665689  .00000306  00000-0  13364-4 0  9992";
    var tle2 = "2 25544  51.6447 250.5405 0006891 348.7627  57.0761 15.50091363201250";

    var satrec = satellite.twoline2satrec(tle1, tle2);

    var currentMinutes = 0;
    var gmst = satellite.gstime(new Date());
    var positionArray = new Array();

    //Propogate our satellite out for 1 day getting point for every 5 minutes
    while(currentMinutes < 86400) {
        var positionAndVelocity = satellite.sgp4(satrec, currentMinutes);
        var positionEci = positionAndVelocity.position;
        var positionGd = satellite.eciToGeodetic(positionEci, gmst);

        var cartesianCoords = Cesium.Cartesian3.fromRadians(positionGd.longitude, positionGd.latitude, positionGd.height);

        positionArray.push(currentMinutes, cartesianCoords.x, cartesianCoords.y, cartesianCoords.z);
        currentMinutes += 300;      
    }
    
    console.log(positionArray);
    var date = Cesium.JulianDate.fromDate(new Date(Date.now()));
    console.log(date);
    

    var positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.addSamplesPackedArray(positionArray, date);
    // positionProperty.setInterpolationOptions({interpolationDegree: 5});
    //var interpolated = positionProperty.interpolationAlgorithm.interpolateOrderZero(x, [-1500, -1200, -900, -600, -300, 0], positionArray, 6);


    var testTime = new Date(date);
    testTime.setHours(testTime.getHours() + 1);
    console.log(testTime);

    console.log(positionProperty.getValue(Cesium.JulianDate.fromDate(testTime)));

    // var newSatellite = viewer.entities.add({
    //     name: "Our Cubesat",
    //     billboard: {
    //         eyeOffset: {
    //             cartesian: [
    //                 0,0,0
    //             ]
    //         },
    //         horizontalOrigin: "CENTER",
    //         image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADJSURBVDhPnZHRDcMgEEMZjVEYpaNklIzSEfLfD4qNnXAJSFWfhO7w2Zc0Tf9QG2rXrEzSUeZLOGm47WoH95x3Hl3jEgilvDgsOQUTqsNl68ezEwn1vae6lceSEEYvvWNT/Rxc4CXQNGadho1NXoJ+9iaqc2xi2xbt23PJCDIB6TQjOC6Bho/sDy3fBQT8PrVhibU7yBFcEPaRxOoeTwbwByCOYf9VGp1BYI1BA+EeHhmfzKbBoJEQwn1yzUZtyspIQUha85MpkNIXB7GizqDEECsAAAAASUVORK5CYII=",
    //         pixelOffset: {
    //             cartesian2:[
    //                 0,0
    //             ]
    //         },
    //         scale: 1.5,
    //         show: true,
    //         verticalOrigin: "CENTER"
    //     },
    //     label: {
    //         fillColor: {
    //             rgba:[
    //                 0,255,0,255
    //             ]
    //         },
    //         font: "11pt Lucida Console",
    //         horizontalOrigin: "LEFT",
    //         outlineColor: {
    //             rgba:[
    //                 0,0,0,255
    //             ]
    //         },
    //         outlineWidth: 2,
    //         pixelOffset:{
    //             cartesian2:[
    //                 12,0
    //             ]
    //         },
    //         show:true,
    //         style: "FILL_AND_OUTLINE",
    //         text: "Our Cubesat",
    //         verticalOrigin: "CENTER"
    //     },
    //     position: positionProperty
    // });

    var baseStation = viewer.entities.add({
        name: "Ground Station (Scott Tech)",
        position: Cesium.Cartesian3.fromDegrees(41.24, -96.02),
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACvSURBVDhPrZDRDcMgDAU9GqN0lIzijw6SUbJJygUeNQgSqepJTyHG91LVVpwDdfxM3T9TSl1EXZvDwii471fivK73cBFFQNTT/d2KoGpfGOpSIkhUpgUMxq9DFEsWv4IXhlyCnhBFnZcFEEuYqbiUlNwWgMTdrZ3JbQFoEVG53rd8ztG9aPJMnBUQf/VFraBJeWnLS0RfjbKyLJA8FkT5seDYS1Qwyv8t0B/5C2ZmH2/eTGNNBgMmAAAAAElFTkSuQmCC",
        show: true
    });

    console.log(baseStation);

    viewer.zoomTo(baseStation);

    //console.log(newSatellite);

    // var satellitePromise = Cesium.CzmlDataSource.load("./Source/SampleData/sampleOrbit.czml");

    //  satellitePromise.then(function(dataSource) {
    //     viewer.dataSources.add(dataSource);
    //     var satelliteEntities = dataSource.entities.values;
         
    //     var entity = satelliteEntities[0];

    //     console.log(entity.);
    //  });
}());
