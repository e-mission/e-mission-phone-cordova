// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.overlaysWebView(true);
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  var waitFn = function($q) {
      var deferred = $q.defer();
      ionic.Platform.ready(function() {
          console.log('ionic.Platform.ready');
          // We don't actually resolve with anything, because we don't need to return
          // anything. We just need to wait until the platform is
          // ready and at that point, we can use our usual window.sqlitePlugin stuff
          deferred.resolve();
      });
      return deferred.promise;
  }
  $stateProvider
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'appCtrl'
  })

/*
  .state('app.log', {
    url: "/log",
    views: {
      'menuContent': {
        templateUrl: "templates/log.html"
        // controller: 'logCtrl'
      }
    }
  })
*/

  .state('app.sensedData', {
    url: "/sensor-data",
    views: {
      'menuContent': {
        templateUrl: "templates/sensedData.html",
        resolve: {
            cordova: waitFn
        },
        controller: 'sensedDataCtrl'
      }
    }
  })
    .state('app.map', {
      url: "/map",
      views: {
        'menuContent': {
          templateUrl: "templates/map.html",
          resolve: {
              cordova: waitFn
          },
          // controller: 'mapCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/sensor-data');
});
