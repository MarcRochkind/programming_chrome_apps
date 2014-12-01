"use strict";

//begin onload
window.onload = function () {
	chrome.runtime.onMessageExternal.addListener(
		function(message, sender) {
			console.log('chrome.runtime.onMessageExternal', message);
			showStatus(message);
		}
	);
};
//end

var msgs = Array();

function showStatus(message) {
try {
	var body = document.querySelector('body');
	body.innerHTML = '';
	var a = message.split('@');
	if (a.length > 1)
		document.title = a[1];
	msgs.push(a[0]);
	if (msgs.length > 10)
		msgs.shift();
	for (var i = msgs.length - 1; i >= 0; i--)
		body.insertAdjacentHTML('beforeend',
		  "<p>" + msgs[i]);
}
catch (e) {
	console.log(e);
}
}
