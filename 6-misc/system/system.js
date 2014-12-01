"use strict";
window.onload = function () {

chrome.system.cpu.getInfo(
	function (info) {
		console.log(info);
	}
);

chrome.system.display.getInfo(
	function (info) {
		console.log(info);
	}
);

chrome.system.memory.getInfo(
	function (info) {
		console.log(info);
	}
);

chrome.system.network.getNetworkInterfaces(
	function (networkInterfaces) {
		console.log(networkInterfaces);
	}
);

chrome.system.storage.getInfo(
	function (info) {
		console.log(info);
	}
);

};
