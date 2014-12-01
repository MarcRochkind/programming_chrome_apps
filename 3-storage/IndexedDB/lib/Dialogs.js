// http://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
"use strict";

var Dialogs = (function () {
	var dlg;

	return {

//begin alert
alert: function (msg) {
	dialog("<p>" + msg + "</p><button id='dlg-close'>OK</button>",
		[
			{
				id: 'dlg-close'
			}
		]
	);
},
//end

//begin confirm
confirm: function(msg, btnYes, btnNo, actionYes, actionNo) {
	dialog(
	  "<p>" + msg + "</p><button id='dlg-no'>" + btnNo + "</button>" +
	  "<button id='dlg-yes'>" + btnYes + "</button>",
		[
			{
				id: "dlg-no",
				action: actionNo
			},
			{
				id: "dlg-yes",
				action: actionYes
			}
		]
	);
}
//end

}

function example() {
// This version is wrong!
function dialog(html, actions) {
	// ...
	document.getElementById("dlg-content").innerHTML = html;
	for (var i = 0; i < actions.length; i++) {
		document.getElementById(actions[i].id).addEventListener("click",
			function () {
				dlg.close();
				if (actions[i].action) // i is bound to function dialog
					actions[i].action();
			}
		);
	}
}
}

//begin dialog-fcn
function dialog(html, actions) {
	setup();
	dlg.innerHTML = html;
	dlg.showModal();
	var funcs = [];
	for (var i = 0; i < actions.length; i++) {
		funcs[i] = (function(index) {   
			return function() { // index bound here instead to function dialog
				dlg.close();
				if (actions[index].action)
					actions[index].action();
			} 
		})(i);
		document.getElementById(actions[i].id).addEventListener("click", funcs[i]);
	}
}
//end

function setup() {
	if (!document.querySelector("#dlg-dialog")) {
		dlg = document.createElement("dialog");
		dlg.id = 'dlg-dialog';
		document.body.appendChild(dlg);
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML =
			"#dlg-dialog {" +
			"	border: 1px solid rgba(0, 0, 0, 0.3);" +
			"	border-radius: 6px;" +
			"	box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);" +
			"}";
		document.body.appendChild(css);
	}
}

})();

function example_code() {
//begin example_code_Dialogs
var Dialogs = (function () {
	return {
		alert: function (msg) {
			// put up the alert dialog
		},
		
		confirm: function(msg, btnYes, btnNo, actionYes, actionNo) {
			// put up the confirm dialog
		}
	}

	function internal_function1() {
		// ...
	}

	function internal_function2() {
		// ...
	}
})();
//end
}
