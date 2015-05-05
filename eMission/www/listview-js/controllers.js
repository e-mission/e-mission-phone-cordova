angular.module('starter.controllers', ['ionic'])

.controller("TripsCtrl", function($scope, $ionicPlatform,$state,$ionicSlideBoxDelegate) {
    console.log("controller TripsCtrl called");

    //DATA: Gautham, this is where you link the data.
    /*
    $scope.trips = [
         {mode:'walking',confidence:1},
         {mode:'car',confidence:0.5},
         {mode:'walking',confidence:1},
         {mode:'cycling',confidence:0.3},
         {predictedMode:'cycling',confidence:0.3}
    ];
    */

    /*
     * I think that this may be a cause of a controller trying to do too much,
     * and should probably be moved into a service.
     */

    // code to get trips from most recent day only
    var db = window.sqlitePlugin.openDatabase({name: "TripSections.db", location: 2, createFromLocation: 1});
      tripSectionDbHelper.getJSON(db, function(jsonTripList) {
          $scope.$apply(function () {
               console.log(jsonTripList);
              //$scope.trips = tripSectionDbHelper.getUncommitedSections(jsonTripList);

              var last_five_trips = [];
              var dic = {}
              var sec = tripSectionDbHelper.getUncommitedSections(jsonTripList);

              // get all sections for the last five days
              for (var j = 0; j < 5; j++) {
                var mr_trip = sec.pop();
                console.log(mr_trip)
                var mr_trips = [mr_trip];
                var key_date = getDateOfTrip(mr_trip);
                var today = new Date(mr_trip.startTime.date);
                console.log('cur date' + today)
                for (var i = 0; i < sec.length; i++) {
                  var trip = sec[i];
                  // hacky way to check if date is the same
                  var tripDate = new Date(trip.startTime.date)
                  console.log('compare to ' + tripDate)
                  if (tripDate.getMonth() == today.getMonth()) {
                    if (tripDate.getDay() == today.getDay()) {
                      if (tripDate.getYear() == today.getYear()) {
                        mr_trips.push(trip);
                        sec.pop(sec[i]);
                     }
                   }
                 }
                }
                dic[key_date] = mr_trips;
                last_five_trips.push(dic);
                dic={}
                console.log('adding ' + key_date)
               // last five trips: [ {date: date, trips: [trip1, trip2]} ]
              }
              $scope.data = {};
              $scope.data.slides = last_five_trips;
              $ionicSlideBoxDelegate.update();

              $scope.last_five_trips = last_five_trips;
              console.log('last_five_trips');
              console.log(last_five_trips);
              console.log('dic')
              console.log(dic)
              //$scope.trips = mr_trips;

          });
      });

    var getDateOfTrip = function(trip) {
      var today = new Date(trip.startTime.date);
      return ("" + today.getMonth() + "/" + today.getDay() + "/" + today.getYear());
    }


    $scope.notSingleOrLast = function(index, list) {
      if (index == list.length-1) {
        return false;
      }
      else {
        return true;
      }

    };
    $scope.mapCreated = function(map) {
      console.log("maps here");
      console.log(map)
      $scope.map = map;
    };

    $scope.centerOnMe = function () {
      console.log("Centering");
      if (!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function (pos) {
        console.log('Got pos', pos);
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
      }, function (error) {
        alert('Unable to get location: ' + error.message);
      });
    };

    $scope.getDisplayName = function(item) {
    var coordinatesString = item["trackPoints"][0]["coordinate"][1] + "," + item["trackPoints"][0]["coordinate"][0]
    var xmlHttp = new XMLHttpRequest();
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinatesString + "&key=AIzaSyD8BQ3-gIFLsqR324AmQfGK6wCSauVAcEo"
    console.log(url)
    xmlHttp.open("GET", url, false);
    xmlHttp.send();
    var address_components = JSON.parse(xmlHttp.response)["results"][0]["address_components"];
    var name = ""
    for (var i = 0; i < address_components.length; i++) {
      var component = address_components[i]
      var types = component["types"]
      if (types.indexOf("neighborhood") > -1) {
        name = component["short_name"];
        break;
      } else if (types.indexOf("establishment") > -1) {
        name = component["short_name"];
        break;
      } else if (types.indexOf("locality") > -1) {
        name = component["short_name"];
        break;
      }
    }
    return name
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
  }

    $scope.pickImage = function(item){
        if (item.predictedMode != null) {
            var item_mode = item.predictedMode;
        } else {
            var item_mode = item.autoMode;
        }

    	if (item_mode == 'walking') {
    		return 'img/walking.jpg';
    	} if (item_mode == 'car') {
    		return 'img/car.jpg';
    	} if (item_mode == 'cycling') {
            return 'img/cycling.jpg';
        } if (item_mode == 'air') {
            return 'img/air.jpg';
        } if (item_mode == 'bus') {
            return 'img/bus.jpg';
        } if (item_mode == 'train') {
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
      var endLat = points[points.length-1]["coordinate"][1]
      var endLng = points[points.length-1]["coordinate"][0]
      $scope.startMarker = new google.maps.Marker({
          position: new google.maps.LatLng(latitude,longitude),
          title:"Start"
      });
      $scope.startMarker.setMap($scope.map)
      $scope.endMarker = new google.maps.Marker({
          position: new google.maps.LatLng(endLat,endLng),
          title:"End"
      });
      $scope.endMarker.setMap($scope.map)
      $scope.map.setCenter({lat: latitude, lng:longitude})
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
    }

    //Change according to datatype in actual data object and the intervals set in the app.
    // Intervals: Green - confidence > 80 ; Yellow: 80 > confidence > 70; Red: 70 > confidence
    $scope.pickColor = function(item){
        if (item.confidence >= 0.9) {
            return "color : green";
        } else if (item.confidence >= 0.7) {
            return "color : orange";
        } else {
            return "color : red";
        }
    };





})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
