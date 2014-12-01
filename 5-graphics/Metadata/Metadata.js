"use strict";

window.onload = function () {

chrome.fileSystem.chooseEntry(
	{
		type: 'openFile'
	},
	function (fileEntry) {
		if (fileEntry) {
			fileEntry.file(
				function (file) {
					document.querySelector('#img').src =
					  URL.createObjectURL(file);
				}
			);
			(new ExifData.Exif(fileEntry)).getMetadata(
				function (metadata, thumbURL) {
					if (thumbURL)
						document.querySelector('#thumb').src= thumbURL;
					if (metadata)
						document.querySelector('#metadata').innerText= metadata;
				}
			);
		}
	}
);

};
