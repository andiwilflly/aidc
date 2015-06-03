define([
	"dxChartJs"
], function() {
	return {

		buildChart: function(params) {
			var colors = ['#1588bf', '#15bf2d'];
			var series = [];
			// Add indexes to [params.data array] objects
			$.each(params.data, function(key, val) {
				params.data[key].channelNum = key + 1;
			});
			var dataSource = ICAD.cloneObject(params.data),
				minRange = 0,
				maxRange = dataSource.length + 1,
				model = {},
				reportingChart = params.$el,
				chartRangeLimit = 10,
				legendWrapper = $(".reporting__chart-legend"),
				legendContent = "",
				tickInterval = 10,
				maxSeriaVal = 0;

			// Create [series] for chart from name of select
			$.each(params.series.split("-"), function(key, val) {

				// Get max value of seria
				var obj = _.max(dataSource, function(dataSource){ return dataSource[val]; });
				    if( obj[val] > maxSeriaVal ){
					    maxSeriaVal = obj[val];
				    }

				//var seriaName = val.replace("_", " ").replace(/^[a-z]/, function(m){ return m.toUpperCase() });
				var seriaName = val.split("_")[1];
				legendContent += '<span class="reporting__chart-seria">' +
				                 '<i class="svg" style="color:' + colors[key] + '"></i>' +
				                 seriaName +
				                 '</span>';
				series[key] = { valueField: val, name: seriaName, color: colors[key], argumentField: 'channelNum', label: { font: { color: colors[key] } } };
			});

			// Set tickeInterval for value axis
			if ( maxSeriaVal < 10 ) {
				tickInterval = 1;
			} else if ( 10 < maxSeriaVal < 100 ){
				tickInterval = 10;
			} else if ( 100 < maxSeriaVal < 1000 ){
				tickInterval = 100;
			} else if ( maxSeriaVal > 1000 ) {
				tickInterval = 1000;
			}

			legendWrapper.html(legendContent);

			model.chartOptions = {
				series: series,
				commonSeriesSettings: {
					type: "bar",
					label: {
						visible: true,
						format: "fixedPoint",
						precision: 0,
						verticalOffset: 13,
						font: {
							color: 'rgba(255,255,255,1)'
						},
						backgroundColor: 'transparent',
						customizeText: function(e) {
							return e.valueText;
						},
						showForZeroValues: true
					}
				},
				animation: {
					duration: 2000,
					easing: 'linear'
				},
				argumentAxis: {
					argumentType: 'numeric',
					valueMarginsEnabled: false,
					min: minRange,
					max: maxRange,
					tickInterval: 1,
					visible: true,
					color: 'rgba(68, 68, 68, 1)',
					width: 1,
					grid: {
						visible: false
					},
					label: {
						font: {
							color: 'rgba(68, 68, 68, 1)',
							size: 14,
							weight: 'bold'
						},
						overlappingBehavior: {
							mode: 'stagger'
						},
						customizeText: function() {
							if (this.value < minRange + 1 || this.value > maxRange - 1) {
								return '';
							} else {
								var values = false,
									that = this;

								$.each(params.series.split("-"), function(i, v) {
									if (dataSource[that.value - 1][v] > 0) {
										values = true;
									}
								});

								if (values == true) {
									return dataSource[this.value - 1].objectTitle;
								} else if (values == false) {
									return "<span style='color: rgba(204, 204, 204, 1)'>" + dataSource[this.value - 1].objectTitle + "</span>";
								}
							}
						}
					}
				},
				valueAxis: {
					min: 0,
					maxValueMargin: 0.2,
					tickInterval: tickInterval, // Todo set a variable which depends on the maximum value
					grid: {
						visible: true
					},
					showZero: true,
					visible: true,
					color: 'rgba(153, 153, 153, 1)',
					placeholderSize: 32
				},
				dataSource: dataSource,
				tooltip: {
					enabled: true,
					customizeText: function(e) {
						return dataSource[e.argumentText - 1].objectTitle + ' \n' + e.valueText;
					}
				},
				valueMarginsEnabled: true,
				legend: {
					visible: false
				}
			};

			model.rangeOptions = {
				dataSource: dataSource,
				chart: {
					commonSeriesSettings: {
						type: "area"
					},
					series: series
				},
				selectedRangeChanged: function(e) {
					var zoomedChart = $("#reporting-chart").dxChart("instance");
					zoomedChart.zoomArgument(Math.round(e.startValue), Math.round(e.endValue));
				},
				scale: {
					startValue: minRange,
					endValue: maxRange,
					majorTickInterval: 1,
					minorTickInterval: 1,
					showMinorTicks: false,
					label: {
						customizeText: function(value) {
							if (minRange < value.value && value.value < maxRange) {
								return dataSource[value.value - 1].objectTitle;
							} else {
								return '';
							}
						},
						format: 'fixedPoint'
					}
				},
				selectedRange: {
					startValue: 0,
					endValue: chartRangeLimit + 1
				},
				size: {
					height: 100,
					width: 1085
				},
				margin: {
					left: 32
				},
				behavior: {
					animationEnabled: true,
					snapToTicks: true,
					allowSlidersSwap: true
				},
				sliderMarker: {
					format: 'fixedPoint'
				}
			};

			function _buildreportingChartRange() {
				var reportingChartRange = params.$elR;

				if (reportingChartRange.html()) {
					reportingChartRange.remove();
					reportingChart.after("<div id='reporting-chart-range'></div>");
					reportingChartRange = $("#reporting-chart-range");
				}
				reportingChartRange.dxRangeSelector(model.rangeOptions);
			}

			reportingChart.css({ visibility: "hidden", opacity: 0});

			ICAD.loader.show($('#reporting-chart'));
			if (params.data.length > chartRangeLimit) {
				model.chartOptions.done = function() {
					var zoomedChart = reportingChart.dxChart("instance");
					zoomedChart.zoomArgument(model.rangeOptions.selectedRange.startValue, model.rangeOptions.selectedRange.endValue);
					reportingChart.css({ visibility: "visible" }).animate({ opacity: 1 }, 1000, function() {
						(ICAD.DEBUG_MODE) ? console.info('[chart.js]: buildChart()') : false ;
						ICAD.loader.hide();
						$('#change-request').removeClass('is-disabled');
					});
				};
			} else {
				reportingChart.css({ visibility: "visible" }).animate({ opacity: 1 }, 2000, function() {
					(ICAD.DEBUG_MODE) ? console.info('[chart.js]: buildChart()') : false ;
					ICAD.loader.hide();
					$('#change-request').removeClass('is-disabled');
				});
			}

			reportingChart.dxChart(model.chartOptions);

			if (params.data.length > chartRangeLimit) {
				_buildreportingChartRange();
			}
		}
	}
});