define([], function() {
	return Backbone.Model.extend({

		url: formActionUri,

		// Defaults for [validator js reportModel]
		default: {
			"id": 'string',     // Query string after 'compare/:compareId' form serialization
			"request": 'string',     // Query string after 'compare/:compareId' form serialization
			"requestObj": 'object',     // Object from query string after 'compare/:compareId' form serialization
			"compareId": 'string',     // 'compare/:compareId' route argument
			"isDetailed": 'boolean',    // Set to [true] if report is detailed
			"formData": 'array'       // 'compare/:compareId' form array of html selects options
		},

		initialize: function() {
			(ICAD.DEBUG_MODE) ? console.info('[ReportModel]: initialize()') : false;
		},

		fetchModel: function() {
			(ICAD.DEBUG_MODE) ? console.info('[ReportModel]: fetch()') : false;

			if (ICAD.validate.reportModel(this)) {  // if reportModel fields are valid
				this.fetch({
					//cache: true, // Run backbone.fetch-cache.js library
					//expires: 300, // Cache values expire after 5 minutes by default. Set to false to never expire.
					type: "POST",
					data: {
						"tx_smianalytics_smianalytics": {
							formData: this.id
						}
					},
					processData: true,

					success: function(model, response, options) {
						model.set({errors: null}); // Remove errors from model
						//ICAD.loader.hide();
					},

					error: function(model, response, options) {
						var errors = (!response.responseJSON) ? {errors: []} : response.responseJSON.errors; // Define [errors] as empty array if [response.responseJSON] is undefined

						$.each(errors, function(k, v) {
							errors[k].msg = v[Object.keys(v)[0]];
							errors[k].class = 'error-item-wrapper'; // Set error class for .item-wrappers
						});

						model.set({errors: errors}); // Add errors to model
						model = model.toJSON();

						if (!Backbone.history.fragment.match('compare/' + model.compareId))
							model.router.navigate("dashboard");
						model.router.navigate('compare/edit/' + model.compareId + '/' + model.id, {trigger: true});
						ICAD.loader.hide();
					}
				});
			} else {
				$.growl.warning({message: "Incorrect form data"});
			}
		}
	});
});