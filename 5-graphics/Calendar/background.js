chrome.app.runtime.onLaunched.addListener(
	function (launchData) {
		chrome.app.window.create('index.html');
		chrome.app.window.create('index.html',
			{
			},
			function (createdWindow) {
				createdWindow.contentWindow.outputType = 'Table';
			}
		);
		chrome.app.window.create('index.html',
			{
			},
			function (createdWindow) {
				createdWindow.contentWindow.outputType = 'HTML';
			}
		);
		chrome.app.window.create('index.html',
			{
			},
			function (createdWindow) {
				createdWindow.contentWindow.outputType = 'Canvas';
			}
		);
		chrome.app.window.create('index.html',
			{
			},
			function (createdWindow) {
				createdWindow.contentWindow.outputType = 'SVG';
			}
		);
		chrome.app.window.create('index.html',
			{
			},
			function (createdWindow) {
				createdWindow.contentWindow.outputType = 'PDF';
			}
		);
	}
);
