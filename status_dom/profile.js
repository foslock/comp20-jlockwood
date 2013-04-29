var savedStatuses = "";
var divider = "%%%!!!%%%";

function insertStatus(status) {
	var status_div = document.getElementById('status');
	var txtNode = document.createTextNode(status); 
	var p = document.createElement('p');
	p.appendChild(txtNode);
	status_div.insertBefore(p, status_div.firstChild);
}

function post_status(name) {
	var text = document.getElementById('msg').value;
	var d = new Date();
	var curr_day = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var fullString = curr_month + "/" + curr_day + "/" + curr_year + " " + curr_hour + ":" + curr_min + " - " + text
	insertStatus(fullString);
	document.getElementById('msg').value = "";
	savedStatuses += fullString + divider;
	localStorage.statues = savedStatuses;
}

function bodyLoaded() {
	// eraseCookie('saved');
	savedStatuses = localStorage.statues;
	if (!savedStatuses) {
		savedStatuses = "";
	} else {
		var statuses = savedStatuses.split(divider);
		for (var i = 0; i < statuses.length; i++) {
			insertStatus(statuses[i]);
		}
	}
}