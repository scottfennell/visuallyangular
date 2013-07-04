'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('ghVisualization', [function(){
		// constants
		var margin = 20,
				width = 960,
				height = 500 - .5 - margin,
				color = d3.interpolateRgb("#f77", "#77f");

		return {
			restrict: 'E',
			scope: {
				val: '=',
				grouped: '='
			},
			link: function(scope, element, attrs) {

				// set up initial svg object
				var vis = d3.select(element[0])
						.append("svg")
						.attr("width", width)
						.attr("height", height + margin + 100);

				scope.$watch('val', function(newVal, oldVal) {if(newVal && newVal !== oldVal){
					
					// clear the elements inside of the directive
					vis.selectAll('*').remove();

					// if 'val' is undefined, exit

					// Based on: http://mbostock.github.com/d3/ex/stack.html
					var n = newVal.length, // number of layers
							m = newVal[0].length, // number of samples per layer
							data = d3.layout.stack()(newVal);

					var mx = m,
					my = d3.max(data, function(d) {
						return d3.max(d, function(d) {
							return d.y0 + d.y;
						});
					}),
					mz = d3.max(data, function(d) {
						return d3.max(d, function(d ) {
							return d.y;
						});
					}),
					x = function(d) {
						return d.x * width / mx;
					},
					y0 = function(d) {
						var r = height - d.y0 * height / my;						
						return r;
					},
					y1 = function(d) {
						return height - (d.y + d.y0) * height / my;
					},
					y2 = function(d) {
						return d.y * height / mz;
					}; // or `my` not rescale

					// Layers for each color
					// =====================

					var layers = vis.selectAll("g.layer")
							.data(data)
							.enter().append("g")
							.style("fill", function(d, i) {
								return color(i / (n - 1));
							})
							.attr("class", "layer");

					// Bars
					// ====

					var bars = layers.selectAll("g.bar")
							.data(function(d) {
								return d;
							})
							.enter().append("g")
							.attr("class", "bar")
							.attr("transform", function(d) {
								return "translate(" + x(d) + ",0)";
							});

					bars.append("rect")
							.attr("width", x({x: 0.9}))
							.attr("x", 0)
							.attr("y", height)
							.attr("height", 0)
							.transition()
							.delay(function(d, i) {
								return i * 10;
							})
							.attr("y", y1)
							.attr("height", function(d) {
								return y0(d) - y1(d);
							});

					// X-axis labels
					// =============

					var labels = vis.selectAll("text.label")
							.data(data[0])
							.enter().append("text")
							.attr("class", "label")
							.attr("x", x)
							.attr("y", function(d,i){
								var barHeight = y0(d)-y1(d);
								console.log("Bar height "+barHeight+ " - "+height+" - date "+d.date);
								if(barHeight>0){
									console.log("bar");
								}
								return height - barHeight;
								//var h = height + 6;
								//return h-((i%10)*12);
								
							})
							.attr("dx", x({x: .45}))
							.attr("dy", ".11em")
							.attr("text-anchor", "middle")
							.text(function(d, i) {
								var res = d.date;
								if(d.user){
									res += "("+d.user+")"
								}
								return res;
							});

					// Chart Key
					// =========

					var keyText = vis.selectAll("text.key")
							.data(data)
							.enter().append("text")
							.attr("class", "key")
							.attr("y", function(d, i) {
						return height + 42 + 30 * (i % 3);
					})
							.attr("x", function(d, i) {
						return 155 * Math.floor(i / 3) + 15;
					})
							.attr("dx", x({x: .45}))
							.attr("dy", ".71em")
							.attr("text-anchor", "left")
							.text(function(d, i) {
						return d[0].user;
					});

					var keySwatches = vis.selectAll("rect.swatch")
							.data(data)
							.enter().append("rect")
							.attr("class", "swatch")
							.attr("width", 20)
							.attr("height", 20)
							.style("fill", function(d, i) {
						return color(i / (n - 1));
					})
							.attr("y", function(d, i) {
						return height + 36 + 30 * (i % 3);
					})
							.attr("x", function(d, i) {
						return 155 * Math.floor(i / 3);
					});


					// Animate between grouped and stacked
					// ===================================

					var transitionGroup = function transitionGroup() {
						vis.selectAll("g.layer rect")
								.transition()
								.duration(500)
								.delay(function(d, i) {
									return (i % m) * 10;
								})
								.attr("x", function(d, i) {
									return x({x: .9 * ~~(i / m) / n});
								})
								.attr("width", x({x: .9 / n}))
								.each("end", transitionEnd);

						function transitionEnd() {
							d3.select(this)
									.transition()
									.duration(500)
									.attr("y", function(d) {
										return height - y2(d);
									})
									.attr("height", y2);
						}
					}

					var transitionStack = function transitionStack() {
						vis.selectAll("g.layer rect")
								.transition()
								.duration(500)
								.delay(function(d, i) {
									return (i % m) * 10;
								})
								.attr("y", y1)
								.attr("height", function(d) {
									return y0(d) - y1(d);
								})
								.each("end", transitionEnd);

						var transitionEnd = function () {
							d3.select(this)
									.transition()
									.duration(500)
									.attr("x", 0)
									.attr("width", x({x: .9}));
						}
					}

					// reset grouped state to false
					scope.grouped = false;

					// setup a watch on 'grouped' to switch between views
					scope.$watch('grouped', function(newVal, oldVal) {
						// ignore first call which happens before we even have data from the Github API
						if (newVal === oldVal) {
							return;
						}
						if (newVal) {
							transitionGroup();
						} else {
							transitionStack();
						}
					});
				}});
			}
		}

  
  
  }])
  .directive('ghGraph', [function(){
	return {
		restrict: 'E',
		scope: {
			val: '=',
			grouped: '='
		},
		link: function(scope, element, attrs) {	
			
			
			var width = 960,
			height = 500;

			var color = d3.scale.category20();

			var force = d3.layout.force()
				.charge(-120)
				.linkDistance(30)
				.size([width, height]);

			var svg = d3.select(element[0]).append("svg")
				.attr("width", width)
				.attr("height", height);
			
			
			$scope.$watch('data',function(newVal,oldVal){
				if(newVal !== oldVal){
					setData(newVal);
				}
			})
			
			
			var setData = function(graph) {
				force
					.nodes(graph.nodes)
					.links(graph.links)
					.start();

				var link = svg.selectAll(".link")
					.data(graph.links)
				  .enter().append("line")
					.attr("class", "link")
					.style("stroke-width", function(d) { return Math.sqrt(d.value); });

				var node = svg.selectAll(".node")
					.data(graph.nodes)
				  .enter().append("circle")
					.attr("class", "node")
					.attr("r", 5)
					.style("fill", function(d) { return color(d.group); })
					.call(force.drag);

				node.append("title")
					.text(function(d) { return d.name; });

				force.on("tick", function() {
				  link.attr("x1", function(d) { return d.source.x; })
					  .attr("y1", function(d) { return d.source.y; })
					  .attr("x2", function(d) { return d.target.x; })
					  .attr("y2", function(d) { return d.target.y; });

				  node.attr("cx", function(d) { return d.x; })
					  .attr("cy", function(d) { return d.y; });
				});
			}
			
			
		}
	}	
  }])
;
