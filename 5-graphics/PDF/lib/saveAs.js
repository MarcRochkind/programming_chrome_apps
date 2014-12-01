function saveAs(blob, options) { // Must be global.
	chrome.fileSystem.chooseEntry(
		{
			type: 'saveFile'
		},
		function (entry) {
			if (entry)
				saveToEntry(blob, options, entry);
		}
	);
}

function saveToEntry(blob, options, entry) {
	entry.createWriter(
		function(writer) {
			writer.onerror = errorHandler;
			writer.truncate(0);
			writer.onwriteend = function () {
				writer.write(blob);
				writer.onwriteend = function () {
					if (options.callback)
						options.callback(blob, entry);
				};
			};
		},
		errorHandler
	);
}

function errorHandler(e) {
	console.log(e);
}
