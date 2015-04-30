angular.module('starter.controllers', [])

.controller('TripsCtrl', function($scope) {})

.controller('RecsCtrl', function($scope, Chats) {
  $scope.data = {
    "filter" : 'cat',
    "animals": [
      {
        type : "cat",
        name : "Persian"
      },
      {
        type : "cat",
        name : "Siamese"
      },
      {
        type : "dog",
        name : "Labrador"
      },
      {
        type : "dog",
        name : "Mallamute"
      },
      {
        type : "bird",
        name : "Cockateel"
      },
      {
        type : "bird",
        name : "Parrot"
      },
      {
        type : "bird",
        name : "Starling"
      }
    ]
  };
})

.controller('ResultsCtrl', function($scope, $ionicModal) {
  $scope.contacts = [
    { name: 'Gordon Freeman' },
    { name: 'Barney Calhoun' },
    { name: 'Lamarr the Headcrab' },
  ];

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createContact = function(u) {        
    $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
    $scope.modal.hide();
  };
});

