angular.module('starter.controllers', [])

.controller('appCtrl', function($scope, $ionicModal, $timeout) {
    $scope.openNativeSettings = function() {
        console.log("about to open native settings");
        window.cordova.plugins.BEMLaunchNative.launch("NativeSettings", function(result) {
            console.log("Successfully opened screen NativeSettings, result is "+result);
        }, function(err) {
            console.log("Unable to open screen NativeSettings because of err "+err);
        });
    }
})
     
.controller('logCtrl', function($scope) {
})
   
.controller('sensedDataCtrl', function($scope) {
    var currentStart = 0;
    $scope.entries = [];

    /* Let's keep a connection to the database open */

    var db = window.sqlitePlugin.openDatabase({
      name: "userCacheDB",
      location: 2,
      createFromLocation: 1
    });

  $scope.addEntries = function() {
    UserCacheHelper.getMessages(db, "statemachine/transition", function(entryList) {
      $scope.$apply(function() {
          for (i = 0; i < entryList.length; i++) {
            // $scope.entries.push({metadata: {write_ts: 1, write_fmt_time: "1"}, data: "1"})
            var currEntry = entryList[i];
            currEntry.data = JSON.stringify(JSON.parse(currEntry.data), null, 2);
            console.log("currEntry.data = "+currEntry.data);
            $scope.entries.push(currEntry);
          }
      })
    })
  }

  $scope.addEntries();
  /*
    UserCacheHelper.getMessages("statemachine/transition",
        function(entryArray){
        });)
    */
})
   
.controller('mapCtrl', function($scope) {

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

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
