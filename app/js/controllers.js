'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])
  .controller('D3Ctrl', ['$scope', 'github', function($scope,github) {
	$scope.grouped = false;
	$scope.message = "This is from the d3 controller";
	var GitHub = github.get('twitter','bootstrap');
	var data = GitHub.getData('graph');
	data.then(function(formatted){
		$scope.data = formatted;
	})
	
  
  
  
  
  
  
  
  

  }]);
  