ICAD.multiselect = {
	singleInit : function(select, view) {
		select.multiselect({
			header: false,
			multiple: false,
			selectedList: 1,
			height: 150,
			open: function(event, ui) {
				$(this).multiselect("widget").find(".ui-multiselect-checkboxes input:checked").parents("li").hide();
				$(this).multiselect("widget").find(".ui-multiselect-checkboxes input:not(:checked)").parents("li").show();
				$(this).multiselect("widget").find(".ui-multiselect-checkboxes").jScrollPane(jScrollPane_settings);
			}
		});
	},
	multipleInit : function(select, view) {
		select.multiselect({
			selectedList: 1,
			height: 150,
			noneSelectedText: select.data('text'),
			open: function(event, ui) {

				$(this).multiselect("widget").find(".ui-multiselect-checkboxes").jScrollPane(jScrollPane_settings);

				if ($(this).multiselect("widget").find("input:checked").length < $(this).multiselect("widget").find("input").length) {
					ICAD.multiselect._showMultiselectAll($(this));
				} else {
					ICAD.multiselect._showMultiselectNone($(this));
				}
			},
			checkAll: function(event, ui) {
				ICAD.multiselect._showMultiselectNone($(this));
				view.updateMultipleSelectList($(this));
			},
			uncheckAll: function(event, ui) {
				ICAD.multiselect._showMultiselectAll($(this));
				view.updateMultipleSelectList($(this));
			},
			click: function(event, ui) {
				if ($(this).multiselect("widget").find("input:checked").length < $(this).multiselect("widget").find("input").length) {
					ICAD.multiselect._showMultiselectAll($(this));
				} else {
					ICAD.multiselect._showMultiselectNone($(this))
				}
				view.updateMultipleSelectList($(this));
			},
			create: function(){
				view.updateMultipleSelectList($(this));
			}
		});
	},
	destroy: function(select){
		select.multiselect('destroy');
	},
	_showMultiselectAll: function($el) {
		$el.multiselect("widget").find(".ui-multiselect-all").show();
		$el.multiselect("widget").find(".ui-multiselect-none").hide();
	},
	_showMultiselectNone: function($el) {
		$el.multiselect("widget").find(".ui-multiselect-all").hide();
		$el.multiselect("widget").find(".ui-multiselect-none").show();
	}
}