chrome.runtime.onInstalled.addListener(
	function() {
		chrome.storage.local.get("registered",
			function(result) {
				if (!result["registered"]) {
					var senderIDs = ["6212345092"];
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
		chrome.runtime.sendMessage('lgibpahbabcdefgobbmkfd',
		  message.data.message, {},
			function (response) {
				if (chrome.runtime.lastError)
					console.log('chrome.runtime.sendMessage error',
					  chrome.runtime.lastError);
				else
					console.log(response);
			}
		);
	}
);
//end
