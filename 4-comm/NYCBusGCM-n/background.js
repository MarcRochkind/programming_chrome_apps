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
		var a = message.data.message.split('@');
		var title = 'Bus Status';
		if (a.length > 1)
			title = a[1];
		chrome.notifications.create(
			'',
			{
				type: 'basic',
				iconUrl: 'icon128-bus.png',
				title: title,
				message: a[0]
			},
			function (notificationID) {
			}
		);
	}
);
//end
