"use strict";

//begin onload
window.onload = function () {

var ws = new WebSocket('ws://32.76.124.123:5002'); // Bus status server
ws.onclose = function () {
	showMessage('Not connected');
};
ws.onopen = function () {
	showMessage('Connected', true);
	ws.onmessage = function (event) {
		if (event.data) {
			showStatus(JSON.parse(event.data));
		}
		else
			showMessage('No data received');
	};
};
ws.onerror = function (e) {
	console.log(e);
}

document.querySelector("#update").addEventListener("click",
	function () {
		ws.send('update');
	}
);

// ... rest of app

//insert };
//end

function showStatus(obj) {
	var buses = [];
	var lineRef;
	obj.Siri.ServiceDelivery.VehicleMonitoringDelivery.forEach(
		function (vmd) {
			vmd.VehicleActivity.forEach(
				function (va) {
					var mvj = va.MonitoredVehicleJourney;
					buses.push(mvj);
					lineRef = mvj.LineRef;
				}
			);
		}
	);
	buses.sort(
		function(a, b) {
			return (a.VehicleRef < b.VehicleRef) ? -1 :
			  (a.VehicleRef > b.VehicleRef) ? 1 : 0;
		}
	);
	var s = "<b>" + lineRef + " &bull; " +
	  obj.Siri.ServiceDelivery.ResponseTimestamp + "</b>";
	buses.forEach(
		function (bus) {
			s += "<p>" + bus.VehicleRef + " &bull; " +
			  bus.DestinationName + "<br>";
			s += bus.MonitoredCall.StopPointName + " &bull; " +
			  bus.ProgressRate + " &bull; " +
			  bus.MonitoredCall.Extensions.Distances.PresentableDistance;
		}
	);
	document.querySelector('#results').innerHTML = s;
}

var timeoutID;

function showMessage(msg, good) {
	console.log(msg);
	var messageElement = document.querySelector("#message");
	messageElement.style.color = good ? "green" : "red";
	messageElement.innerHTML = msg;
	if (timeoutID)
		clearTimeout(timeoutID);
	timeoutID = setTimeout(
		function () {
			messageElement.innerHTML = "&nbsp;";
		},
		5000
	);
}
};
