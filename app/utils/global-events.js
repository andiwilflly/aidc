/**
 * Fix problem with [compare by view] form values.
 * When page is reload, values that was selected inside form is lost.
 */
//window.onbeforeunload = function() {
//	setTimeout(function() {
//		var compareForm = $('#compare-request-form');
//		if (compareForm.length > 0) {
//			if(ICAD.DEBUG_MODE) { console.info('[hepler.js]: window.onbeforeunload() } Back to [editCompare] route'); }
//
//			var hash = window.location.hash.split('/');
//			var locationHash = (hash[1].match('edit')) ?
//				hash[0] + '/' + hash[1] + '/' + hash[2] + '/' + compareForm.serialize()
//					:
//				hash[0] + '/' + 'edit' + '/' + hash[1] + '/' + compareForm.serialize()
//				;
//			location.assign(locationHash);
//		}
//	}, 1400);
//};


// Automatically cancel unfinished ajax requests
// when the user navigates elsewhere.
//(function($) {
//	var xhrPool = [];
//	$(document).ajaxSend(function(e, jqXHR, options){
//		xhrPool.push(jqXHR);
//	});
//	$(document).ajaxComplete(function(e, jqXHR, options) {
//		xhrPool = $.grep(xhrPool, function(x){return x!=jqXHR});
//	});
//	var abort = function() {
//		$.each(xhrPool, function(idx, jqXHR) {
//			console.log(jqXHR);
//			jqXHR.abort();
//		});
//	};
//
//	var oldbeforeunload = window.onbeforeunload;
//	window.onbeforeunload = function() {
//		var r = oldbeforeunload ? oldbeforeunload() : undefined;
//		if (r == undefined) {
//			// only cancel requests if there is no prompt to stay on the page
//			// if there is a prompt, it will likely give the requests enough time to finish
//			abort();
//		}
//		return r;
//	}
//})(jQuery);


// Add 'afterShow' callback to UI Datepicker Widget
$.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
$.datepicker._updateDatepicker = function(inst) {
	$.datepicker._updateDatepicker_original(inst);
	var afterShow = this._get(inst, 'afterShow');
	afterShow(inst);
};


// Extend Date object with [getWeek] method
Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
};


// Keep in mind that returning true will prevent the firing of the default handler, and returning false will let the default handler run.
window.onerror = function(message, url, lineNumber) {
	if(!Backbone.history.fragment.match('dashboard')) {
		window.location.hash = 'error404';
	}
	return false;
};


/**
 * Ajax success callback log for ICAD.DEBUG_MODE
 */
$( document ).ajaxSuccess(function(event, xhr, settings) {
	(ICAD.DEBUG_MODE) ? console.info('[AJAX]: success | ' + settings.type + ': ' + _.last(settings.url.split('/'))) : false ;
});
$( document ).ajaxError(function(event, jqxhr, settings, thrownError) {
	(ICAD.DEBUG_MODE) ? console.info('[AJAX]: error | ' + settings.type + ': ' + _.last(settings.url.split('/'))) : false ;
});


/**
 * Fix problem of prevent the page jumping to an input when label is changed ()
 */
$('body').on('click', 'label[for="week"], label[for="month"]', function (e) {
	var target = $('#' + $(e.currentTarget).attr('for'))[0];

	target.checked = !target.checked;
	e.preventDefault();
});
