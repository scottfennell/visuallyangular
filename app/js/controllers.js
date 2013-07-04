'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])
  .controller('D3Ctrl', ['$scope', function($scope) {
  
	$scope.message = "This is from the d3 controller";
	console.log("Current scope", $scope);
  
  
  
  
  
  
  
  

  }]);
  