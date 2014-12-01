chrome.app.runtime.onLaunched.addListener(
	function (launchData) {
		chrome.app.window.create('index.html',
			{
				width: 510,
				height: 510
			}
		);
	}
);
