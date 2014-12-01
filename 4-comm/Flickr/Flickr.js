"use strict";

// Replace apiKey and apiSecret with valid ones.
var apiKey = 'abcdef12345';
var apiSecret = '12345abcdef';

window.onload = function () {
	Flickr.authorize(apiKey, apiSecret,
		function () {
			console.log('authorized');
			getSets();
		}
	);
};

function getSets() {
	try {
		Flickr.callMethod('flickr.photosets.getList',
			{
				primary_photo_extras: 'url_t'
			},
			function (x) {
				showSets(x.photosets.photoset);
			}
		);
	}
	catch (e) {
		console.log('callFlickr failed', e);
	}
}

function showSets(sets) {
	var numBlobs = 0;
	for (var i = 0; i < sets.length; i++) {
		(function () {
			var st = sets[i];
			var url = st.primary_photo_extras.url_t;
			console.log(url);
			Ajax.ajaxSend(url, "blob",
				function (status, response) {
					var blob_uri = URL.createObjectURL(response);
					st.blob_uri = blob_uri;
					if (++numBlobs == sets.length)
						gotSetBlobs(sets);
				}
			);
		}());
	}
}

function gotSetBlobs(sets) {
	console.dir(sets);
	var html = '';
	for (var i = 0; i < sets.length; i++) {
		var st = sets[i];
		if (i % 4 == 0)
			html += '<tr>';
		html += '<td><img class="image" id="' + st.id + '" src="' + st.blob_uri + '"><p class="caption">' + st.title._content;
	}
	document.querySelector('#content').innerHTML = '<table border=1 cellspacing=0 cellpadding=4>' + html + '</table>';
	var images = document.getElementsByClassName("image");
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener("click",
        	function(e) {
        		console.dir(e.target.id);
        		showSet(e.target.id);
        	}
        );
    }
}

function showSet(id) {
	Flickr.callMethod('flickr.photosets.getPhotos',
		{
			photoset_id: id,
			extras: 'url_t'
		},
		function (x) {
			showPhotos(x.photoset.photo);
		}
	);
}

function showPhotos(photos) {
	var numBlobs = 0;
	for (var i = 0; i < photos.length; i++) {
		(function () {
			var p = photos[i];
			var url = p.url_t;
			console.log(url);
			Ajax.ajaxSend(url, "blob",
				function (status, response) {
					var blob_uri = URL.createObjectURL(response);
					p.blob_uri = blob_uri;
					if (++numBlobs == photos.length)
						gotPhotoBlobs(photos);
				}
			);
		}());
	}
}

function gotPhotoBlobs(photos) {
	var html = '';
	for (var i = 0; i < photos.length; i++) {
		var p = photos[i];
		if (i % 4 == 0)
			html += '<tr>';
		html += '<td><img class="image" id="' + p.id + '" src="' + p.blob_uri + '"><p class="caption">' + p.title;
	}
	document.querySelector('#content').innerHTML =
	  '<button id="back_to_sets">Back to Sets</button>' +
	  '<table border=1 cellspacing=0 cellpadding=4>' + html + '</table>';
    document.querySelector('#back_to_sets').addEventListener("click",
		function(e) {
			getSets();
		}
	);
}
