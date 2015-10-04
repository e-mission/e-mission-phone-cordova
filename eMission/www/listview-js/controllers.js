angular.module('starter.controllers', ['ionic'])

.controller("TripsCtrl", function($scope, $http, $ionicPlatform, $state,
                                    $ionicSlideBoxDelegate, $ionicActionSheet,
                                    leafletData) {
  console.log("controller TripsCtrl called");


  angular.extend($scope, {
      defaults: {
          zoomControl: false,
          dragging: false,
          zoomAnimation: true,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
      }
  });

  /*
   * I think that this may be a cause of a controller trying to do too much,
   * and should probably be moved into a service.
   */

  // Read all cached trips
  /*
   BEGIN DEVICE VERSION
    */
  var db = window.sqlitePlugin.openDatabase({
    name: "userCacheDB",
    location: 0,
    createFromLocation: 1
  });
  UserCacheHelper.getDocument(db, "diary/trips", function(tripListArray) {
    $scope.$apply(function() {
      tripListStr = tripListArray[0];
      tripList = JSON.parse(tripListStr);

  /*
   BEGIN BROWSER VERSION
  $http.get("tomtrips.json").success(function(data, status) {
    console.log(data);
      tripList = data;
    */

      console.log("last place enter = "+tripList[tripList.length-1].features[1].properties.enter_fmt_time)
      console.log("first place exit = "+tripList[0].features[0].properties.exit_fmt_time)

      // Get UTC timestamp for the last trip in the database in current local time
      var currDayStart = getDayStart();

      // stores array of trip objects, one array for each day.
      // days are in reverse cron order, and trips are in cron order within each day
      var tripsByDay = [];

      var oldestTrip = tripList[0]
      var oldestStartTs = getStartTs(oldestTrip)

      console.log("currDayStart = "+currDayStart+" oldestStartTs = " + oldestStartTs);

      // Iterate over the time range from now until the oldest startTs and
      // create TripsOnDate objects. Each TripOnDate has a date string, a start
      // Ts, an endTs and a list of geojson trips on that date. In order to do
      // this, we want to iterate over the trips only once instead of O(ndays)
      // times, so we first create the objects and then fill them with the trips.

      tripsByDay.push(getTripsOnDate(currDayStart, Date.now() / 1000))

      while (oldestStartTs < currDayStart) {
        var prevDayStart = currDayStart - 24 * 60 * 60
        tripsByDay.push(getTripsOnDate(prevDayStart, currDayStart)); 
        currDayStart = prevDayStart;
      }

      tripsByDay.forEach(function(item, index, array) {
        console.log(index + ":" + JSON.stringify(item));
      });

      var dayIndex = tripsByDay.length - 1;
      tripList.forEach(function(trip, index, array) {
        currTripsByDay = tripsByDay[dayIndex];
        var currTripStartTs = getStartTs(trip);
        if (currTripsByDay.start_ts < currTripStartTs &&
            currTripStartTs < currTripsByDay.end_ts) {
            console.log("Existing day works, yay!");
            currTripsByDay.trips.push(trip);
        } else {
            dayIndex = findDay(tripsByDay, dayIndex, currTripStartTs);
            if (dayIndex == -1) {
                console.warn("We should have a day for each trip, but trip "+trip+" does not have a day! Skipping...");
            } else {
                console.log("Found tripsByDay object "
                            +currTripsByDay.fmt_time+", "+currTripsByDay.trips.length
                            +" for original local time "
                            +trip.features[0].properties.exit_fmt_time);
                currTripsByDay = tripsByDay[dayIndex];
                currTripsByDay.trips.push(trip);
            }
        }
      });

      tripsByDay.forEach(function(item, index, array) {
        console.log(index + ":" + item.fmt_time+", "+item.trips.length);
      });

      tripsByDay.forEach(function(item, index, array) {
        item.directive_trips = item.trips.map(function(trip) {
            retVal = {};
            retVal.data = trip;
            retVal.style = style_feature;
            retVal.onEachFeature = onEachFeature;
            retVal.pointToLayer = pointFormat;
            retVal.sections = getSections(trip);
            retVal.temp = {}
            retVal.temp.showDelete = false;
            retVal.temp.showReorder = false;
            return retVal;
        });
      });

      filteredTripsByDay = tripsByDay.filter(function(element, index, array) {
        if (element.trips.length == 0) {
            return false;
        } else {
            return true;
        }
      });

      filteredTripsByDay.forEach(function(item, index, array) {
        console.log(index + ":" + item.fmt_time+", "+item.trips.length);
      });

      $scope.data = {}
      $scope.data.days = filteredTripsByDay;

      $scope.data.currIndex = 0;
      $scope.data.currDay = $scope.data.days.slice(0,1)[0];

      console.log("currIndex = "+$scope.data.currIndex+" currDay = "+ $scope.data.currDay.fmt_time);
      // $ionicSlideBoxDelegate.update();

      /*
      var last_five_trips = [];
      var dic = {}
      var sec = tripSectionDbHelper.getUncommitedSections(jsonTripList);

      // get all sections for the last five days
      for (var j = 0; j < 5; j++) {
        var mr_trips = [mr_trip];
        var today = new Date(mr_trip.startTime.date);
        var key_date = getDateOfTrip(today);

        for (var i = sec.length - 1; i >= 0;) {
          var trip = sec[i];
          // hacky way to check if date is the same
          var tripDate = new Date(trip.startTime.date)
          if (tripDate.getMonth() == today.getMonth()) {
            if (tripDate.getDate() == today.getDate()) {
              if (tripDate.getFullYear() == today.getFullYear()) {
                sec.splice(i, 1);
                mr_trips.unshift(trip);
              }
            }
          }
          i--;
        }
        dic['date_key'] = key_date;
        dic['trip_val'] = mr_trips;
        last_five_trips.push(dic);
        dic = {}
          // last five trips: [ {date: date, trips: [trip1, trip2]} ]
      }
      $scope.data = {};
      $scope.data.slides = last_five_trips;
      for (var i = 0; i < $scope.data.slides.length; i++) {
        var trip = $scope.data.slides[i];
        for (var j = 0; j < trip.trip_val.length; j++) {
          var x = trip.trip_val[j];
          $scope.getDisplayName(x);
        }
      }
      $ionicSlideBoxDelegate.update();

      $scope.last_five_trips = last_five_trips;
      console.log(last_five_trips);
    BEGIN DEVICE VERSION
    */
     });
  });

        var getSections = function(trip) {
            console.log("getSections("+trip+") called");
            var sectionList = [];
            trip.features.forEach(function(item, index, array) {
                console.log("Considering feature " + JSON.stringify(item));
                if (item.type == "FeatureCollection") {
                    item.features.forEach(function (item, index, array) {
                        if (angular.isDefined(item.properties) && angular.isDefined(item.properties.feature_type)) {
                            console.log("Considering feature with type " + item.properties.feature_type);
                            if (item.properties.feature_type == "section") {
                                console.log("FOUND section" + item + ", appending");
                                sectionList.push(item);
                            }
                        }
                    });
                }
            });
            return sectionList;
        };

        /*
    $scope.to_directive = function(trip) {
        retVal = {};
        retVal.data = trip;
        retVal.style = style_feature;
        retVal.onEachFeature = onEachFeature;
        retVal.pointToLayer = pointFormat;
        return retVal;
    };
    */



    $scope.userModes = [
        "walk", "bicycle", "car", "bus", "train", "unicorn"
    ];

        $scope.getSectionDetails = function(section) {
            return (section.properties.duration / 60).toFixed(0) + " mins ";
        };

        $scope.getTripDetails = function(trip) {
            return (trip.sections.length) + " sections";
        };

        $scope.getTripHeightPixels = function(trip) {
            return trip.sections.length * 20 + 300+"px";
        };

        $scope.getCurrDay = function() {
            retVal = $scope.data.days.slice($scope.data.currIndex, $scope.data.currIndex+1)[0];
            console.log("getCurrDay: returning "+retVal.fmt_time);
            return retVal;
        };

        $scope.prevDay = function() {
            console.log("Called prevDay when currDay = "+$scope.data.currDay.fmt_time);
            if ($scope.data.currIndex == 0) {
                console.log("Tried to go before the first day, need to make remote call here");
            } else {
                $scope.data.currIndex = $scope.data.currIndex - 1;
                $scope.data.currDay = $scope.data.days.slice($scope.data.currIndex, $scope.data.currIndex+1)[0];
                console.log("After moving, currIndex = "+$scope.data.currIndex+
                    " and currDay = "+$scope.data.currDay.fmt_time);
            }
        };

        $scope.nextDay = function() {
            console.log("Called nextDay when currDay = "+$scope.data.currDay.fmt_time);
            if ($scope.data.currIndex == $scope.data.days.length - 1) {
                console.log("Tried to go after the last day, need to make remote call here");
            } else {
                $scope.data.currIndex = $scope.data.currIndex + 1;
                $scope.data.currDay = $scope.data.days.slice($scope.data.currIndex, $scope.data.currIndex+1)[0];
                console.log("After moving, currIndex = "+$scope.data.currIndex+
                    " and currDay = "+$scope.data.currDay.fmt_time);
            }
        };

    /*
     * BEGIN: Functions for customizing our geojson display
     */

    $scope.showModes = function(section) {
        return function() {
            currMode = getHumanReadable(section.properties.sensed_mode);
            currButtons = [{ text: "<b>"+currMode+"</b>"}];
            $scope.userModes.forEach(function(item, index, array) {
                if (item != currMode) {
                    currButtons.push({text: item});
                }
            });

           // Show the action sheet
           var modeSheet = $ionicActionSheet.show({
             buttons: currButtons,
             titleText: 'Trip Mode?',
               destructiveText: 'Delete',
             buttonClicked: function(index) {
                console.log("button "+index+" clicked for section "+JSON.stringify(section.properties));
                return true;
             },
               destructiveButtonClicked: function(index) {
                   console.log("delete clicked for section "+JSON.stringify(section.properties));
                   return true;
               }
           });
        }
    };

        $scope.magnifyPoint = function(point, layer) {
            return function() {
                // We want to clone and reverse the coordinates array, since
                // the original coordinates are in geojson format, this is in latlng
                // Unfortunately, javascript does not support clone!
                // Instead of doing hacks like stringifying and destringifying from JSON,
                // I reverse manually.
                // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
                var latLng = [];
                latLng = [point.geometry.coordinates[1], point.geometry.coordinates[0]];

                var glass = L.magnifyingGlass({
                        zoomOffset: 2,
                        radius: 1000,
                        layers: [
                            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
                        ],
                        fixedPosition: true,
                        //
                        latLng: latLng
                });
                console.log("Displaying magnifying glass at "+glass.options.latLng);
                leafletData.getMap().then(function(map) {
                    glass.addTo(map);
                    console.log("Finished adding magnifying glass to map");
                });
            }
        };

    var style_feature = function(feature) {
        switch(feature.properties.feature_type) {
            case "section": return style_section(feature);
            case "stop": return style_stop(feature);
            default: return {}
        }
    };

    var onEachFeature = function(feature, layer) {
        switch(feature.properties.feature_type) {
            case "stop": layer.bindPopup(""+feature.properties.duration); break;
            case "start_place": layer.on('click', $scope.magnifyPoint(feature, layer)); break;
            case "end_place": layer.on('click', $scope.magnifyPoint(feature, layer)); break;
            case "section": layer.setText(getHumanReadable(feature.properties.sensed_mode), {offset: 20});
                layer.on('click', $scope.showModes(feature)); break;
            // case "location": layer.bindPopup(JSON.stringify(feature.properties)); break
        }
      };

   var getHumanReadable = function(sensed_mode) {
        ret_string = sensed_mode.split('.')[1]
        if(ret_string == 'ON_FOOT') {
            return 'WALKING';
        } else {
            return ret_string;
        }
      };

   var getColoredStyle = function(baseDict, color) {
        baseDict.color = color;
        return baseDict
      };

   var style_section = function(feature) {
        var baseDict = {
                weight: 5,
                opacity: 1,
        };
        mode_string = getHumanReadable(feature.properties.sensed_mode);
        switch(mode_string) {
            case "WALKING": return getColoredStyle(baseDict, 'brown');
            case "BICYCLING": return getColoredStyle(baseDict, 'green');
            case "TRANSPORT": return getColoredStyle(baseDict, 'red');
            default: return getColoredStyle(baseDict, 'black');
        }
      };

   var style_stop = function(feature) {
        return {fillColor: 'yellow', fillOpacity: 0.8};
      };

      var pointIcon = L.divIcon({className: 'leaflet-div-icon', iconSize: [5, 5]});

      var startMarker = L.AwesomeMarkers.icon({
        icon: 'play',
        prefix: 'ion',
        markerColor: 'green'
      });

      var stopMarker = L.AwesomeMarkers.icon({
        icon: 'stop',
        prefix: 'ion',
        markerColor: 'red'
      });

    var pointFormat = function(feature, latlng) {
        switch(feature.properties.feature_type) {
            case "start_place": return L.marker(latlng, {icon: startMarker})
            case "end_place": return L.marker(latlng, {icon: stopMarker})
            case "stop": return L.circleMarker(latlng)
            case "location": return L.marker(latlng, {icon: pointIcon})
            default: alert("Found unknown type in feature"  + feature); return L.marker(latlng)
        }
      };

    /*
     * END: Functions for customizing our geojson display
     */

    /*
     * Local function that returns the timestamp corresponding to midnight in
     * current local time for the specified timestamp.
     * The timestamp is in seconds.
     */
    var getDayStart = function() {
        var localNow = new Date();
        var midnightDate = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(),
            0, 0, 0);
        return midnightDate.getTime() / 1000;
    };

    /*
     * Local function that returns a "day" object.
     * TODO: Should we move this to the server side? We can send over data that
     * is already pre-grouped into days...
     */
    var getTripsOnDate = function(start_ts, end_ts) {
        return {'fmt_time': new Date(start_ts * 1000).toLocaleDateString(),
            'start_ts': start_ts,
            'end_ts': end_ts,
            'trips': []
        }
    };

    /*
     * Local function that finds the 
     */
    var findDay = function(dayList, currIndex, ts) {
        for(i = currIndex; i >= 0; i--) {
            if (dayList[i].start_ts < ts && 
                ts < dayList[i].end_ts) {
                return i;
            }
        }
        return -1;
    };

    var getStartTs = function(trip) {
        return trip.features[0].properties.exit_ts
    };

    var getDateOfTrip = function(date) {
      var month;
      var date;

      /*
       * In order to be consistent with the spec, these need to be
       * date.getMonth() + 1 and date.getDay() + 1. However, that doesn't
       * actually work, probably because the date is being parsed incorrectly.
       *
       * Working around this for now since we should switch to timestamps
       * anyway.
       */
      switch (date.getMonth()) {
        case 1:
          month = "January";
          break;
        case 2:
          month = "February";
          break;
        case 3:
          month = "March";
          break;
        case 4:
          month = "April";
          break;
        case 5:
          month = "May";
          break;
        case 6:
          month = "June";
          break;
        case 7:
          month = "July";
          break;
        case 8:
          month = "August";
          break;
        case 9:
          month = "September";
          break;
        case 10:
          month = "October";
          break;
        case 11:
          month = "November";
          break;
        case 12:
          month = "December";
          break;

      };

      switch (date.getDay()) {
        case 1:
          day = "Sunday";
          break;
        case 2:
          day = "Monday";
          break;
        case 3:
          day = "Tuesday";
          break;
        case 4:
          day = "Wednesday";
          break;
        case 5:
          day = "Thursday";
          break;
        case 6:
          day = "Friday";
          break;
        case 7:
          day = "Saturday";
          break;
      };

      return (day + ", " + month + " " + date.getDate() + ", " + date.getFullYear());
    };


    $scope.getTime = function(date) {
      var min = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      return ("" + date.getHours() + ":" + min);
    };

    $scope.notSingleOrLast = function(index, list) {
      if (index == list.length - 1) {
        return false;
      } else {
        return true;
      }
    };

    $scope.slideHasChanged = function(index) {
      console.log("slide changed to index: " + index+" when ionic delegate index = "+$ionicSlideBoxDelegate.currentIndex+
          " and our cached index is "+$scope.currIndex);
      $scope.days = $scope.allDays.slice($scope.currIndex, $scope.currIndex+1);
        $scope.currIndex = $scope.currIndex + 1;
        $ionicSlideBoxDelegate.update();
    };

    $scope.mapCreated = function(map) {
      console.log("maps here");
      console.log(map)
      $scope.map = map;
      $scope.setupMap($scope.data.slides[0]["trip_val"][0]);
    };

    $scope.centerOnMe = function() {
      console.log("Centering");
      if (!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
        console.log('Got pos', pos);
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
    };

    $scope.getDisplayName = function(item) {
      var responseListener = function() {
        console.log("got response");
        var address = JSON.parse(this.response)["address"];
        var name = "";
        if (address["road"]) {
          name = address["road"];
        } else if (address["neighbourhood"]) {
          name = address["neighbourhood"];
        }
        item.displayName = name;
      };
      var xmlHttp = new XMLHttpRequest();
      var url = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" + item["trackPoints"][0]["coordinate"][1] + "&lon=" + item["trackPoints"][0]["coordinate"][0]
      xmlHttp.open("GET", url);
      xmlHttp.onload = responseListener;
      xmlHttp.send();
    };

    /*
    var db = $cordovaSQLite.openDB({name: "TripSections.db"});
    tripSectionDbHelper.getJSON({name: "TripSections.db"}, function(jsonTripList){
        alert("this is actually happening");
        console.log("testing other things");
        $scope.trips = tripSectionDbHelper.getUncommittedSections(jsonTripList);
        console.log($scope.trips.length + "trips have been loaded");
    });
    */
    $scope.nextSlide = function() {
      console.log("next");
      $ionicSlideBoxDelegate.next();
    };

    $scope.pickImage = function(item) {
      if (item.predictedMode != null) {
        var item_mode = item.predictedMode;
      } else {
        var item_mode = item.autoMode;
      }

      if (item_mode == 'walking') {
        return 'img/walking.jpg';
      }
      if (item_mode == 'car') {
        return 'img/car.jpg';
      }
      if (item_mode == 'cycling') {
        return 'img/cycling.jpg';
      }
      if (item_mode == 'air') {
        return 'img/air.jpg';
      }
      if (item_mode == 'bus') {
        return 'img/bus.jpg';
      }
      if (item_mode == 'train') {
        return 'img/train.jpg';
      }
    };

    $scope.setupMap = function(item) {
      console.log(JSON.stringify(item));
      if ($scope.path) {
        $scope.path.setMap(null)
      }
      if ($scope.startMarker) {
        $scope.startMarker.setMap(null)
      }
      if ($scope.endMarker) {
        $scope.endMarker.setMap(null)
      }
      var points = item["trackPoints"]
      var latitude = points[0]["coordinate"][1]
      var longitude = points[0]["coordinate"][0]
      var endLat = points[points.length - 1]["coordinate"][1]
      var endLng = points[points.length - 1]["coordinate"][0]
      $scope.startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        icon: 'img/maps-markera.png'
      });
      $scope.startMarker.setMap($scope.map)
      $scope.endMarker = new google.maps.Marker({
        position: new google.maps.LatLng(endLat, endLng),
        icon: 'img/maps-markerb.png'
      });
      $scope.endMarker.setMap($scope.map)
      $scope.map.setCenter({
        lat: latitude,
        lng: longitude
      })
      var coordinates = [];
      for (var i = 0; i < points.length; i++) {
        coordinates.push(new google.maps.LatLng(points[i]["coordinate"][1], points[i]["coordinate"][0]))
      }
      var path = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      $scope.path = path
      path.setMap($scope.map)
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < coordinates.length; i++) {
        bounds.extend(coordinates[i]);
      }
      $scope.map.fitBounds(bounds);
    };

    //Change according to datatype in actual data object and the intervals set in the app.
    // Intervals: Green - confidence > 80 ; Yellow: 80 > confidence > 70; Red: 70 > confidence
    $scope.getConfidenceColor = function(item) {
      if (item.userClassification != null && item.userClassification.length > 0) {
        return "confidence-certain";
      } else if (item.confidence >= 0.9) {
        return "confidence-certain";
      } else if (item.confidence >= 0.7) {
        return "confidence-medium";
      } else {
        return "confidence-low";
      }
    };

    $scope.getDisplayMode = function(item) {
      var item_mode = "";
      if (item.userClassification != null && item.userClassification.length > 0) {
        item_mode = item.userClassification;
      } else if (item.predictedMode != null) {
        item_mode = item.predictedMode;
      } else {
        item_mode = item.autoMode;
      }
      if (item_mode == 'walking') {
        return 'ion-android-walk'
      }
      if (item_mode == 'car') {
        return 'ion-android-car';
      }
      if (item_mode == 'cycling') {
        return 'ion-android-bicycle';
      }
      if (item_mode == 'air') {
        return 'ion-android-plane';
      }
      if (item_mode == 'bus') {
        return 'ion-android-bus';
      }
      if (item_mode == 'train') {
        return 'ion-android-subway';
      }
    };

    $scope.modes = [{
      mode: "walking",
      show: "Walk"
    }, {
      mode: "cycling",
      show: "Bike"
    }, {
      mode: "car",
      show: "Car"
    }, {
      mode: "air",
      show: "Fly"
    }, {
      mode: "bus",
      show: "Bus"
    }, {
      mode: "train",
      show: "Train"
    }];

    $scope.modeUpdate = function(trip, newMode) {
      console.log("selected new mode " + newMode + " with tripId " + trip.tripId)
      var db = window.sqlitePlugin.openDatabase({
        name: "TripSections.db",
        location: 2,
        createFromLocation: 1
      });
      db.transaction(function(tx) {
        var mDate = new Date();
        tx.executeSql("UPDATE currTrips SET userClassification = ? WHERE tripId = ?", [newMode, trip.tripId], function(tx, r) {
          console.log("Your SQLite query was successful!");
        }, function(tx, e) {
          console.log("SQLite Error: " + e.message);
        });
      });
    };

    $scope.modeChange = function(newMode) {
      $scope.modes[0].newMode;
    };

  })
