// Javascript here!

var map;

var redline_stations = [{
		name: "Alewife Station",
		sb: "",
		nb: "RALEN",
		lat: 42.395428,
		lon: -71.142483
	},{
		name: "Davis Station",
		sb: "RDAVS",
		nb: "RDAVN",
		lat: 42.39674,
		lon: -71.121815
	},{
		name: "Porter Station",
		sb: "RPORS",
		nb: "RPORN",
		lat: 42.3884,
		lon: -71.119149
	},{
		name: "Harvard Station",
		sb: "RHARS",
		nb: "RHARN",
		lat: 42.373362,
		lon: -71.118956
	},{
		name: "Central Station",
		sb: "RCENS",
		nb: "RCENN",
		lat: 42.365486,
		lon: -71.103802
	},{
		name: "Kendall Station",
		sb: "RKENS",
		nb: "RKENN",
		lat: 42.36249079,
		lon: -71.08617653
	},{
		name: "Charles Station",
		sb: "RMGHS",
		nb: "RMGHN",
		lat: 42.361166,
		lon: -71.070628
	},{
		name: "Park St. Station",
		sb: "RPRKS",
		nb: "RPRKN",
		lat: 42.35639457,
		lon: -71.0624242
	},{
		name: "Downtown Crossing Station",
		sb: "RDTCS",
		nb: "RDTCN",
		lat: 42.355518,
		lon: -71.060225
	},{
		name: "South Station",
		sb: "RSOUS",
		nb: "RSOUN",
		lat: 42.352271,
		lon: -71.055242
	},{
		name: "Broadway Station",
		sb: "RBROS",
		nb: "RBRON",
		lat: 42.342622,
		lon: -71.056967
	},{
		name: "Andrew Station",
		sb: "RANDS",
		nb: "RANDN",
		lat: 42.330154,
		lon: -71.057655
	},{
		name: "JFK/UMass Station",
		sb: "RJFKS",
		nb: "RJFKN",
		lat: 42.320685,
		lon: -71.052391
	},{
		name: "Savin Hill Station",
		sb: "RJFKS",
		nb: "RJFKN",
		lat: 42.31129,
		lon: -71.053331
	},{
		name: "Fields Corner Station",
		sb: "RFIES",
		nb: "RFIEN",
		lat: 42.300093,
		lon: -71.061667
	},{
		name: "Shawmut Station",
		sb: "RSHAS",
		nb: "RSHAN",
		lat: 42.29312583,
		lon: -71.06573796
	},{
		name: "Ashmont Station",
		sb: "RASHS",
		nb: "",
		lat: 42.29312583,
		lon: -71.06573796
	},{
		name: "North Quincy Station",
		sb: "RNQUS",
		nb: "RNQUN",
		lat: 42.275275,
		lon: -71.029583
	},{
		name: "Wollaston Station",
		sb: "RWOLS",
		nb: "RWOLN",
		lat: 42.2665139,
		lon: -71.0203369
	},{
		name: "Quincy Center Station",
		sb: "RQUCS",
		nb: "RQUCN",
		lat: 42.251809,
		lon: -71.005409
	},{
		name: "Quincy Adams Station",
		sb: "RQUAS",
		nb: "RQUAN",
		lat: 42.233391,
		lon: -71.007153
	},{
		name: "Braintree Station",
		sb: "RBRAS",
		nb: "",
		lat: 42.2078543,
		lon: -71.0011385
	}]


Number.prototype.toRad = function() {
	return this * Math.PI / 180;
};

var getDist = function(pos1, pos2) {
	var R = 6371; // km

	var lat1 = pos1.lat();
	var lon1 = pos1.lng();
	var lat2 = pos2.lat();
	var lon2 = pos2.lng();

	var x1 = lat2-lat1;
	var dLat = x1.toRad();
	var x2 = lon2-lon1;
	var dLon = x2.toRad();
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
	                Math.sin(dLon/2) * Math.sin(dLon/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return R * c;
};

var locate_user = function(success, failure) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, failure);
	} else {
		failure(null);
	}
};

var updateRelativeDistance = function(person, dist) {
	if (person == 'carmen') {
		var container = document.getElementById('info_container');
		container.style.display = "block";
		var ele = document.getElementById('carmen_info');
		ele.innerHTML = "Distance to Carmen: " + dist.toFixed(1) + " miles<br/>";
	} else if (person == 'waldo') {
		var container = document.getElementById('info_container');
		container.style.display = "block";
		var ele = document.getElementById('waldo_info');
		ele.innerHTML = "Distance to Waldo: " + dist.toFixed(1) + " miles";
	}
}

var make_request_for_json = function(url, success, error) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var text = request.responseText;
			var json = JSON.parse(text);
			success(json);
		} else if (request.readyState == 4 && request.status == 404) {
			error(request.status);
		}
	};
	request.open("GET", url, true);
	request.send();
}

