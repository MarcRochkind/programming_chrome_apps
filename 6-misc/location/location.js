"use strict";
window.onload = function () {

chrome.location.watchLocation('', {});

chrome.location.onLocationUpdate.addListener(
	function(position) {
		document.querySelector('#para').innerText = "You are at " +
		  position.coords.latitude + ' ' + position.coords.longitude;
	}
);

};
