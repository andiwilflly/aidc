define([
	"multiselect"
], function() {

	return Backbone.View.extend({

		tagName: "div",

		// Set main layout of ICAD application here
		layout: $('#icad-content'),

		statusMsg: $('#icad-status-msg'),

		submitTemplate: createPath('ICAD/app/views/templates/partials/compare-submit.hbs'),
		datepickerTemplate: createPath('ICAD/app/views/templates/partials/compare-datepicker.hbs'),

		initialize: function() {
			this._reInitCustomSelect();
		},

		_compareByTemplate: function(templateId) {
			return createPath('ICAD/app/views/templates/compare-by/compare-by-' + templateId + '.hbs')
		},

		_reportingPeriodTemplate: function(templateId) {
			return createPath('ICAD/app/views/templates/partials/reporting-period/reporting-period-' + templateId + '.hbs')
		},

		_reportingTableTemplate: function(templateId) {
			return createPath('ICAD/app/views/templates/partials/reporting-table/reporting-table-' + templateId + '.hbs')
		},


		/**
		 * Use it before render new Backbone view
		 * This function  will remove all views except selected
		 *
		 * @param {string} views list of jQuery selectors that will not be clear
		 */
		_clearAllOtherViews: function(views) {
			views = views || '';
			this.layout.find('> div').not(views).html('');
		},


		/**
		 * Get data from server
		 *
		 * @param {string} url
		 * @param {object} data
		 * @param {function} callback function that runs on ajax success callback
		 * @returns {data} data object
		 */
		_getData: function(url, data, callback) {
			return $.ajax({
				type: "POST",
				url: url,
				data: data,
				async: true,
				success: function(data) {
					(!!data['filter']) ? data = data["filter"] : false; // TODO: get rid of this
					if (typeof callback === "function") {
						callback(data);
					}
					return data;
				}
			}).responseText;
		},


		/**
		 * Compile a template in JavaScript by using Handlebars.compile
		 *
		 * @param {string} template .hbs template html from ajax $.get
		 * @param {object} data object that can be parsed inside .hbs template
		 * @returns {html} html with data that can be rendered
		 */
		_getCompiledTemplate: function(template, data) {
			return (Handlebars.compile(template))(data)
		},


		/**
		 * Return return array of .hbs templates
		 * http://handlebarsjs.com/
		 *
		 * @param   {array} templatesList of pathes to hbs templates
		 * @returns {array} templatesDataArray of html templates
		 */
		_getTemplates: function(templatesList) {
			if (ICAD.DEBUG_MODE) {
				console.info('[BaseView]: _getTemplates()');
			}

			return (function _makeRequest(templatesList) {
				var templatesDataArray = [];
				$.each(templatesList, function(k, v) {
					templatesDataArray[k] = $.ajax({
						type: 'get',
						url: templatesList[k],
						async: false,
						success: function(data) {
							return data;
						}
					}).responseText;
				});
				return templatesDataArray;
			})(templatesList);
		},


		/**
		 * Callback for all changes of form-fields values
		 * This callback implement enble/disable logic
		 * Just add to el data-disabled-by="#select-market,#start-date .."
		 */
		_enableDisableFields: function(elements) {
			(ICAD.DEBUG_MODE) ? console.info('[BaseView]: _enableDisableFields()') : false;

			elements = elements || $('[data-disabled-by]');
			var res = true;

			elements.each(function() {
				var disabledEl = $(this);

				if (_check(disabledEl.attr('data-disabled-by').split(','))) {
					disabledEl.removeClass('is-disabled');
					if (disabledEl.is("select")) {
						disabledEl.multiselect('enable');
					}
				} else {
					disabledEl.addClass('is-disabled');
					if (disabledEl.is("select")) {
						disabledEl.multiselect('disable');
					}
				}

				function _check(arr) {
					$.each(arr, function(k, v) {

						if ($(v).val() == null || $(v).val() == '' || $(v).val() <= -2 || $(v).closest('.item-wrapper').hasClass('error-item-wrapper')) {
							res = false;
						}
						// Check datePicker inputs values
						if (v == "#start-date" || v == "#end-date") {
							var startDateMsg = $('#start-date').closest('.item-wrapper').find('.js-error-msg');
							var endDateMsg = $('#end-date').closest('.item-wrapper').find('.js-error-msg');
							if (!ICAD.validate.datepickerMask.test($(v).val())) {
								res = false;
							} else if (!!startDateMsg.text().length || !!endDateMsg.text().length) {
								res = false;
							}
						}
					});
					return res
				}
			});

			return res;
		},


		/**
		 * Set field values of [compare-by form]
		 * Get field values from [reportModel:request] field
		 */
		_setEditingFieldValues: function() {
			(ICAD.DEBUG_MODE) ? console.info('[BaseView]: _setEditingFieldValues()') : false;
			$.each(this.reportModel.attributes.requestObj, function(k, v) {
				if (k != "period") {
					(v.length != 0) ? $('[name="' + k + '"]').val(v) : false; // Set field values except of [period] checkbox
				}
			});
		},


		/**
		 * Export report to excel file
		 * @param   {object} event - event object
		 * @returns {*}
		 */
		submitExportToFileForm: function(event) {
			event.stopPropagation();
			var modelToSave = this.reportModel.collection.get(this.reportModel.id).toJSON();
			var fileNameInput = event.target.elements["tx_smianalytics_smianalytics[fileName]"];
			fileNameInput.value = ICAD.generateReportName(modelToSave);
		},


		/**
		 * Save aggregate or detailed report
		 * @param   {object} modelToSave - instance of Backbone ReportModel
		 * @returns {*}
		 */
		_saveReport: function(modelToSave) {
			var that = this;
			var saveReportButton = that.$el.find('#save-report-btn');
			var reportName = ICAD.generateReportName(modelToSave);

			delete modelToSave.router;

			// Need to disabled save report button
			saveReportButton.addClass('is-disabled');

			function _callback(data, errorClass) {
				errorClass = errorClass || '';
				var message = $('<div/>', {
					id: 'save-report-status-msg',
					class: 'save-report-status-msg ' + errorClass,
					html: data.message
				});
				saveReportButton.append(message);
				setTimeout(function() {
					saveReportButton.removeClass('is-disabled');
					saveReportButton.find('#save-report-status-msg').fadeOut(200, function() {
						saveReportButton.find('#save-report-status-msg').remove();
					});
				}, 1500);
			}

			// Remove [™] from the report name
			if (!!reportName.match('™'))
				reportName = reportName.replace('™', '');

			$.ajax({
				type: "POST",
				url: saveReportActionUri,
				data: {
					"tx_smianalytics_smianalytics": {
						name: reportName,
						model: JSON.stringify(modelToSave)
					}
				},
				success: function(data) {
					_callback(data);
				},
				error: function(data) {
					_callback(data, 'error');
				}
			});
		},


		_refreshFormDataObj: function(comapreId) {
			if (ICAD.DEBUG_MODE) {
				console.info('[BaseView]: _refreshFormDataObj()');
			}

			var that = this;
			$.ajax({
				type: "POST",
				url: selectsAjaxUri,
				data: {
					"tx_smianalytics_smianalytics": {
						market: parseInt(that.reportModel.attributes.requestObj.market),
						type: that.reportModel.attributes.compareId
					}
				},
				async: false,
				success: function(optionsArray) {
					if (that.reportModel.attributes.compareId == 'fmm' || that.reportModel.attributes.compareId == 'channel')
						that.reportModel.attributes.formData['select_' + comapreId] = optionsArray.filter;
					// Extend reportModel with additional fields like: market, deviceName ..
					ICAD.setAdditionalReportFields(that);
				}
			});
		},


		/**
		 * Customize form elements via:
		 * [UI datepicker]  http://jqueryui.com/datepicker
		 * [UI multiselect] http://www.erichynds.com/examples/jquery-ui-multiselect-widget
		 * [jScrollPane] http://jscrollpane.kelvinluck.com
		 */
		_setCustomFormsEl: function() {
			(ICAD.DEBUG_MODE) ? console.info('[BaseView]: _setCustomFormsEl()') : false;

			ICAD.multiselect.singleInit(this.$el.find(".js-custom-select"), this);
			ICAD.multiselect.multipleInit(this.$el.find(".js-custom-select-multiple"), this);
			/**
			 * Customize jQuery UI datepicker for select week and month
			 */
			if (this.$el.find(".js-datepicker").length) {
				ICAD.datepickerCustomize.week(this);
			}
			if(this.$el.find('.js-icad-radio').length) {
				this.$el.find('.js-icad-radio input').prettyCheckable();
			}
		},


		/**
		 * Toggle jQuery UI datepickers: from [per week] to [per month] and back
		 */
		changeDatepickerPeriod: function(e) {
			(ICAD.DEBUG_MODE) ? console.info('[BaseView]: changeDatepickerPeriod()') : false;
			ICAD.datepickerCustomize[$(e.currentTarget).attr('for')](this);
		},


		/**
		 * Change block of list multiselect selected items
		 */
		updateMultipleSelectList: function(el) {
			(ICAD.DEBUG_MODE) ? console.info('[BaseView]: updateMultipleSelectList()') : false;

			var listWrapper = el.parent().find(".multiple-select-list"),
				listContent = '',
				listEl,
				checkedValues = el.multiselect("getChecked").map(function() {
					return this;
				}).get();

			for (var i = 0, len = checkedValues.length; i < len; i++) {
				listContent += '<span class="multiple-select-list__value">' +
				               $.trim($(checkedValues[i]).attr("title")) +
				               '<a class="multiple-select-list__close" data-id="' +
				               $(checkedValues[i]).attr("id") + '">x</a>';
				if (i < len - 1) {
					listContent += '<span class="multiple-select-list__divider">|</span></span>';
				} else {
					listContent += '</span>';
				}
			}

			if (checkedValues.length > 0) {
				listWrapper.removeClass("is-disabled");
			}

			listWrapper.html(listContent);
			listEl = listWrapper.find("a");
			listEl.on("click", function(e) {
				e.preventDefault();
				$('#' + $(this).data("id")).trigger("click");
			});

			this._enableDisableFields();
		},


		/**
		 * Change multiSelect position on window resize event
		 */
		_reInitCustomSelect: function() {
			if (ICAD.DEBUG_MODE) {
				console.info('[BaseView]: _reInitCustomSelect()');
			}
			var that = this;
			ICAD.onWindowResize(function() {
				that.$el.find(".js-custom-select, .js-custom-select-multiple").multiselect("position");
			}, 100);
		}
	});
});