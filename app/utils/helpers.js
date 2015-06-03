/**
 * ICAD preloader logic
 */
ICAD.loader = {
	show: function($target) {
		$target = $target || $('#icad-content');
		$('#icad-loader').remove();
		$target.css('position', 'relative').append($('<div/>', {id: 'icad-loader'}));
	},
	hide: function() {
		$('#icad-loader').remove();
	}
};


/**
 * Returns unique ID
 */
ICAD.generateId = (function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		       s4() + '-' + s4() + s4() + s4();
	};
})();


/**
 * Clone object
 *
 * @param {object} obj - object to clone
 * @returns {object} object new object - clone of previous
 */
ICAD.cloneObject = function(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	var temp = obj.constructor(); // give temp the original obj's constructor
	for (var key in obj) {
		temp[key] = ICAD.cloneObject(obj[key]);
	}
	return temp;
};


/**
 * Transform query string to object with chosen params
 *
 * @param {string} qs query string (like after form.serialize())
 * @returns {object} object with params that was in query string
 */
ICAD.queryToJson = function(qs) {
	qs = qs.split("+").join(" ");
	var prevTokenName, prevTokenVal;
	var params = {}, tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		if (prevTokenName == decodeURIComponent(tokens[1])) {
			if (params[prevTokenName] instanceof Array) {
				params[prevTokenName].push(decodeURIComponent(tokens[2]));
			} else {
				params[prevTokenName] = [];
				params[prevTokenName].push(prevTokenVal);
				params[prevTokenName].push(decodeURIComponent(tokens[2]));
			}
		} else {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}
		prevTokenName = decodeURIComponent(tokens[1]);
		prevTokenVal = decodeURIComponent(tokens[2]);
	}
	return params;
};


/**
 * @param callback
 * @param delay
 * @returns {*}
 */
ICAD.onWindowResize = function(callback, delay) {
	delay = delay || 0;
	var timeoutId = 0;
	return jQuery(window).on("resize", function() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	});
};


/**
 * @param $el
 * @param callback
 * @param delay
 * @returns {*}
 */
ICAD.onScroll = function($el, callback, delay) {
	delay = delay || 0;
	var timeoutId = 0;
	return $el.scroll("scroll", function() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	});
};


// Ajax requests for Compare by [] view form elements logic
// Return object with form fields that can be compiled inside hbs template
ICAD.getFormFields = function(compareId) {
	var res;
	var getFieldsFor = {
		activity: function() {
			res = {
				select_market: selectsArrayOptions['markets'],
				select_activity: selectsArrayOptions['activities']
			};
		},
		market: function() {
			res = {
				select_activity: selectsArrayOptions['activities'],
				select_market: selectsArrayOptions['markets']
			};
		},
		fmm: function() {
			res = {
				select_market: selectsArrayOptions['markets'],
				select_activity: selectsArrayOptions['activities'],
				select_fmm: []
			};
		},
		channel: function() {
			res = {
				select_market: selectsArrayOptions['markets'],
				select_activity: selectsArrayOptions['activities'],
				select_channel: []
			};
		},
		week: function() {
			res = {
				select_market: selectsArrayOptions['markets'],
				select_activity: selectsArrayOptions['activities']
			};
		},
		user: function() {
			res = {
				select_market: selectsArrayOptions['markets'],
				select_activity: selectsArrayOptions['activities'],
				select_user: selectsArrayOptions['user_types']
			};
		}
	};

	getFieldsFor[compareId]();
	return res;
};


ICAD.updateFormFields = function(view, field, afterRenderForEditing) {
	(ICAD.DEBUG_MODE) ? console.info('[hepler.js]: ICAD.updateFormFields() | field name: ' + field.attr('name')) : false;

	function _getOptions(compareId, fieldVal, $select) {
		ICAD.loader.show();
		view._getData(
			selectsAjaxUri,
			{
				"tx_smianalytics_smianalytics": {
					showAll: 0,
					market: parseInt(fieldVal),
					type: compareId
				}
			},
			function(optionsArray) {
				$.each(optionsArray, function(k, v) {
					res += '<option value="' + v.value + '" title="' + v.name + '">' + v.name + '</option>'
				});
				view.formData['select_' + compareId] = optionsArray;
				$select.html(res);

				if (typeof view.reportModel != 'undefined' && afterRenderForEditing == true) {
					view._setEditingFieldValues();
				}

				ICAD.multiselect.destroy($select);
				ICAD.multiselect.multipleInit($select, view);
				ICAD.loader.hide();
			}
		);
	}

	var res = '';
	var getFieldsFor = {
		channel: function() {
			if (field.attr('id') == 'select-market') {
				_getOptions(view.compareId, field.val(), $('#select-channels'));
			}
		},
		fmm: function() {
			if (field.attr('id') == 'select-market') {
				_getOptions(view.compareId, field.val(), $('#select-fmm'));
			}
		},
		market: function() {
		},
		week: function() {
		},
		activity: function() {
		},
		user: function() {
		}
	};

	getFieldsFor[view.compareId]();
};


