"use strict";
//begin app1
window.onload = function () {

var img = document.querySelector('#img');
var video = document.querySelector('#video');

navigator.webkitGetUserMedia({video: true, audio: true},
	function(localMediaStream) {
		video.src = window.URL.createObjectURL(localMediaStream);
		video.onloadedmetadata = function(e) {
			// ... video is loaded ...
		};
	},
	function(e) {
		console.log('Error:', e);
	}
);

//insert };
//end

//begin app2
var maxWidth = 300;

function capture() {
	var canvas = document.createElement('canvas');
	canvas.width = maxWidth;
	canvas.height = video.videoHeight * maxWidth / video.videoWidth;
	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
	var data = canvas.toDataURL('image/png');
	img.setAttribute('src', data);
}

document.querySelector('#shutter').onclick = capture;
//end

};
