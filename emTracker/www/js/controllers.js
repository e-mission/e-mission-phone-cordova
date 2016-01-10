angular.module('starter.controllers', [])

.controller('appCtrl', function($scope, $ionicModal, $timeout) {
    $scope.openNativeSettings = function() {
        window.Logger.log(window.Logger.LEVEL_DEBUG, "about to open native settings");
        window.cordova.plugins.BEMLaunchNative.launch("NativeSettings", function(result) {
            window.Logger.log(window.Logger.LEVEL_DEBUG,
                "Successfully opened screen NativeSettings, result is "+result);
        }, function(err) {
            window.Logger.log(window.Logger.LEVEL_ERROR,
                "Unable to open screen NativeSettings because of err "+err);
        });
    }
})
     
.controller('logCtrl', function($scope) {
    alert("Launching logCtr");
    var RETRIEVE_COUNT = 20;
    $scope.logCtrl = {};

    $scope.refreshEntries = function() {
        window.Logger.getMaxIndex(function(maxIndex) {
            $scope.logCtrl.currentStart = maxIndex;
            $scope.logCtrl.gotMaxIndex = true;
            $scope.logCtrl.reachedEnd = false;
            $scope.entries = [];
            $scope.addEntries();
        }, function (e) {
            var errStr = "While getting max index "+JSON.stringify(e, null, 2);
            console.log(errStr);
            alert(errStr);
        });
    }

    $scope.moreDataCanBeLoaded = function() {
        return $scope.logCtrl.gotMaxIndex && !($scope.logCtrl.reachedEnd);
    }

    $scope.clear = function() {
        window.Logger.clearAll();
        window.Logger.log(window.Logger.LEVEL_INFO, "Finished clearing entries from unified log");
        $scope.refreshEntries();
    }

    $scope.addEntries = function() {
        alert("calling addEntries");
        window.Logger.getMessagesFromIndex($scope.logCtrl.currentStart, RETRIEVE_COUNT,
            function(entryList) {
                $scope.$apply($scope.processEntries(entryList));
                console.log("entry list size = "+$scope.entries.length);
                console.log("Broadcasting infinite scroll complete");
                $scope.$broadcast('scroll.infiniteScrollComplete')
            }, function(e) {
                var errStr = "While getting messages from the log "+JSON.stringify(e, null, 2);
                console.log(errStr);
                alert(errStr);
            }
        )
    }

    $scope.processEntries = function(entryList) {
        for (i = 0; i < entryList.length; i++) {
            var currEntry = entryList[i];
            $scope.entries.push(currEntry);
        }
        if (entryList.length == 0) {
            console.log("Reached the end of the scrolling");
            $scope.logCtrl.reachedEnd = true;
        } else {
            $scope.logCtrl.currentStart = entryList[entryList.length-1].ID
            console.log("new start index = "+$scope.logCtrl.currentStart);
        }
    }

    $scope.refreshEntries();
})
   
.controller('sensedDataCtrl', function($scope) {
    var currentStart = 0;

    $scope.config = {}
    $scope.config.key_data_mapping = {
        "Transitions": {
            fn: UserCacheHelper.getMessages,
            key: "statemachine/transition"
        },
        "Locations": {
            fn: UserCacheHelper.getSensorData,
            key: "background/location"
        },
        "Motion Activity": {
            fn: UserCacheHelper.getSensorData,
            key: "background/motion_activity"
        },
    }

    $scope.config.keys = []
    for (key in $scope.config.key_data_mapping) {
        $scope.config.keys.push(key);
    }

    $scope.selected = {}
    $scope.selected.key = $scope.config.keys[0]

    $scope.setSelected = function() {
      $scope.updateEntries();
    } 

    /* Let's keep a connection to the database open */

    var db = window.sqlitePlugin.openDatabase({
      name: "userCacheDB",
      // location: 2,
      createFromLocation: 1
    });

  $scope.updateEntries = function() {
    if (angular.isUndefined($scope.selected.key)) {
        usercacheFn = UserCacheHelper.getMessages;
        usercacheKey = "statemachine/transition";
    } else {
        usercacheFn = $scope.config.key_data_mapping[$scope.selected.key]["fn"]
        usercacheKey = $scope.config.key_data_mapping[$scope.selected.key]["key"]
    }
    usercacheFn(db, usercacheKey, function(entryList) {
      $scope.entries = [];
      $scope.$apply(function() {
          for (i = 0; i < entryList.length; i++) {
            // $scope.entries.push({metadata: {write_ts: 1, write_fmt_time: "1"}, data: "1"})
            var currEntry = entryList[i];
            currEntry.data = JSON.stringify(JSON.parse(currEntry.data), null, 2);
            window.Logger.log(window.Logger.LEVEL_DEBUG,
                "currEntry.data = "+currEntry.data);
            $scope.entries.push(currEntry);
            // This should really be within a try/catch/finally block
            $scope.$broadcast('scroll.refreshComplete');
          }
      })
    })
  }

  $scope.updateEntries();
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