/**
 * Add selected filters for reportModel
 * This filters will be added to report headers
 *
 * @param   {object} view - Backbone.View instance
 * @returns {*}
 */
ICAD.setAdditionalReportFields = function(view) {
	if (ICAD.DEBUG_MODE) {
		console.info('[helpers.js]: ICAD.setAdditionalReportFields()')
	}

	var selectsOptions = ICAD.getFormFields(view.reportModel.attributes.compareId);

	function _setModelFields(fields) {
		var fieldsObj = {};
		$.each(fields, function(k, fieldName) {
			if (!view.reportModel.attributes[fieldName + 'Name'])
				fieldsObj[fieldName + 'Name'] = _.findWhere(selectsOptions['select_' + fieldName], {value: parseInt(view.reportModel.attributes.requestObj[fieldName])}).name
		});
		view.reportModel.set(fieldsObj);
	}

	function _setReportDetailsField(name) {
		if (Backbone.history.fragment.match('reporting/details')) {
			var formDataSelect = view.reportModel.attributes.formData['select_' + view.reportModel.attributes.compareId];
			var value = (!!view.objectId.match(/^[-]?[0-9]+$/)) ? parseInt(view.objectId) : view.objectId; // If only numbers then parseInt()

			if (!view.reportModel.attributes[name]) {
				if (!!_.findWhere(formDataSelect, {value: value})) {
					view.reportModel.attributes[name] = _.findWhere(formDataSelect, {value: value}).name;
				} else {
					view.reportModel.attributes[name] = '';
				}
			}
		} else {
			view.reportModel.unset(name);
		}
	}

	var call = {
		activity: function() {
			_setModelFields(['market']);
			_setReportDetailsField('activityName');
		},
		market: function() {
			_setModelFields(['activity']);
			_setReportDetailsField('marketName');
		},
		fmm: function() {
			_setModelFields(['market', 'activity']);
			_setReportDetailsField('fmmName');
		},
		channel: function() {
			_setModelFields(['market', 'activity']);
			_setReportDetailsField('channelName');
		},
		user: function() {
			_setModelFields(['market', 'activity']);
			_setReportDetailsField('userName');
		},
		week: function() {
			_setModelFields(['market', 'activity']);
			if (Backbone.history.fragment.match('reporting/details')) {
				view.reportModel.attributes['weekName'] = view.reportModel.attributes.requestObj.period;
			} else {
				view.reportModel.unset('weekName');
			}
		}
	};

	call[view.reportModel.attributes.compareId]();
};


// Return scroll bar height
ICAD.getScrollBarWidth = function() {
	var outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
	document.body.appendChild(outer);
	var widthNoScroll = outer.offsetWidth;
	// force scrollbars
	outer.style.overflow = "scroll";
	// add innerdiv
	var inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);
	var widthWithScroll = inner.offsetWidth;
	// remove divs
	outer.parentNode.removeChild(outer);
	return widthNoScroll - widthWithScroll;
};


ICAD.getParameterByName = function(param, requestStr) {
	param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
		results = regex.exec(requestStr);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


ICAD.updateQueryStringParameter = function(uri, key, value) {
	var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		return uri + separator + key + "=" + value;
	}
};


ICAD.generateReportName = function(model) {
	var firstFilter = (model.compareId == 'market') ? model.activityName : model.marketName;
	firstFilter = firstFilter.replace(/ /g, '_');
	var monthNames = ["January", "February", "March", "April", "May", "June",
	                  "July", "August", "September", "October", "November", "December"
	];
	var sArray = model.requestObj.startDate.split('.');
	var eArray = model.requestObj.endDate.split('.');
	var startDate = new Date(sArray[2], sArray[1] - 1, sArray[0] - 1);
	var startWeek = startDate.getWeek();
	var endDate = new Date(eArray[2], eArray[1] - 1, eArray[0] - 1);
	var endWeek = endDate.getWeek();
	var reportType = {
		'market': 'Activity_by_markets',
		'activity': 'Different_activities',
		'fmm': 'Activity_by_FMM',
		'channel': 'Activity_by_channel',
		'week': 'Activity_by_week_month',
		'user': 'Activity_by_user_type'
	};

	var currentDate = new Date();
	var dateString = ('0' + currentDate.getDate()).slice(-2)
	                 + ('0' + (currentDate.getMonth() + 1)).slice(-2)
	                 + currentDate.getFullYear();
	var datePeriod = startDate.getFullYear() + 'CW' + startWeek + '-' + endDate.getFullYear() + 'CW' + endWeek;
	if (typeof model.requestObj.period != 'undefined' && model.requestObj.period == 'month') {
		datePeriod = startDate.getFullYear() + monthNames[startDate.getMonth()] + '-' + endDate.getFullYear() + monthNames[endDate.getMonth()];
	}
	var result = dateString + '_' + reportType[model.compareId] + '_' + firstFilter + '_' + datePeriod;
	if (model.isDetailed) {
		result += '_Full';
	}
	return result;
};

