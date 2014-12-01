"use strict";
window.onload = function () {
	document.querySelector("#convert").addEventListener("click",
		function () {
			var meters = document.querySelector("#meters");
			var feet = document.querySelector("#feet");
			feet.value = meters.value * 3.28084;
		}
	);
};
