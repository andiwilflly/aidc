ICAD.startDate = new Date(selectsArrayOptions.min_date.split('.')[2], selectsArrayOptions.min_date.split('.')[0] - 1, selectsArrayOptions.min_date.split('.')[1]);
ICAD.limitDate = new Date(new Date().getTime() - 60 * 60 * 24 * ((new Date()).getDay()) * 1000);

ICAD.datepickerCustomize = {

	// For pick weeks
	week: function(view) {
		view.$el.find(".js-datepicker").datepicker("destroy");

		view.$el.find(".js-datepicker").datepicker({
			showOn: "both",
			yearRange: "2000:2020",
			buttonImageOnly: false,
			dateFormat: "dd.mm.yy",
			weekHeader: "",
			firstDay: 1,
			showWeek: true,
			showOtherMonths: true,
			minDate: ICAD.startDate,
			maxDate: ICAD.limitDate,
			selectOtherMonths: true,

			afterShow: function(datepicker) {
				datepicker.trigger.addClass('active');
			},

			onSelect: function(dateText, inst) {

				function _getMonday(d) {
					d = new Date(d);
					var day = d.getDay(),
						diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
					return new Date(d.setDate(diff));
				}

				var date =       $(this).datepicker('getDate'),
					dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat,
					setDate =    '',
					startDate =  _getMonday(date),
					endDate =    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - startDate.getDay() + 7);

				if(inst.input.attr('name') == 'startDate') {
					setDate = startDate;
					$("[name='endDate']").datepicker( "option", "minDate", setDate );
				} else {
					setDate = (Date.parse(endDate) < Date.parse(ICAD.limitDate)) ? endDate : ICAD.limitDate ;

					$("[name='startDate']").datepicker( "option", "maxDate", setDate );
				}

				inst.input.val($.datepicker.formatDate(dateFormat, setDate, inst.settings));

				// Hide validate errors from backend and validate date picker
				view.hideFieldErrors(inst.input);
				view.trigger('_enableDisableFields');
			},

			onClose: function(string, datepicker) {
				$('.ui-datepicker-trigger').removeClass('active');
			}
		});

		if(!!Backbone.history.fragment.match('compare/edit')) {
			var startDate = view.reportModel.attributes.requestObj.startDate;
			var endDate = view.reportModel.attributes.requestObj.endDate;

			if(view.reportModel.attributes.requestObj.period == 'week') {
				if(/\b\d{2}[-.]?\d{2}[-.]?\d{4}\b/.test(startDate) && /\b\d{2}[-.]?\d{2}[-.]?\d{4}\b/.test(endDate) && ICAD.validate.datepicker($("#start-date"))) {
					$("#start-date").datepicker("setDate", startDate );
					$('.ui-datepicker-current-day').click(); // rapresent the current selected week start
					$("#end-date").datepicker("setDate", endDate );
					$('.ui-datepicker-current-day').click(); // rapresent the current selected week end
					$('.ui-datepicker-trigger').removeClass('active');
				}
			}

		}
	},

	// For pick month
	month: function(view) {
		var startDate, endDate;
		view.$el.find(".js-datepicker").datepicker("destroy");

		view.$el.find(".js-datepicker").datepicker({
			showOn: "both",
			buttonImageOnly: false,
			stepMonths: 12,
			yearRange: "2000:2020",
			minDate: ICAD.startDate,
			maxDate: ICAD.limitDate,
			dateFormat: "dd.mm.yy",
			monthNames: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec" ],

			afterShow: function(datepicker) {

				function _convertDate( date ) {
					if(typeof date == 'number') {
						return date
					}
					if(!!date) {
						var dateArr = date.split(".");
						return formatDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
					} else {
						return undefined;
					}
				}

				datepicker.trigger.addClass('active');
				$(datepicker.dpDiv).find('.ui-datepicker-month').hide();
				datepicker.selectedMonth = 1;

				var calendar = $(datepicker.dpDiv).find('.ui-datepicker-calendar').html('');
				var monthList = view.$el.find(".js-datepicker").datepicker( "option", "monthNames");
				var html = '', count = 0;

				// Disable/enable month picker on compareEdit action
				if(!!Backbone.history.fragment.match('compare/edit')) {
					var _month = function($input) {
						var month = new Date($input.datepicker('getDate')).getMonth() + 1;
						return (month.toString().length == 2) ? month : '0' + month;
					};
					var _year = function($input) {
						return '.20' + (new Date($input.datepicker('getDate')).getYear() + '').slice(1);
					};
					if(Date.parse(new Date($('#start-date').datepicker('getDate'))) < Date.parse(new Date('01.01.2015'))) {
						startDate = '01.01.2015';
					} else {
						startDate = '01.' + _month($('#start-date')) + _year($('#start-date'));
					}

					endDate = '01.' + _month($('#end-date')) + _year($('#end-date'));
				}

				$.each(monthList, function(num, month) {
					num = num + 1;
					var date = '01.' + ((num.toString().length == 2) ? num : '0' + num ) + '.' + datepicker.selectedYear,
						cssClass = '',
						secondsInMonth = 2628000; // Need to divide startDate and endDate by one month

					if(datepicker.input.attr('name') == 'startDate') {
						if(Date.parse(_convertDate(startDate)) == Date.parse(_convertDate(date)))
							cssClass += ' selected ';
						if(_convertDate(endDate) < Date.parse(_convertDate(date)))
							cssClass += ' is-disabled ';
					} else {
						if(_convertDate(endDate) == Date.parse(_convertDate(date)))
							cssClass += ' selected ';
						if(Date.parse(_convertDate(startDate)) > Date.parse(_convertDate(date)))
							cssClass += ' is-disabled ';
					}
					// Create HTML for month picker
					html +=  (count % 3) ?
						'<td><p data-date=' + date + ' class="' + cssClass + '">' + month + '</p></td>'
						:
						'</tr><tr class="ui-month-row"><td><p data-date=' + date + ' class="' + cssClass + '">' + month + '</p></td>';
					count += 1;
				});
				calendar.html(html);

				var currentYear = new Date().getYear();
				var currentMonthIndex = ICAD.limitDate.getMonth();

				$.each($('.ui-datepicker-calendar tbody td'), function(k, v) {
					if(new Date(_convertDate($(v).find('p').data('date'))).getYear() == currentYear)
						if(k >= currentMonthIndex)
							$(v).find('p').addClass('is-disabled');
				});

				$(datepicker.dpDiv).find('.ui-month-row p').click(function(e) {

					function _convertDate( date ) {
						var dateArr = date.split(".");
						return formatDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
					}
					var resDate = $(e.currentTarget).data('date');
					if(datepicker.input.attr('name') == 'startDate') {
						startDate = $(e.currentTarget).data('date');
					} else {
						var _dataVal = $(e.currentTarget).data('date').split('.');
						endDate = Date.parse(new Date(_dataVal[2], _dataVal[1], _dataVal[0])) - 86400000; // One day in milliseconds
						resDate = new Date(endDate);
					}
					datepicker.input.datepicker( "setDate", resDate );

					ICAD.validate.datepicker(datepicker.input);
					view.trigger('_enableDisableFields');

					$('#ui-datepicker-div').hide();
					$('.ui-datepicker-trigger').removeClass('active');
				});
			},

			onClose: function(string, datepicker) {
				$('.ui-datepicker-trigger').removeClass('active');
			}
		});
	},

	setCurrentWeekValue: function($input) {
		if($input.datepicker('getDate')) { // Date is not [null]
			if($input.attr('name') == "endDate") {
				$('#end-week').val($.datepicker.iso8601Week($input.datepicker('getDate')));
			} else {
				$('#start-week').val($.datepicker.iso8601Week($input.datepicker('getDate')));
			}
		}
	}
};
