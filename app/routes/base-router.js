/**
 * The Router
 * it translates url requests into actions.
 *
 * Here we always throw the same action with different params.
 */
define([
	"ReportModel"
], function(ReportModel) {

	return Backbone.Router.extend({

		/**
		 * Initialize view if it was not initialized before
		 * Render view with [renderData] params object
		 *
		 * @param {object} context instance of current router
		 * @param {string} viewName name of Backbone view that will be created or rendered
		 * @param {object} View Class of current view
		 * @param {object} renderData object that will be inserted as argument to Backbone view.render() function
		 * @returns {*}
		 */
		startView: function(context, viewName, View, renderData) {
			(ICAD.DEBUG_MODE) ? console.info('[BaseRouter]: startView() | name: ' + viewName) : false ;

			if(!context[viewName]) {
				context[viewName] = new View(renderData);
			}
			context[viewName].render(renderData);
		},


		/**
		 * Create new reportModel, add this model to reportsCollection and make ajax request to database
		 *
		 * @param {string} compareId - type of current [compare by] view
		 * @param {string} modelId - request string from last [compare form] serialization
		 * @returns {*}
		 */
		restoreReportModel: function(compareId, modelId) {
			(ICAD.DEBUG_MODE) ? console.info('[BaseRouter]: restoreReportModel()') : false ;

			// If we fetch model after refresh page - there is no ICAD on html, so we need to add loader to $('.icad-container')
			ICAD.loader.show($('.icad-container'));

			var reportModel = new ReportModel();

			reportModel.set({
				id:         modelId,
				compareId:  compareId,
				request:    modelId,
				requestObj: ICAD.queryToJson(modelId),
				formData:   ICAD.getFormFields(compareId),
				router:     this,
				isDetailed: false
			});

			this.reportsCollection.add(reportModel);

			reportModel.fetchModel();
		}
	});
});