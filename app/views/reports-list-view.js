define([
	"BaseView"
], function(BaseView) {

	return BaseView.extend({

		el: '#reports-list-view',

		template: createPath('ICAD/app/views/templates/reports-list.hbs'),

		initialize: function() {
		},

		render: function() {
			if(ICAD.DEBUG_MODE) { console.info('[reportsListView]: render()'); }

			this.statusMsg.html('What do you need to do?'); // Update ICAD status mgs

			var that  = this;
			that._clearAllOtherViews('#saved-reports-view');
			if(!that.templateHTML) {
				$.get(this.template, function( template ) {
					that.templateHTML = template;
					that.$el.html(that._getCompiledTemplate(template,
						{
							reportingList: selectsArrayOptions.reportingList
						}
					));
				});
			} else {
				that.$el.html(that._getCompiledTemplate(
					that.templateHTML,
					{
						reportingList: selectsArrayOptions.reportingList
					}
				));
			}
		}
	});
});
