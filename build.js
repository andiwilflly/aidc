({
	paths: {
		AppInit: 'app/app-init',
		Helpers: 'app/utils',

		BaseRouter: 'app/routes/base-router',
		MainRouter: 'app/routes/main-router',

		ReportsCollection:    'app/collections/reports-collection',
		ReportModel:          'app/models/report-model',

		BaseView:             'app/views/base-view',
		ReportsListView:      'app/views/reports-list-view',
		SavedReportsView:     'app/views/saved-reports-view',
		CompareByView:        'app/views/compare-by-view',
		ReportingView:        'app/views/reporting-view',
		ReportingDetailsView: 'app/views/reporting-details-view',

		jquery:      'vendor/jquery-widget-fix',
		underscore:  'vendor/underscore',
		backbone:    'vendor/backbone',
		backboneCheck:     'vendor/backbone-libs/backbone-check',
		backboneCache:     'vendor/backbone-libs/backbone.fetch-cache',

		handlebars:    'vendor/handlebars-v2.0.0',
		selectbox:     'vendor/jquery.selectbox',
		mousewheel:    'vendor/jquery.mousewheel',
		scrollpane:    'vendor/jquery.jscrollpane',
		multiselect:   'vendor/jquery.multiselect',
		growlMessages: 'vendor/jquery.growl',
		prettyCheckable: 'vendor/jquery.prettyCheckable',

		dxChartJs: 'vendor/dxChart/dx.chartjs.min',
		globalize: 'vendor/dxChart/globalize.min'
	},

	shim: {
		AppInit: {
			deps: ["backbone", "growlMessages"]
		},
		dxChartJs: {
			deps: ["globalize"]
		}
	},

	baseUrl: './',
	name: "app/app-init",
	out: "app/app-init-build.js",
	removeCombined: true
})
