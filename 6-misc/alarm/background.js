chrome.runtime.onInstalled.addListener(
	function() {
		chrome.alarms.create("alarm-stretch",
			{
				when: Date.now() + 10 * 1000, // in 10 seconds
				periodInMinutes: 20
			}
		);
	}
);

chrome.alarms.onAlarm.addListener(
	function(alarm) {
		chrome.notifications.create(
			'',
			{
				type: 'basic',
				iconUrl: 'icon128-alarm.png',
				title: "Alarm",
				message: 'Stand up and stretch!'
			},
			function (notificationID) {
			}
		);
	}
);
