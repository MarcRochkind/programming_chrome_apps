"use strict";
window.onload = function () {
	var canvas = document.querySelector('#cvs');
	var canvasContext = canvas.getContext('2d');
	var img = document.querySelector('#boat');
	canvasContext.drawImage(img, 0, 0, 200, 200);
};
