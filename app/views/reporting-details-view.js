define([
	"BaseView",
	"Helpers/lazy-load",
	"Helpers/report-tooltip"
], function(BaseView, lazyLoadHelper) {

	return BaseView.extend({

		el: '#reporting-details-view',

		template: createPath('ICAD/app/views/templates/reporting-details.hbs'),

		detailsSide:    createPath('ICAD/app/views/templates/partials/reporting-details-side.hbs'),
		detailsPartial: createPath('ICAD/app/views/templates/partials/reporting-details-part.hbs'),

		events: {
			'click #reporting-details-head .th': 'rebuildTableAfterSort',
			'click #reporting-details-side-head .th': 'rebuildTableAfterSort',
			'click .js-tooltip': 'showTooltip',
			"submit form#exportToFile": "submitExportToFileForm"
		},

		// List of live-load variables goes here
		detailsTableHeight: 450 + ICAD.getScrollBarWidth(),
		itemHeight:     30,  // height of <tr> element of reporting details table
		itemsPerPart:   100,  // count of items per one part load via ajax
		loadedParts:    [],  // all parts that was loaded
		liveParts:      [],  // parts that currently in DOM
		currentParts:   [],  // parts calculated by lazyLoadHelper
		partHeight:     0,   // itemsPerPart * itemHeight
		scrollBarWidth: ICAD.getScrollBarWidth(),

		initialize: function() {
			this.partHeight = this.itemsPerPart * this.itemHeight;
			$("body").bind('click', this.removeTooltip);
		},

		beforeRender: function(params) {
			if(ICAD.DEBUG_MODE) { console.info('[reportingDetailsView]: beforeRender()'); }

			var that = this;

			that.$el.css('opacity', 0); // FOUC

			// Initialize [Web Worker] and subscribe on [message] event
			that.createWebWorker();

			that.totalCount =  0;   // refresh total count of data elements
			that.reportModel = params.reportModel;
			that.objectId =    params.objectId;

			that.reportModel.set('objectId', that.objectId);

			// Set is detailed report flag to [true]
			that.reportModel.set('isDetailed', true);

			// Remove current selected chart option from reportModel
			that.reportModel.unset('selectReportChartVal');

			// Refresh live-load parameters
			that.loadedParts =  [];
			that.liveParts =    [1];
			that.currentParts = [1];

			that.liveSort =    {sortBy: "", sortOrder: ""};
			that.currentSort = {sortBy: "", sortOrder: ""};

			// Clear loaded reporting details series object
			that.loadedReporData = false;

			// Extend reportModel with additional fields like: market, deviceName ..
			that._refreshFormDataObj(that.reportModel.attributes.compareId);

			// Prepare html of reporting details table (reportDetailsSide and reportDetailsPartial) this html will be used in this.refreshTableData function
			$.ajax({
				type: 'get',
				url: createPath('ICAD/app/views/templates/partials/reporting-details-side.hbs'),
				success: function(detailsSide) {
					that.reportDetailsSide = detailsSide;
					$.ajax({
						type: 'get',
						url: createPath('ICAD/app/views/templates/partials/reporting-details-part.hbs'),
						success: function(detailsPartial) {
							that.reportDetailsPartial = detailsPartial;
							// Send data to worker. (Callback inside view.initialize() function)
							that.sendMessageToWorker({sortBy: "", sortOrder: ""});
						}
					});
				}
			});
		},

		render: function(data) {
			if(ICAD.DEBUG_MODE) { console.info('[reportingDetailsView]: render()'); }

			this.statusMsg.html('What do you need to do?'); // Update ICAD status mgs

			if (data.count != null) {
				this.totalCount = data.count;
			}

			var that = this;
			$.ajax({
				type: 'get',
				url: createPath('ICAD/app/views/templates/reporting-details.hbs'),  // Load main reporting details hbs template
				success: function(reportingDetails) {
					$.ajax({
						type: 'get',
						url: that._reportingPeriodTemplate(that.reportModel.get('compareId')), // Load html of reporting-period partial
						success: function(reportingPeriod) {
							that._clearAllOtherViews();
							that.$el.html(that._getCompiledTemplate(reportingDetails, {
								reportModel:     that.reportModel.toJSON(),
								reportDetails:   data,
								reportingPeriod: that._getCompiledTemplate(reportingPeriod, { reportModel: that.reportModel.toJSON()}),
								formDetailedActionUriXlsx: window.formDetailedActionUriXlsx
							}));
							that.afterRender(data);
						}
					});
				}
			});

			that.reportDetailsCount = data.count;
			that.reportDetailsLimit = Math.ceil(data.count / that.itemsPerPart) + 1;
		},

		afterRender: function(data) {
			if(ICAD.DEBUG_MODE) { console.info('[reportingDetailsView]: afterRender()'); }

			var that = this;

			that.detailsSide =      that.$el.find('#reporting-details-side');
			that.detailsWrapper =   that.$el.find('#reporting-details-wrapper');

			that.detailsSideInner = that.$el.find('#reporting-details-side .js-reporting-details-inner');
			that.detailsSideHead =  that.$el.find('#reporting-details-side-head');
			that.detailsSideTable = that.$el.find('#reporting-details-names');

			that.detailsInner =     that.$el.find('#reporting-details-wrapper .js-reporting-details-inner');
			that.detailsHead =      that.$el.find('#reporting-details-head');
			that.detailsTable =     that.$el.find('#reporting-details-table');
			that.detailsMover =     that.$el.find('.js-reporting-details-mover');
			that.sortColumns =      that.$el.find('#reporting-details-head .th');

			// Add vertical scroll effect to detailsSide
			var wheelValue = 0;
			var wheelStep = 100;
			var wrapperHeight = that.totalCount * that.itemHeight - wheelStep * 2;
			that.detailsSide.bind('mousewheel', function(e) {
				if(wheelValue < 0) wheelValue = 0; // Set min wheel value to 0
				if(wheelValue > wrapperHeight) wheelValue = wrapperHeight; // Set max wheel value
				
				that.detailsWrapper.scrollTop(wheelValue);
				wheelValue = (e.originalEvent.deltaY / wheelStep > 0) ? wheelValue + wheelStep : wheelValue - wheelStep;
			});

			// Calculate table head top positions on Scroll event
			ICAD.onScroll(that.detailsWrapper, function() {
				that.detailsHead.parent().scrollLeft(that.detailsWrapper.offset().left - that.detailsInner.offset().left);
				that.detailsSide.scrollTop(that.detailsWrapper.offset().top - that.detailsInner.offset().top);
			}, 1);

			ICAD.onScroll(that.detailsSide, function() {
				that.detailsSideHead.parent().scrollLeft(that.detailsSide.offset().left - that.detailsSideInner.offset().left);
				that.detailsSide.scrollTop(that.detailsWrapper.offset().top - that.detailsInner.offset().top);
			}, 1);

			// Load new parts on report details table scroll event
			ICAD.onScroll(this.detailsWrapper, function() {
				lazyLoadHelper.loadParts(that, that.currentSort);
			}, 200);

			// Calculate total report details table height (for table inners)
			that.detailsSideInner.height(that.totalCount * that.itemHeight);
			that.detailsInner.height(that.totalCount * that.itemHeight);

			// Calculate table height
			if(that.totalCount) {
				var allItemsHeight = that.totalCount * that.itemHeight + that.scrollBarWidth + 1;
				var tableHeight = (allItemsHeight >= that.detailsTableHeight) ? that.detailsTableHeight : allItemsHeight; // TODO: magic numbers :S
				that.detailsSide.height(tableHeight);
				that.detailsWrapper.height(tableHeight);
			} else {
				that.$el.find('#save-report-btn').remove();
				that.$el.find('#exportToFile').remove();
				that.$el.find('#reporting-details').html($('<div/>', { class: 'sub-title', text: "Sorry, no data available." }));
			}

			// Load start series for report details table
			that.refreshTableData(data);

			globalHelpers.FOUC(that.$el, 1500); // FOUC
		},


		/**
		 * Create a Web Worker Object
		 * We have the web worker file [details-data-worker.js], we need to call it.
		 * Then we can send and receive messages from the web worker.
		 * Add an "onmessage" event listener to the web worker.
		 */
		createWebWorker: function() {
			var that = this;
			if(ICAD.workers) { // Check web workers support
				ICAD.workers.reportDetails = new Worker(createPath('ICAD/app/utils/workers/details-data-worker.js'));
				ICAD.workers.reportDetails.addEventListener('message', function(e) {
					if (!that.totalCount) { // First time when report details view is not rendered yet
						that.render(e.data.data);
					} else {
						that.detailsTable.find('.tbody').html("");
						that.detailsSide.find('.tbody').html("");
						that.refreshTableData(e.data.data);
						that.detailsMover.css('height', (that.currentParts[0] - 1) * that.partHeight);
					}
				}, false);
			} else {
				// Nothing to do here..
			}
		},

		/**
		 * Trigger [message] event for [details-data-worker.js]
		 */
		sendMessageToWorker: function(sortObj) {
			var that = this;
			if(ICAD.workers) { // Check web workers support

				ICAD.workers.reportDetails.postMessage({
					request: {
						parts:        that.currentParts,
						sort:         sortObj,
						itemsPerPart: that.itemsPerPart
					},
					formDetailedActionUri: formDetailedActionUri,
					compareId: that.reportModel.attributes.compareId,
					objectId:  that.objectId,
					modelId:   that.reportModel.attributes.id,
				});
			} else {
				require(["Helpers/workers/details-data-helper"], function() {
					function _getData() { return that.reportModel.attributes.id + '&' + that.reportModel.attributes.compareId + 'Id=' + that.objectId; }

					// If page load at first
					if(!that.loadedReporData) {
						detailsData.loadData(formDetailedActionUri, _getData(), function(data) {
							data = JSON.parse(data);
							detailsData.prepareDataPart(data, {parts: that.currentParts, sort: sortObj, itemsPerPart: that.itemsPerPart}, function(currentData) {
								that.render(currentData.data);
							});
							that.loadedReporData = data;
						});
					} else {
						detailsData.prepareDataPart(that.loadedReporData, {parts: that.currentParts, sort: sortObj, itemsPerPart: that.itemsPerPart}, function(currentData) {
							that.detailsTable.find('.tbody').html("");
							that.detailsSide.find('.tbody').html("");
							that.refreshTableData(currentData.data);
							that.detailsMover.css('height', (that.currentParts[0] - 1) * that.partHeight);
						});
					}
				});
			}
		},


		/**
		 * Insert [data] as html to the report details table
		 * Then recalculate report details table row and columns sizes..
		 */
		refreshTableData: function(data) {

			var reportDetailsSideHtml = this._getCompiledTemplate(this.reportDetailsSide, {
				reportDetails: data
			});
			var reportDetailsPartialHtml = this._getCompiledTemplate(this.reportDetailsPartial, {
				reportDetails: data
			});

			var that = this;
			this.detailsSide.find('.tbody').prepend(reportDetailsSideHtml);
			this.detailsTable.find('.tbody').prepend(reportDetailsPartialHtml);
			that.recalculateTable(that);

			this.detailsSide.find('.tbody').stop().animate({opacity: 1}, 400);
			this.detailsTable.find('.tbody').stop().animate({opacity: 1}, 400, function() {
				ICAD.loader.hide();
			});
		},


		/**
		 * Recalculate report details table row and columns sizes
		 */
		recalculateTable: function(view) {
			// Calculate table inners width
			view.detailsInner.width(view.detailsTable.width());
			view.detailsHead.width(view.detailsTable.width());
			view.detailsSideInner.width(view.detailsSideTable.width());
			view.detailsSideHead.width(view.detailsSideTable.width());

			view.rowsDetailed = $(view.detailsTable.find('.tbody .tr'));
			view.rowsSide = $(view.detailsSideTable.find('.tbody .tr'));
			view.loadRows = view.rowsDetailed.size();
			view.defaultHeightLoadParts = view.rowsDetailed.size() * 30;
			view.liveHeightLoadParts = 0;

			view.answers = $(view.detailsTable.find('.answer'));

			view.rowsDetailed.each(function(k, v) {
				view.liveHeightLoadParts += $(this).height();
				$(view.rowsSide[k]).find(".td").height($(this).height());

				// detecting truncated element
				var $element = view.answers.eq(k).find("span");
				var $c = $element
					.clone()
					.css({display: 'inline', width: 'auto', visibility: 'hidden'})
					.appendTo('body');

				if( $c.width() > $element.width() ) {
					view.answers.eq(k).addClass("js-tooltip answer-tooltip");
				}
				$c.remove();

			});

			view.diffHeightLoadParts = view.liveHeightLoadParts - view.defaultHeightLoadParts;
			view.detailsSideInner.height(view.totalCount * view.itemHeight + view.diffHeightLoadParts);
			view.detailsInner.height(view.totalCount * view.itemHeight + view.diffHeightLoadParts);

			// Calculate table head elements width
			view.detailsSideHead.find('.th').each(function(k, v) {
				var itemWidth = $(view.detailsSideTable.find('.tbody .tr:first .td')[k]).outerWidth(true);
				$(this).css('width', itemWidth);
			});
			view.detailsHead.find('.th').each(function(k, v) {
				var itemWidth = $(view.detailsTable.find('.tbody .tr:first .td')[k]).outerWidth(true);
				$(this).css('width', itemWidth);
			});
		},


		/**
		 * Open tooltip by click on "creative question" field in report table when text is long ...
		 * @param e
		 */
		showTooltip: function(e) {
			e.stopPropagation();
			ICAD.reportTooltip.create(e.currentTarget, this);
			$(this.detailsTable).find(".answer-tooltip-open").removeClass("answer-tooltip-open");
			$(e.currentTarget).addClass('answer-tooltip-open');
		},


		/**
		 * Remove tooltip for "creative question" field in report table
		 */
		removeTooltip: function() {
			ICAD.reportTooltip.remove();
		},


		/**
		 * Redraw sort arrow of the report details table header
		 * Then refresh report details table content with new sort parameters
		 */
		rebuildTableAfterSort: function(e) {
			var that = this,
				$sortCol = $(e.currentTarget).find("span"),
				$columnsDetailed = that.detailsHead.find('.th span'),
				$columnsSide = that.detailsSideHead.find('.th span'),
				$columns =  $columnsSide.add($columnsDetailed),
				sortBy =    $sortCol.attr("data-sort"),
				sortOrder = $sortCol.attr("data-order"),
				sortObj = {
					sortBy: sortBy,
					sortOrder: sortOrder
				};

			$columns.not($sortCol).each(function() {
				$(this).attr("data-order", "");
			});

			switch (sortOrder) {
				case "":
					$sortCol.attr("data-order", "asc");
					sortOrder = "asc";
					sortObj.sortOrder = sortOrder;
					break;
				case "asc":
					$sortCol.attr("data-order", "desc");
					sortOrder = "desc";
					sortObj.sortOrder = sortOrder;
					break;
				case "desc":
					$sortCol.attr("data-order", "");
					sortOrder = "";
					sortObj.sortOrder = sortOrder;
					break;
				default:
					$sortCol.attr("data-order", "");
			}

			if (sortOrder == "") {
				sortObj.sortBy = ""
			}

			that.currentSort.sortBy = sortObj.sortBy;
			that.currentSort.sortOrder = sortObj.sortOrder;

			lazyLoadHelper.loadParts(that, sortObj);
		}
	});
});