var place_stations = function(map) {
	var latlngarray = [];
	var markerArray = [];

	var create_infowindow = function(marker, content) {
		// Create window to show when clicked
		var ele = document.createElement('table');
		ele.setAttribute('border', '1');
		ele.innerHTML = "<caption>" + content + "</caption>";
		ele.innerHTML += "<tr><th>Train Direction</th><th>Time Remaining</th></tr>";
		var infoWindow = new google.maps.InfoWindow({
			content: ele,
		});

		marker.infoWindow = infoWindow;
		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.open(map, marker);
		});
	}

	for (var i = 0; i < redline_stations.length; i++) {
		var station = redline_stations[i];
		latlngarray.push(new google.maps.LatLng(station['lat'], station['lon']));

		// Create image for marker
		var markerImage = new google.maps.MarkerImage('mbta.png');
		markerImage.scaledSize = new google.maps.Size(32, 32);
		markerImage.anchor = new google.maps.Point(16, 16);

		// Create marker object
		var stationMarker = new google.maps.Marker({
			map: map,
			icon: markerImage,
			position: new google.maps.LatLng(station['lat'], station['lon'])
		});

		stationMarker.station = station;
		markerArray.push(stationMarker);
		stationMarker.setTitle(station['name']);
		create_infowindow(stationMarker, station['name']);
	}

	var polyLine = new google.maps.Polyline({
		map: map,
		path: latlngarray.slice(0,16),
		strokeColor: 'red',
		strokeWeight: 8,
		strokeOpacity: 0.5,
	});
	var otherArray = [latlngarray[13]].concat(latlngarray.splice(17, 20));
	var polyLine = new google.maps.Polyline({
		map: map,
		path: otherArray,
		strokeColor: 'red',
		strokeWeight: 8,
		strokeOpacity: 0.5,
	});

	return markerArray;
}

var retrieve_redline_data = function(success, error) {
	make_request_for_json("http://mbtamap-cedar.herokuapp.com/mapper/redline.json",
		success, error);
};

var retrieve_people = function(success, error) {
	make_request_for_json("http://messagehub.herokuapp.com/a3.json",
		success, error);
};

var start_where = function() {
	map = new google.maps.Map(document.getElementById("map_canvas"), {
		center: new google.maps.LatLng(42.409, -71.111), // Medford
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		noClear: true
	});

	var container = document.getElementById('info_container');
	container.style.display = "none";

	// Place the locations of the redline stations
	var markers = place_stations(map);

	// Get and draw the MBTA data via the json
	retrieve_redline_data(function(jsonObj) {
		// Success
		for (var i = 0; i < jsonObj.length; i++) {
			var stop = jsonObj[i];
			if (stop['InformationType'] == 'Predicted') {
				var insert_stop = function(stop, marker, dir) {
					var node = marker.infoWindow.content;
					var ele = document.createElement('tr');
					if (dir == 'nb') {
						ele.innerHTML += "<td>North Bound</td>";
					} else {
						ele.innerHTML += "<td>South Bound</td>";
					}
					ele.innerHTML += "<td>" + stop['TimeRemaining'] + "</td>";
					node.appendChild(ele);
				}
				for (var j = 0; j < markers.length; j++) {
					var marker = markers[j];
					if (marker.station['nb'] == stop['PlatformKey']) {
						// Northbound
						insert_stop(stop, marker, 'nb');
					} else if (marker.station['sb'] == stop['PlatformKey']) {
						// Southbound
						insert_stop(stop, marker, 'sb');
					}
				}
			}
		}
	}, function(error) {
		// Error
		// console.log(error);
	});

	// Locate the user, place marker and info window on map
	locate_user(function(position) {
		var center = new google.maps.LatLng(position.coords.latitude,
											position.coords.longitude);

		// Get Carmen and waldo (possibly) and place them on map
		retrieve_people(function(jsonObj) {
			// Success
			for (var i = 0; i < jsonObj.length; i++) {
				var person = jsonObj[i];
				var loc = person['loc'];
				var pos = new google.maps.LatLng(loc['latitude'], loc['longitude']);
				if (person['name'] == 'Carmen Sandiego') {
					new google.maps.Marker({
						map: map,
						icon: 'carmen.png',
						position: pos
					});
					updateRelativeDistance('carmen', getDist(center, pos));
				} else if (person['name'] == 'Waldo') {
					new google.maps.Marker({
						map: map,
						icon: 'waldo.png',
						position: pos
					});
					updateRelativeDistance('waldo', getDist(center, pos));
				}
			}
		}, function(error) {
			// Error
			// console.log(error);
		});

		// Find closest station
		var curDist = Number.MAX_VALUE;
		var curStation = null;
		for (var i = 0; i < redline_stations.length; i++) {
			var station = redline_stations[i];
			var ll = new google.maps.LatLng(station['lat'], station['lon']);
			var dist = getDist(center, ll);
			if (dist < curDist) {
				curDist = dist;
				curStation = station['name'];
			}
		}

		map.setCenter(center);
		map.setZoom(13);
		var userMarker = new google.maps.Marker({
			map: map,
			position: center,
		});
		var userInfoWindow = new google.maps.InfoWindow({
			content: "You are here, " + curDist.toFixed(1) + " miles away from " + curStation,
		});
		userInfoWindow.open(map, userMarker);
		google.maps.event.addListener(userMarker, 'click', function() {
			userInfoWindow.open(map, userMarker);
		});
	}, function(error) {
		console.log("Error occured: " + error.code);
	})
};