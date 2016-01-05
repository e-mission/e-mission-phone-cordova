// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter',['ionic', 'starter.controllers', 'starter.directives', 'leaflet-directive', 'nvd3ChartDirectives'])

.config(function($ionicConfigProvider) {
  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    /*
     BEGIN DEVICE VERSION
    var db = window.sqlitePlugin.openDatabase({name: "userCacheDB", location: 0, createFromLocation: 1});
    UserCacheHelper.getDocument(db, "diary/trips", function(tripListArray) {
        console.log("In main, tripListArray has = "+tripListArray.length+" entries");
        tripListStr = tripListArray[0];
        tripList = JSON.parse(tripListStr)
        console.log("In main, tripList has "+tripList.length+" entries");
        // console.log("In main, first entry is "+JSON.stringify(tripList[0]));
    });
    */
  });
})
