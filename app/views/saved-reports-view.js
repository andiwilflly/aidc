define([
	"BaseView",
	"ReportModel"
], function(BaseView, ReportModel) {

	return BaseView.extend({

		el: '#saved-reports-view',

		template: createPath('ICAD/app/views/templates/saved-reports.hbs'),

		tooltipTemplate: createPath('ICAD/app/views/templates/partials/saved-reports-tooltip.hbs'),

		events: {
			'click .js-remove-saved-trash': '_showConfirmation',
			'click .js-remove-cancel-btn': '_hideConfirmation',
			'click .js-remove-saved-report-btn': '_removeSavedReport'
		},


		initialize: function() {
			if (!this.optionsArray) {
				this.optionsArray = [];
			}
		},


		render: function(params) {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: render()');
			}

			this.router = params.router;

			this.savedReports = 0; // There is no saved reports as default

			ICAD.loader.show();

			var that = this;
			$.ajax({
				type: "POST",
				url: reportListActionUri,
				success: function(data) {
					// Get savedReports list
					if (data['savedReports'].length != 0) {
						that.savedReports = [];
						$.each(data['savedReports'], function(k, v) {
							v.model = JSON.parse(v.model);
							that.savedReports[k] = v;
						});
					}
					that._createSavedReportsList();
				}
			});
		},


		afterRender: function() {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: afterRender()')
			}

			var that = this;

			function _getOptionsArray(count) {
				var report = that.savedReports[count];

				if (!that.optionsArray[report.model.compareId]) {
					$.ajax({
						url: selectsAjaxUri,
						type: "POST",
						data: {
							"tx_smianalytics_smianalytics": {
								showAll: 1, // Get all filters parameter
								market: report.model.requestObj.market,
								type: report.model.compareId
							}
						},
						async: true,
						success: function(optionsArray) {
							that.optionsArray[report.model.compareId] = optionsArray; // Cache [optionsArray] data
							_restoreModel(count, optionsArray);
						}
					});
				} else {
					_restoreModel(count, that.optionsArray[report.model.compareId]);
				}
			}

			function _restoreModel(count, optionsArray) {
				var report = that.savedReports[count];

				// Get current selected filters of [this.savedReport] from [this.optionsArray]
				that._addSelectedFilters(report, optionsArray);

				report.model.router = that.router;
				var reportModel = new ReportModel(report.model);
				if (that.router.reportsCollection.get(reportModel.id) == undefined)
					that.router.reportsCollection.add(reportModel);

				// Call _getOptionsArray() recursive..
				if (count < that.savedReports.length - 1) {
					_getOptionsArray(count + 1);
				} else {
					that._createTooltip();
				}
			}

			if (that.savedReports) {
				// Restore all saved [reportModel`s] and add them to [reportsCollection]
				_getOptionsArray(0);
			} else {
				ICAD.loader.hide();
			}
		},


		_createSavedReportsList: function() {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _createSavedReportsList()')
			}

			var that = this;
			that._clearAllOtherViews('#reports-list-view');
			if (!that.templateHTML) {
				$.get(this.template, function(template) {
					that.templateHTML = template;

					that.$el.html(that._getCompiledTemplate(template, {savedReports: that.savedReports}));
					that.afterRender(that.savedReports);
				});
			} else {
				that.$el.html(that._getCompiledTemplate(that.templateHTML, {savedReports: that.savedReports}));
				that.afterRender(that.savedReports);
			}
		},


		_createTooltip: function() {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _createTooltip()')
			}

			// Load jQuery UI tooltip partial
			var that = this;
			$.get(that.tooltipTemplate, function(tooltipHTML) {

				that.$el.find(".js-saved-list-item").tooltip({
					position: {my: "left bottom", at: "right+10 bottom", of: "#fixed-tooltip-helper"},
					show: {delay: 400},
					open: function(event, ui) {
						// Find current model in savedReports list
						var reportNumber = _.findWhere(that.savedReports, {name: $(event.currentTarget).data('name')}).number;
						var reportModel = _.findWhere(that.savedReports, {name: $(event.currentTarget).data('name')}).model;

						// Set position of tooltip
						that.$el.find(".js-saved-list-item").tooltip("option", "within", $(event.currentTarget));

						// Change fmm compareId to uppercase
						reportModel.compareId = (reportModel.compareId == "fmm") ? 'FMM' : reportModel.compareId;

						// Update content of jQuery UI tooltip message
						$(ui.tooltip[0]).html(that._getCompiledTemplate(tooltipHTML, {reportModel: reportModel, reportNumber: reportNumber}));
					}
				});
				ICAD.loader.hide();
			});
		},


		_addSelectedFilters: function(report, optionsArray) {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _addSelectedFilters()')
			}

			optionsArray = optionsArray.filter;

			var optionsArrays = ICAD.getFormFields(report.model.compareId);
			var currentOptionsArray = (optionsArray.length) ? optionsArray : optionsArrays['select_' + report.model.compareId];
			var _filters = report.model.requestObj[report.model.compareId + '[]'] || false;
			if (_filters) {
				if (typeof _filters != 'object') {
					_filters = [_filters]
				} // If there is just one filter - need to convert this filter to array

				report.model.selectedFilters = [];
				$.each(_filters, function(k, filter) {
					filter = (!!filter.match(/^[-]?[0-9]+$/)) ? parseInt(filter) : filter; // Check if current filter is number
					report.model.selectedFilters[k] = _.findWhere(currentOptionsArray, {value: filter});
				});
			}
		},


		_showConfirmation: function(e) {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _showConfirmation()')
			}

			var $trash = $(e.currentTarget);
			$trash.fadeOut(200, function() {
				$trash.parent().animate({
					width: '28%'
				}, 400, function() {
					$trash.parent().find('.js-remove-saved-confirmation').fadeIn(200);
				});
				$trash.closest('.js-saved-list-item').find('.js-saved-list-link').animate({
					width: '72%'
				}, 400);
			});
		},


		_hideConfirmation: function(e) {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _hideConfirmation()')
			}

			var $confirm = $(e.currentTarget).parent();
			$confirm.fadeOut(200, function() {
				$confirm.parent().css('width', '5%');
				$confirm.closest('.js-saved-list-item').find('.js-saved-list-link').animate({
					width: '95%'
				}, 400, function() {
					$confirm.parent().find('.js-remove-saved-trash').fadeIn(200);
				});
			});
		},


		_removeSavedReport: function(e) {
			if (ICAD.DEBUG_MODE) {
				console.info('[savedReportsView]: _removeSavedReport()')
			}

			ICAD.loader.show();

			var that = this;
			var reportUid = $(e.currentTarget).data('reportuid');
			$.ajax({
				type: "POST",
				url: deleteReportActionUri,
				data: {
					"tx_smianalytics_smianalytics": {
						report: reportUid
					}
				},
				success: function() {
					ICAD.loader.hide();
					// $.growl.notice({ title: 'Success', message: "Report was removed successfully" });
				}, error: function() {
					ICAD.loader.hide();
				}
			});

			// Hide current DOM element
			$(e.currentTarget).closest('.js-saved-list-item').slideUp(300, function() {
				$(this).remove();
				if (!that.$el.find('#saved-list li').length) {
					that.render({router: that.router}); // Refresh saved-report-view [#saved-list] html
				}
			});
		}
	});
});

