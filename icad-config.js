/*<![CDATA[*/
	selectsArrayOptions =  /*]]>{JsComment.close}<f:comment>*/'</f:comment>{options -> f:format.raw()}<f:comment>'/*</f:comment>{JsComment.open}<![CDATA[*/;
	selectsAjaxUri =        "]]>{filterUri -> f:format.raw()}<![CDATA[";

	formActionUri =         "]]>{formActionUri -> f:format.raw()}<![CDATA[";
	formActionUriXlsx =     "]]>{formActionUriXlsx -> f:format.raw()}<![CDATA[";

	formDetailedActionUri =     "]]>{formDetailedActionUri -> f:format.raw()}<![CDATA[";
	formDetailedActionUriXlsx = "]]>{formDetailedActionUriXlsx -> f:format.raw()}<![CDATA[";

	reportListActionUri =   "]]>{reportListActionUri -> f:format.raw()}<![CDATA[";
	deleteReportActionUri = "]]>{deleteReportActionUri -> f:format.raw()}<![CDATA[";
	saveReportActionUri =   "]]>{saveReportActionUri -> f:format.raw()}<![CDATA[";


// Global ICAD object for helpers and workers
ICAD = {
	DEBUG_MODE: false, // ICAD debug console.info() messages
	workers: (window.Worker) ? {} : false // List of ICAD workers goes here
};


// ========== If you want to debug where the function was call from just add this line to function ==========
// try { throw Error('') } catch(err) { console.info(err.stack.split("\n")[3].split('(')[1]) };


// Fix problem with [null] inside [selectsArrayOptions]
selectsArrayOptions.user_types    = selectsArrayOptions.user_types || [];
selectsArrayOptions.reportingList = selectsArrayOptions.reportingList || [];
selectsArrayOptions.markets       = selectsArrayOptions.markets || [];
selectsArrayOptions.activities    = selectsArrayOptions.activities || [];
selectsArrayOptions.user_types    = selectsArrayOptions.user_types || [];


$.extend(jScrollPane_settings, {horizontalGutter: 0});


function createPath(path) {
	return 'typo3conf/ext/smi_analytics/Resources/Public/JavaScript/' + path
}


$.get(createPath('ICAD/build.js'), function(data) {
	// Make data object from string
	data = eval(data);

	$.extend(data, {
		baseUrl: "typo3conf/ext/smi_analytics/Resources/Public/JavaScript/ICAD",

		// Force require js to bypass the cache by appending a timestamp
		// During development it can be useful to use this, however be sure to remove it before deploying your code.
		urlArgs: "bust=" + (new Date()).getTime()
	});

	// Extend require js config with [data]
	require.config(data);

	require([
		"handlebars"
	], function(HandlebarsEnvironment) {

		//	Add Handlebars to the global scope
		window.Handlebars = HandlebarsEnvironment;

		// Start ICAD Application here
		require(["AppInit"]);
	});
});
/*]]>*/
