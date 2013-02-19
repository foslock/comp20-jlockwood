// Javascript here!

var start_where = function() {
	latlng = new google.maps.LatLng(-34.397, 150.644);
	myOptions = {
		center: latlng,
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
};