"use strict";
window.onload = function () {
	document.querySelector("#alert").addEventListener("click",
		function () {
			Dialogs.alert("This is the alert.");
		}
	);
	document.querySelector("#confirm").addEventListener("click",
		function () {
			Dialogs.confirm("Click one of the buttons:", "Yes", "No",
				function () {
					Dialogs.alert("You clicked Yes");
				},
				function () {
					Dialogs.alert("You clicked No");
				}
			);
		}
	);
};
