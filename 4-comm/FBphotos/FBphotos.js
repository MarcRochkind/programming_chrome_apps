"use strict";

//begin onload
window.onload = function () {
//skipbegin
//var layout = Photo.layout; // for advanced layout
//skipend

// Replace first arg with a valid clientID.
Facebook.authorize('123456789', 'user_photos',
	function () {
		getPhotos();
	}
);
window.onresize = layoutPhotos;

// ... rest of app

//insert };
//end

// delay appending to DOM until all photos are converted so order is kept

//begin getPhotos_code
var photos;

function getPhotos() {
	Facebook.call('/me/photos/uploaded',
		function (response) {
			photos = response.data;
			var blobCount = 0;
			photos.forEach(
				function (photo) {
					Photo.getBlobUri(photo.source,
						function (blob_uri) {
							photo.blob_uri = blob_uri;
							if (++blobCount === photos.length)
								layoutPhotos();
						}
					);
				}
			);
		}
	);
}
//end

//begin layoutPhotos_code
function layoutPhotos() {
	var gap = 5;
	var div = document.querySelector('#content');
	while (div.firstChild)
		div.removeChild(div.firstChild);
	var totalHeight = layout(photos, div.clientWidth, div.clientHeight / 4, gap);
	var img;
	photos.forEach(
		function (photo) {
			img = new Image();
			img.src = photo.blob_uri;
			img.style['max-width'] = photo.xWidth + 'px';
			img.style['max-height'] = photo.xHeight + 'px';
			img.style['left'] = photo.xLeft + 'px';
			img.style['top'] = photo.xTop + 'px';
			img.style['position'] = 'absolute';
			div.appendChild(img);
		}
	);
	img.style['margin-bottom'] = gap + 'px'; // gap at bottom of whole div
}

function layout(photos, targetWidth, targetHeight, gap) {
	var x = gap;
	var y = gap;
	photos.forEach(
		function (photo) {
			photo.xHeight = targetHeight;
			photo.xWidth = photo.width * targetHeight / photo.height;
			var cellWidth = photo.xWidth + 5;
			if (x + cellWidth > targetWidth) {
				x = gap;
				y += targetHeight + gap;
			}
			photo.xLeft = x;
			photo.xTop = y;
			x += cellWidth;
		}
	);
}
//end

};
