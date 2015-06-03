detailsData = {

	loadData: function(url, data, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", url);
		xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xmlhttp.onload = function() {
			callback(xmlhttp.responseText);
		};
		xmlhttp.send("tx_smianalytics_smianalytics[formData]=" + encodeURIComponent(data));
	},

	prepareDataPart: function(data, request, callback) {

		function _cloneObj(obj) {
			if (obj === null || typeof obj !== 'object') {
				return obj;
			}
			var temp = obj.constructor(); // give temp the original obj's constructor
			for (var key in obj) {
				temp[key] = _cloneObj(obj[key]);
			}
			return temp;
		}

		//==== Speed test ====
		//var i;
		//var row = data.data.data[0];
		//data.data.data = [];
		//
		//for(i = 0; i <= 1000; i++) {
		//	data.data.data[i] = row
		//}

		// Clone data object for manipulations :)
		var dataPart = _cloneObj(data);

		var parts = request.parts;
		var sort = request.sort;
		var offset = (parts[0] - 1) * request.itemsPerPart;
		var limit = (parts[parts.length - 1]) * request.itemsPerPart;

		// If we need to sort data
		if (sort.sortBy.length)
			dataPart = detailsData.sortData(dataPart, sort);

		// Move Anonymous to bottom of data object
		dataPart = detailsData.downAnonymous(dataPart);

		// Take part of data for render in reporting details table
		dataPart.data.data = dataPart.data.data.slice(offset, limit);

		// Run callback that will fire [message] event of [details-data] web worker
		callback(dataPart);
	},


	sortData: function(dataPart, sort) {
		var userOrder = (sort.sortBy == "firstName" || sort.sortBy == "lastName") ? 'userName' : 'userData';

		// Sort magic goes here
		dataPart.data.data.sort(function(a, b) {

			if (typeof a[userOrder][sort.sortBy] == "number" && typeof b[userOrder][sort.sortBy] == "number") {
				if (a[userOrder][sort.sortBy] > b[userOrder][sort.sortBy])
					return (sort.sortOrder == "asc") ? 1 : -1;
				if (a[userOrder][sort.sortBy] < b[userOrder][sort.sortBy])
					return (sort.sortOrder == "asc") ? -1 : 1;
			} else {
				if (typeof a[userOrder][sort.sortBy] != 'string')
					a[userOrder][sort.sortBy] = a[userOrder][sort.sortBy] + String();
				if (typeof b[userOrder][sort.sortBy] != 'string')
					b[userOrder][sort.sortBy] = b[userOrder][sort.sortBy] + String();

				if (a[userOrder][sort.sortBy].trim().toLowerCase() > b[userOrder][sort.sortBy].trim().toLowerCase())
					return (sort.sortOrder == "asc") ? 1 : -1;
				if (a[userOrder][sort.sortBy].trim().toLowerCase() < b[userOrder][sort.sortBy].trim().toLowerCase())
					return (sort.sortOrder == "asc") ? -1 : 1;
			}

			//a must be equal to b
			return 0;
		});

		return dataPart;
	},


	downAnonymous: function(dataPart) {

		// Normalize Array
		function _cleanArr(arr, deleteValue) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] == deleteValue) {
					arr.splice(i, 1);
					i--;
				}
			}
			return arr;
		}

		var notAnonArr = [];
		var anon = false;

		for (var i = 0; i < dataPart.data.data.length; i++) {
			if (dataPart.data.data[i].userData.userId != 0) {
				notAnonArr[i] = dataPart.data.data[i];
			} else {
				anon = dataPart.data.data[i];
			}
		}

		if (anon) {
			notAnonArr.push(anon);       // Add anonymous to the end of data Array
			notAnonArr = _cleanArr(notAnonArr, undefined); // Normalize Array
		}

		dataPart.data.data = notAnonArr;

		return dataPart;
	}
};



