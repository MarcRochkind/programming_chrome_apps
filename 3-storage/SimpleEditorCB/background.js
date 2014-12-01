chrome.app.runtime.onLaunched.addListener(
	function (launchData) {
		// Change to index2.html for options button.
		chrome.app.window.create('index.html');
	}
);
