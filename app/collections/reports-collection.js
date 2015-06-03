define([
	"ReportModel"
], function(ReportModel) {

	return Backbone.Collection.extend({

		model: ReportModel,

		initialize: function() {
		}
	});
});