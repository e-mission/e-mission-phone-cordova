angular.module('starter.controllers', [])

.controller('appCtrl', function($scope, $ionicModal, $timeout) {
    alert("creating the main app ctrl");
    $scope.openNativeSettings = function() {
        alert("about to open native settings");
        window.cordova.plugins.BEMLaunchNative.launch("NativeSettings", function(result) {
            alert("Successfully opened screen NativeSettings, result is "+result);
        }, function(err) {
            alert("Unable to open screen NativeSettings because of err "+err);
        });
    }
})
     
.controller('logCtrl', function($scope) {

})
   
.controller('sensedDataCtrl', function($scope) {

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
