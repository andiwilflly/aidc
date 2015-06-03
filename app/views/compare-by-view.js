define([
	"BaseView",
	"ReportModel",
    "prettyCheckable"
], function(BaseView, ReportModel) {

	return BaseView.extend({

		el: '#compare-by-view',

		events: {
			"change   select": 'onSelectChange',
			"change   input": 'onInputChange',
			"submit   #compare-request-form": 'sendCompareRequest',
			"click   .js-icad-radio label": 'changeDatepickerPeriod',
			"keyup   .js-datepicker": 'onDatePickerChange'
		},

		initialize: function(params) {
			this.router = params.router;
			this.collection = params.collection;

			// Refresh [multiselect] position on window resize event
			this._reInitCustomSelect();

			this.listenTo(this, '_enableDisableFields', this._enableDisableFields);
		},

		render: function(params) {
			if (ICAD.DEBUG_MODE) {
				console.info('[compareByView]: render()');
			}

			this.statusMsg.html('Quick access reports'); // Update ICAD status mgs
			this.compareId = params.compareId;
			// Return object with form fields that can be compiled inside hbs template
			this.formData = ICAD.getFormFields(this.compareId);

			var templatesArray = this._getTemplates([
				this._compareByTemplate(this.compareId),
				this.datepickerTemplate
			]);
			this._clearAllOtherViews();
			this.$el.html(this._getCompiledTemplate(templatesArray[0], {
				formData: this.formData,
				datePicker: this._getCompiledTemplate(templatesArray[1], {compareId: this.compareId})
			}));

			this.afterRender({});
		},

		renderForEditing: function(params) {
			(ICAD.DEBUG_MODE) ? console.info('[compareByView]: renderForEditing() ') : false;

			this.statusMsg.html('Quick access reports'); // Update ICAD status mgs
			this.reportModel = this.collection.get(params.modelId);
			this.compareId = this.reportModel.attributes.compareId;
			// Return object with form fields that can be compiled inside hbs template
			this.formData = ICAD.getFormFields(this.compareId);

			var templatesArray = this._getTemplates([
				this._compareByTemplate(this.compareId),
				this.datepickerTemplate
			]);
			this._clearAllOtherViews();
			this.$el.html(this._getCompiledTemplate(templatesArray[0], {
				reportModel: this.reportModel.toJSON(),
				formData: this.reportModel.attributes.formData,
				datePicker: this._getCompiledTemplate(templatesArray[1], {
					compareId: this.compareId,
					reportModel: this.reportModel.toJSON()
				})
			}));

			this.afterRender({afterRenderForEditing: true});
		},

		afterRender: function(params) {
			(ICAD.DEBUG_MODE) ? console.info('[compareByView]: afterRender() ') : false;

			// Set values of the form fields if it is a [compare/edit/:reportId] action
			if (params.afterRenderForEditing) {
				this._setEditingFieldValues();
				ICAD.updateFormFields(this, $('#select-market'), params.afterRenderForEditing);
			}

			this._setCustomFormsEl();

			// Set values of the form fields #select-channels or #select-fmm when #select-market selected
			if (selectsArrayOptions.markets[0] && selectsArrayOptions.markets[0].hasOwnProperty("country_profile")) {

				if (!Backbone.history.fragment.match('compare/edit')) {
					$("#select-market").trigger("change");
				}

				$("#select-market").multiselect("getButton").addClass("ui-state-disabled");
				$("#select-market").multiselect({
					open: function() {
						$("#select-market").multiselect("widget").hide();
					}
				})
			}


			// Set datePicker current checkbox value after render and _setCustomFormsEl() function call
			if (params.afterRenderForEditing) {
				$('label[for="' + this.reportModel.attributes.requestObj.period + '"]').click();
				$('#' + this.reportModel.attributes.requestObj.period).click();
			}

			ICAD.validate.datepicker(this.$el.find('#start-date'));
			ICAD.validate.datepicker(this.$el.find('#end-date'));
			this._enableDisableFields();
			ICAD.loader.hide();
		},

		onSelectChange: function(e) {
			ICAD.updateFormFields(this, $(e.currentTarget));
			this.hideFieldErrors($(e.currentTarget));
			this._enableDisableFields();
		},

		onInputChange: function(e) {
			this.hideFieldErrors($(e.currentTarget));
			this._enableDisableFields();
			if ($(e.currentTarget).hasClass('js-datepicker')) {
				ICAD.datepickerCustomize.setCurrentWeekValue($(e.currentTarget));
			}
		},

		hideFieldErrors: function($input) {
			if (ICAD.DEBUG_MODE) {
				console.info('[CompareByView]: hideFieldErrors() ')
			}

			var wrapper = $input.closest('.item-wrapper');
			if (wrapper.hasClass('error-item-wrapper')) {
				wrapper.removeClass('error-item-wrapper').remove('.js-error-msg');
				wrapper.find('.js-error-msg').remove();
			}
			if ($input.hasClass('datepicker__input')) {
				ICAD.validate.datepicker($input)
			}
		},

		sendCompareRequest: function(e) {
			(ICAD.DEBUG_MODE) ? console.info('[CompareByView]: sendCompareRequest() ') : false;
			e.preventDefault();

			if (this._enableDisableFields()) { // Check all form fields are correct
				ICAD.loader.show($('.compare-request-form__buttons'));

				var formParams = decodeURI(this.$el.find('#compare-request-form').serialize()).replace(/\//g, "%2F"); // Prepare query string, escape / [ ] symbols
				var reportModel = new ReportModel({
					id: formParams,
					compareId: this.compareId,
					request: formParams,
					requestObj: ICAD.queryToJson(formParams),
					formData: this.formData,
					router: this.router,
					isDetailed: false
				});
				this.collection.add(reportModel);

				// Subscribe on reportModel fetch() success callback
				reportModel.on('sync', function() {
					this.router.navigate("reporting/show/" + reportModel.toJSON().compareId + "/" + reportModel.id, {trigger: true});
				}, this);

				// Send ajax request via Backbone fetch() function
				reportModel.fetchModel();
			} else {
				alert('some form values are incorrect'); // TODO: just for debug
			}
		}
	});
});

