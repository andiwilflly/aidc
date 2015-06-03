self.addEventListener('message', function(e) {

	// Load helper for report details data sort
	importScripts('details-data-helper.js');

	function _getData() {
		return e.data.modelId + '&' + e.data.compareId + 'Id=' + e.data.objectId;
	}

	if(!self.reportingDetailsData) {
		// Get data from server when worker runs at first
		self.detailsData.loadData(e.data.formDetailedActionUri, _getData(), function(data) {
			data = JSON.parse(data);

			// Prepare data for render to the report details table.
			self.detailsData.prepareDataPart(data, e.data.request, function(currentData) {
				self.postMessage(currentData); // Fire [message] event
			});

			// Save report details data in worker global scope
			self.reportingDetailsData = data;
		});
	} else {
		// Prepare data for render to the report details table.
		self.detailsData.prepareDataPart(self.reportingDetailsData, e.data.request, function(currentData) {
			self.postMessage(currentData); // Fire [message] event
		});
	}

}, false);