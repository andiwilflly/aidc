define([
	"BaseView",
	// vendor
	"selectbox",
	"scrollpane"
], function(BaseView, charts) {

	return BaseView.extend({

		el: '#reporting-view',

		events: {
			"change #select-report-chart": "changeReportingChart",
			"submit form#exportToFile": "submitExportToFileForm"
		},

		template: createPath('ICAD/app/views/templates/reporting.hbs'),

		render: function(params) {
			if (ICAD.DEBUG_MODE) { console.info('[reportingView]: render()'); }

			this.statusMsg.html('Quick access reports'); // Update ICAD status mgs

			this.reportModel = params.reportModel;

			// Set is detailed report flag to [false]
			this.reportModel.set('isDetailed', false);

			var that = this;
			// Extend reportModel with additional fields like: market, deviceName ..
			ICAD.setAdditionalReportFields(that);

			var templatesArray = that._getTemplates([
				this.template,
				this._reportingPeriodTemplate(this.reportModel.get('compareId')),
				this._reportingTableTemplate(this.reportModel.get('compareId'))
			]);
			that._clearAllOtherViews();

			// TODO: Can we move this to base view?
			//Move "Custom FMM" and "No FMM" to the end of report model data
			var resArr = [];
			var lastValArr = [];
			$.each(that.reportModel.toJSON().data.report.data, function(k, v) {
				if (v.objectId != 0 && v.objectId != -1) {
					resArr.push(v);
				} else {
					lastValArr.push(v);
				}
			});
			$.each(lastValArr, function(k, v) {
				resArr.push(v);
			});
			that.reportModel.toJSON().data.report.data = resArr;

			this.$el.html(this._getCompiledTemplate(templatesArray[0], {
				reportModel:       that.reportModel.toJSON(),
				reportingPeriod:   that._getCompiledTemplate(templatesArray[1], {reportModel: that.reportModel.toJSON()}),
				reportingTable:    that._getCompiledTemplate(templatesArray[2], {reportModel: that.reportModel.toJSON()}),
				formActionUriXlsx: window.formActionUriXlsx
			}));
			this.afterRender();
		},

		afterRender: function() {
			if (ICAD.DEBUG_MODE) { console.info('[reportingView]: afterRender()'); }

			var selectReportChartVal = this.$el.find("#select-report-chart option:first-child").val(),
				that = this,
				requestStr = that.reportModel.toJSON().request,
				chart = ICAD.getParameterByName('chart', requestStr);

			if (!!chart) {
				selectReportChartVal = chart;
				this.$el.find("#select-report-chart").val(selectReportChartVal);
			}

			// Update current reportModel report chart value
			this.reportModel.set({selectReportChartVal: this.$el.find("#select-report-chart option:selected").text()});

			this._setCustomFormsEl();  // Customize form elements
			require(["Helpers/charts"], function(charts) {
				charts.buildChart({
					$el: that.$el.find("#reporting-chart"),
					$elR: that.$el.find("#reporting-chart-range"),
					series: selectReportChartVal,
					data: that.reportModel.toJSON().data.report.data
				});
			});
		},

		changeReportingChart: function() {
			if (ICAD.DEBUG_MODE) { console.info('[reportingView]: changeReportingChart()'); }

			var selectReportChartVal = this.$el.find("#select-report-chart option:selected").val(),
				that = this,
				requestStr = that.reportModel.toJSON().request,
				chart = ICAD.getParameterByName('chart', requestStr),
				navigateStr = "reporting/show/" + that.reportModel.toJSON().compareId + "/" + that.reportModel.id;

			// Update current reportModel report chart value
			this.reportModel.set({selectReportChartVal: this.$el.find("#select-report-chart option:selected").text()});

			if (!!chart) {
				navigateStr = ICAD.updateQueryStringParameter(navigateStr, 'chart', selectReportChartVal);
			} else {
				navigateStr += "&chart=" + selectReportChartVal;
			}

			that.reportModel.toJSON().router.navigate(navigateStr); // Update current location hash params
			require(["Helpers/charts"], function(charts) {
				charts.buildChart({
					$el:    that.$el.find("#reporting-chart"),
					$elR:   that.$el.find("#reporting-chart-range"),
					series: selectReportChartVal,
					data:   that.reportModel.toJSON().data.report.data
				});
			});
		}
	});
});
