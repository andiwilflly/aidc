require([
	"Helpers/global-events",  // Catch all js errors here
	"MainRouter",
	"backboneCache",
	"Helpers/helpers",
	"Helpers/validator",
	"Helpers/handlebars-extend",
	"Helpers/datepicker-customize",
	"Helpers/multiselect-customize"
], function(globalEvents, MainRouter) {

	// Start router
	new MainRouter();

	// Call Backbone.history.start() to begin monitoring hashchange events, and dispatching routes.
	Backbone.history.start();

	// Show [ICAD application] after [ICAD router] is ready
	globalHelpers.FOUC($('.icad-container.js-fouc'), 1000);
});