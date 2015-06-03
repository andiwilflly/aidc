define([
], function() {

	var _updateCurrentParts = function(view) {
		var scrollTop = view.detailsWrapper.scrollTop() + 30,
			currentPart = Math.ceil((scrollTop + 450) / view.partHeight),
			currentPartsArr = [],
			currentHeight = currentPart * view.partHeight,
			delta = currentHeight - (scrollTop + 450),
			diff = view.partHeight - 450;

		currentPartsArr.push(currentPart);

		if( delta > diff ) {
			currentPartsArr.unshift( currentPart - 1 );
		}

		return currentPartsArr;
	};

	return {
		loadParts: function(view, sortObj) {

			// Compare liveSort and currentSort objects
			var isEqualCurrentLiveSort = _.isEqual(view.liveSort, sortObj);

			// Update current part
			view.currentParts = _updateCurrentParts(view);

			var loadNewParts = false;
			if (_.indexOf(view.currentParts, view.reportDetailsLimit) == -1) {
				$.each(view.currentParts, function(k, v) {
					if (_.indexOf(view.liveParts, v) == -1) {
						loadNewParts = true
					}
				});
			}

			if (isEqualCurrentLiveSort == false) {
				loadNewParts = true;
			}

			// Run if need to load new parts of details report
			if (loadNewParts) {
				ICAD.loader.show($('#reporting-details'));

				view.detailsSide.find('.tbody').stop().animate({opacity: 0}, 400);
				view.detailsTable.find('.tbody').stop().animate({opacity: 0}, 400, function() {
					// Send data to worker. (Callback inside view.initialize() function)
					view.sendMessageToWorker(sortObj);
				});
				// Update liveParts
				view.liveParts = view.currentParts;
				// Update liveSort
				view.liveSort = ICAD.cloneObject(sortObj);
			}
		}
	};
});