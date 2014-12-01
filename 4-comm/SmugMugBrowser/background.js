chrome.app.runtime.onLaunched.addListener(
	function (launchData) {
		chrome.app.window.create(
			'index.html',
			{
				id: 'SmugMugPix',
				width: 1000,
				height: 650
			}
		);
	}
);
