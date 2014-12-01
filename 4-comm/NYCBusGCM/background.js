"use strict";

//begin onLaunched
var win;

chrome.app.runtime.onLaunched.addListener(
	function (launchData) {
		chrome.app.window.create('index.html', null,
			function (createdWindow) {
				win = createdWindow.contentWindow;
			}
		);
	}
);
//end

//begin onInstalled
chrome.runtime.onInstalled.addListener(
	function() {
		chrome.storage.local.get("registered",
			function(result) {
				if (!result["registered"]) {
					var senderIDs = ["624373345092"];
					chrome.gcm.register(senderIDs,
						function (registrationID) {
							console.log(registrationID);
							if (chrome.runtime.lastError)
								console.log(chrome.runtime.lastError);
							else
								sendRegistrationID(registrationID);
						}
					);
				}
			}
		);
	}
);
//end

function sendRegistrationID(registrationID) {
	// Should use https
	Ajax.ajaxSend("http://basepath.com/servers/gcmv2-bus.php?regid=" +
	  registrationID, 'json',
		function (status, response) {
			if (status == 200)
				chrome.storage.local.set(
					{
						registered: true
					}
				);
			else
				console.log('Error sending registrationID');
		}
	);
}

//begin onMessage
chrome.gcm.onMessage.addListener(
	function(message) {
		console.log('chrome.gcm.onMessage', message);
		win.postMessage(message, '*');
	}
);
//end
