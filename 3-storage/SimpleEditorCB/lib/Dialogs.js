// http://raventools.com/blog/create-a-modal-dialog-using-css-and-javascript/
// http://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example

var Dialogs = (function () {
	return {

alert: function (msg) {
	this.dialog("<p>" + msg + "</p><button id='dlg-close'>OK</button>",
		[
			{
				id: 'dlg-close'
			}
		]
	);
},

//begin confirm
confirm: function(msg, btnYes, btnNo, actionYes, actionNo) {
	this.dialog(
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
},
//end

dialog: function(html, actions, init) {
	var funcs = [];
	overlay();
	document.getElementById("dlg-content").innerHTML = html;
	for (var i = 0; i < actions.length; i++) {
		funcs[i] = (function(index) {   
			return function() { // index bound here instead to function dialog
				overlay();
				if (actions[index].action)
					actions[index].action();
			} 
		})(i);
		document.getElementById(actions[i].id).addEventListener("click", funcs[i]);
	}
	if (init)
		init();
}

}

function example() {
// This version is wrong!
function dialog(html, actions) {
	overlay();
	document.getElementById("dlg-content").innerHTML = html;
	for (var i = 0; i < actions.length; i++) {
		document.getElementById(actions[i].id).addEventListener("click",
			function () {
				overlay();
				if (actions[i].action) // i is bound to function dialog
					actions[i].action();
			}
		);
	}
}
}

function setup() {
	if (!document.querySelector("#dlg-overlay")) {
		var div = document.createElement("div");
		div.id = 'dlg-overlay';
		div.innerHTML = "<div id='dlg-content'></div>";
		document.body.appendChild(div);
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML =
			"#dlg-overlay {" +
			"	visibility: hidden;" +
			"	position: absolute;" +
			"	left: 0px;" +
			"	top: 0px;" +
			"	width: 100%;" +
			"	height: 100%;" +
			"	text-align: center;" +
			"	z-index: 1000;" +
			"	background-color: rgba(100, 100, 100, .2);" +
			"}" +
			"#dlg-content {" +
			"	width: 280px;" +
			"	margin: 100px auto;" +
			"	background-color: white;" +
			"	border: 1px solid black;" +
			"	border-radius: 10px;" +
			"	padding: 10px;" +
			"	text-align: center;" +
			"}";
		document.body.appendChild(css);
	}
}

function overlay() {
	setup();
	var el = document.getElementById("dlg-overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
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
