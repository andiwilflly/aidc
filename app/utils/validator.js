ICAD.error = {

	errorMsgDiv: $( '<div/>', { class: 'error-msg js-error-msg' } ),

	datepicker: {
		format: "Incorrect date format. </br> Example: [20.01.2015]",
		range:  "Incorrect date range. </br> Example: [20.01.2015]",
		notMonday: "This day is not Monday.",
		notSunday: "This day is not Sunday."
	}
};

ICAD.validate = {

	// Mask for such string: 12.01.2015
	datepickerMask: /\b\d{2}[.]\d{2}[.]\d{4}\b/,

	datepicker: function(e) {
		var $input = (!!e.currentTarget) ? $(e.currentTarget) : e,
			isValid = true,
			$wrapper = $input.closest('.item-wrapper');

		if(ICAD.DEBUG_MODE) { console.info('[validator.js]: validate datepicker #' + $input.attr('id')) }

		var startDate = $("#start-date").datepicker('getDate');
		var endDate =   $("#end-date").datepicker('getDate');
		var oneDay =    86400000;  // 1 day in milliseconds

		function _fireErrorMsg(msg, wrapper) {
			wrapper = wrapper || $wrapper;
			if(wrapper.find('.js-error-msg').length)
				wrapper.find('.js-error-msg').remove();
			ICAD.error.errorMsgDiv.clone().appendTo($input.closest('.item-wrapper'));
			wrapper.find('.js-error-msg').html(msg);
		}

		if(!$wrapper.hasClass('error-item-wrapper')) {
			// Check date format
			if(!ICAD.validate.datepickerMask.test($input.val()) && $input.val().length > 0) {
				_fireErrorMsg(ICAD.error.datepicker.format);
				isValid = false;
			} else {
				$wrapper.find('.js-error-msg').html('');

				// Check [date range] if [date format] is correct
				if(Date.parse(startDate) + oneDay > Date.parse(endDate) || Date.parse(endDate) > Date.parse(ICAD.limitDate)) {
					_fireErrorMsg(ICAD.error.datepicker.range);
					isValid = false;
				}  else {
					$('.datepicker .js-error-msg').html('');
					$('.datepicker__wrap').removeClass('error-item-wrapper');
				}
			}
		}
		return isValid;
	},

	reportModel: function(model) {
		if(ICAD.DEBUG_MODE) { console.info('[validator.js]: validate report model') }

		var modelValues = model.toJSON();
		var isValidModel = true;

		// Validate model [Id] field
		if(typeof modelValues['id'] != model.default['id']) {
			isValidModel = false;
		}

		// Validate model [request] field
		if(typeof modelValues['request'] != model.default['request']) {
			isValidModel = false;
		}

		// Validate model [requestObj] field
		if(typeof modelValues['requestObj'] != model.default['requestObj']) {
			isValidModel = false;
		}

		// Validate model [compareId] field
		if(typeof modelValues['compareId'] != model.default['compareId']) {
			isValidModel = false;
		}

		// Validate model [isDetailed] field
		if(typeof modelValues['isDetailed'] != model.default['isDetailed']) {
			isValidModel = false;
		}

		// Validate model [formData] field
		if(modelValues['formData'] instanceof Array) {
			isValidModel = false;
		}

		return isValidModel;
	}
};