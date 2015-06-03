/**
 * The Router
 * it translates url requests into actions.
 *
 * Here we always throw the same action with different params.
 */
define([
	"BaseRouter",
	"ReportsCollection",
	"ReportModel",
	"ReportsListView",
    "SavedReportsView",
    "CompareByView",
    "ReportingView",
    "ReportingDetailsView"
], function(BaseRouter, ReportsCollection, ReportModel, ReportsListView, SavedReportsView, CompareByView, ReportingView, ReportingDetailsView) {

	return BaseRouter.extend({

		routes: {
			'':                                     'dashboard',
			'dashboard':                            'dashboard',

			'compare/:compareId':                   'compare',
			'compare/edit/:compareId/:modelId':     'editCompare',

			'reporting/show/:compareId/:modelId':              'showReport',
			'reporting/save/:compareId/:modelId':              'saveReport',
			'reporting/details/:compareId/:objectId/:modelId': 'showDetailsReport',

			// Catch undefined routes and redirect to [dashboard] page. Keep it in the bottom of the routes list.
			'*actions':            'error404'
		},

		initialize: function() {
			this.reportsCollection = new ReportsCollection();
			this.on("route", function(route, params) {
				$('#ui-datepicker-div').hide();  // Hide UI datePicker
			});
		},

		error404: function(route) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: error404') }

			ICAD.loader.hide();
			this.navigate('dashboard', {trigger: true});
		},

		dashboard: function() {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: dashboard') }

			this.startView(this, 'reportsListView', ReportsListView);
			this.startView(this, 'savedReportsView', SavedReportsView, {
				router:  this
			});
		},

		compare: function(compareId) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: compare') }

			this.startView(this, 'compareByView', CompareByView, {
				compareId:  compareId,
				router:     this,
				collection: this.reportsCollection
			});
		},

		editCompare: function(compareId, modelId) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: editCompare') }

			modelId = decodeURI(modelId).replace(/\//g, "%2F"); // Fix problem with form serialize() escaping characters

			// Page was reload and need to restore CompareByView
			if(!this.compareByView) {
				(ICAD.DEBUG_MODE) ? console.info('[BaseRouter]: startView() | name: compareByView') : false ;
				this.compareByView = new CompareByView({
					compareId:  compareId,
					router:     this,
					collection: this.reportsCollection
				});
			}

			// Page was reload and need to restore ReportModel
			if(this.reportsCollection.get(modelId) == undefined) {
				var that = this;
				this.restoreReportModel(compareId, modelId);

				// Listen to new created reportModel ajax [success]
				this.reportsCollection.get(modelId).on('sync', function() {
					that.compareByView.renderForEditing({
						modelId:    modelId
					});
				});
			} else {
				this.compareByView.renderForEditing({
					modelId:    modelId
				});
			}
		},

		showReport: function(compareId, modelId) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: showReport') }

			modelId = decodeURI(modelId).replace(/\//g, "%2F"); // Fix problem with form serialize() escaping characters

			$('#reporting-view').css('opacity', 1); // FOUC

			// If [reporting/show/:reportId] page was refreshed
			if(this.reportsCollection.get(modelId) == undefined) {
				this.restoreReportModel(compareId, modelId);

				// Listen to new created reportModel fetch [success]
				this.reportsCollection.get(modelId).on('sync', function() {
					this.startView(this, 'reportingView', ReportingView, {
						reportModel: this.reportsCollection.get(modelId)
					});
				}, this);
			} else {
				this.startView(this, 'reportingView', ReportingView, {
					reportModel: this.reportsCollection.get(modelId)
				});
			}
		},

		saveReport: function(compareId, modelId) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: saveReport') }

			var modelToSave = this.reportsCollection.get(modelId).toJSON();

			// Need back at current route
			if(modelToSave.isDetailed) {
				this['reportingDetailsView']._saveReport(modelToSave);
				this.navigate('reporting/details/' + compareId + '/' + modelToSave.objectId + '/' + modelId);
			} else {
				this['reportingView']._saveReport(modelToSave);
				this.navigate('reporting/show/' + compareId + '/' + modelId);
			}
		},

		showDetailsReport: function(compareId, objectId, modelId) {
			if(ICAD.DEBUG_MODE) { console.groupEnd(); console.group('[route]: showDetailsReport') }

			modelId = decodeURI(modelId).replace(/\//g, "%2F"); // Fix problem with form serialize() escaping characters

			// Visual FOUC effects goes here
			ICAD.loader.show($('.icad-container'));
			$('#reporting-table-short').slideUp(2000);
			$('#reporting-view').animate({ opacity: 0 }, 2000, function() { $("html, body").animate({ scrollTop: 0 }, 700); });

			if(!this.reportingDetailsView) {
				if(ICAD.DEBUG_MODE) { console.info('[BaseRouter]: startView() | name: reportingDetailsView') }
				this.reportingDetailsView = new ReportingDetailsView({
					router:     this,
					collection: this.reportsCollection
				});
			}

			if(this.reportsCollection.get(modelId) == undefined) {
				var that = this;
				this.restoreReportModel(compareId, modelId);

				// Listen to new created reportModel fetch [success]
				this.reportsCollection.get(modelId).on('sync', function() {
					that.reportingDetailsView.beforeRender({
						objectId:    objectId,
						reportModel: that.reportsCollection.get(modelId)
					});
				});
			} else {
				this.reportingDetailsView.beforeRender({
					objectId:    objectId,
					reportModel: this.reportsCollection.get(modelId)
				});
			}
		}
	});
});