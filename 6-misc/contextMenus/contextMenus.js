"use strict";
window.onload = function () {

function done() {
	if (chrome.runtime.lastError)
		console.log(chrome.runtime.lastError);
}

chrome.contextMenus.create(
	{
		id: "menu-item-1",
		title: "Menu Item 1"
	},
	done
);
chrome.contextMenus.create(
	{
		id: "menu-item-2",
		title: "Menu Item 2"
	},
	done
);

chrome.contextMenus.onClicked.addListener(
	function (info) {
		document.querySelector('#para').innerText =
		  "You clicked " + info.menuItemId;
	}
);

};
