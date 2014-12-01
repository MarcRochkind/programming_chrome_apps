"use strict";

var msgs = Array();

window.addEventListener("message",
	function (messageEvent) {
		showStatus(messageEvent.data.data.message);
	}
);

function showStatus(message) {
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
