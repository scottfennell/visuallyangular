'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var myServiceModule = angular.module('myApp.services', []);

myServiceModule.value('version', '0.1');

myServiceModule.factory('github', ['$http', 
	function($http){
		
		var GitHubService = function() {
			
			this.user = 'angular';
			this.repo = 'angularjs';
			
		}
		
		GitHubService.prototype.getData = function(){
			
			$http({
				method: 'GET',
				url: 'https://api.github.com/repos/' +
						this.user +
						'/' +
						this.repo +
						'/commits'
			}).
					success(function(data) {
				// clear the error messages
				this.error = '';
				return this.reformatGithubResponse(data);
			}).
					error(function(data, status) {
				if (status === 404) {
					this.error = 'That repository does not exist';
				} else {
					this.error = 'Error: ' + status;
				}
			});
		};
		
		GitHubService.prototype.reformatGithubResponse = function(data) {
			// sort the data by author date (rather than commit date)
			data.sort(function (a, b) {
			  if (new Date(a.commit.author.date) > new Date(b.commit.author.date)) {
				return -1;
			  } else {
				return 1;
			  }
			});

			// date objects representing the first/last commit dates
			var date0 = new Date(data[data.length - 1].commit.author.date);
			var dateN = new Date(data[0].commit.author.date);

			// the number of days between the first and last commit
			var days = Math.floor((dateN - date0) / 86400000) + 1;

			// map authors and indexes
			var uniqueAuthors = []; // map index -> author
			var authorMap = {}; // map author -> index
			data.forEach(function (datum) {
			  var name = datum.commit.author.name;
			  if (uniqueAuthors.indexOf(name) === -1) {
				authorMap[name] = uniqueAuthors.length;
				uniqueAuthors.push(name);
			  }
			});

			// build up the data to be passed to our d3 visualization
			var formattedData = [];
			formattedData.length = uniqueAuthors.length;
			var i, j;
			for (i = 0; i < formattedData.length; i++) {
			  formattedData[i] = [];
			  formattedData[i].length = days;
			  for (j = 0; j < formattedData[i].length; j++) {
				formattedData[i][j] = {
				  x: j,
				  y: 0
				};
			  }
			}
			data.forEach(function (datum) {
			  var date = new Date(datum.commit.author.date);
			  var curDay = Math.floor((date - date0) / 86400000);
			  formattedData[authorMap[datum.commit.author.name]][curDay].y += 1;
			  formattedData[0][curDay].date = humanReadableDate(date);
			});

			// add author names to data for the chart's key
			for (i = 0; i < uniqueAuthors.length; i++) {
			  formattedData[i][0].user = uniqueAuthors[i];
			}

			return formattedData;
		};
		
		GitHubService.prototype.humanReadableDate = function (d) {
			return d.getUTCMonth() + '/' + d.getUTCDate();
		};
		
		
		return new GitHubService();
	}
]);