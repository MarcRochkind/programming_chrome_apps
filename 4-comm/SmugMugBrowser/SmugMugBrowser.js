"use strict";

var cats;

// Replace apiKey and apiSecret with valid ones.
var apiKey = 'abcdef12345';
var apiSecret = '12345abcdef';

var imageWin;
var imageWidth;

window.onload = function () {
	document.querySelector('#footer-right').innerText = 'Version ' +
	  chrome.runtime.getManifest().version;
	authorize();
	resizeHandler();
	document.querySelector('#refresh').addEventListener("click", getAlbums);
};

window.onresize = resizeHandler;

function resizeHandler() {
	var toolbarHeight = document.querySelector('#toolbar').offsetHeight;
	var scrollbarWidth = 20; // cross-platform guess
	imageWidth = window.innerWidth - document.querySelector('#toc').offsetWidth -
	  document.querySelector('#album').offsetWidth - scrollbarWidth;
	var img = document.querySelector('#bigimage');
	if (img)
		img.style['max-width'] = imageWidth + 'px';
	var h = window.innerHeight - 20 - 20;
	document.querySelector('#toc').style.height = (h - toolbarHeight) + 'px';
	document.querySelector('#album').style.height = h + 'px';
	document.querySelector('#imagecell').style.height = h + 'px';
	document.querySelector('#imagecell').style.width = (imageWidth + scrollbarWidth) + 'px';
}

function authorize() {
	SmugMugAPI.authorize(apiKey, apiSecret,
		function (success) {
			if (success) {
				console.log('authorized');
				getAlbums();
			}
			else {
				document.querySelector('#album').innerHTML =
				  '<p class=big>Authorization failed. Retrying...</p>';
				authorize();
			}
		}
	);
}

function getAlbums() {
	cats = {};
	document.querySelector('#toc').innerHTML = '';
	document.querySelector('#album').innerHTML =
	  '<p class=big>Waiting for gallery list...</p>';
	document.querySelector('#image').innerHTML = '';
	document.querySelector('#exifinfo').innerHTML = '';
	try {
		SmugMugAPI.callMethod('smugmug.albums.get',
			{
			},
			function (x) {
				buildTOC(x.Albums);
			}
		);
	}
	catch (e) {
		console.log('callSmugMug failed', e);
	}
}

function buildTOC(albums) {
	document.querySelector('#album').innerHTML = '';
	var html = '<ul id="album-list" class="collapsibleList">';
	albums.forEach(
		function (value, key) {
			var cat, subcat;

			if (value.Category)
				cat = value.Category.Name;
			else
				cat = 'No Category';
			if (value.SubCategory)
				subcat = value.SubCategory.Name;
			else
				subcat = 'No SubCategory';
			if (!cats[cat])
				cats[cat] = {};
			if (!cats[cat][subcat])
				cats[cat][subcat] = [];
			cats[cat][subcat].push(value);
		}
	);
	var ca = [];
	for (var c in cats)
		ca.push(c);
	ca.sort();
	ca.forEach(
		function (value, key) {
			var c = cats[value];
			html += '<li class=category>' + value;
			var sca = [];
			for (var sc in c)
				sca.push(sc);
			sca.sort();
			var haveSC = sca.length > 1 || sca[0] != 'No SubCategory';
			if (haveSC)
				html += '<ul>';
			sca.forEach(
				function (value, key) {
					var sc = c[value];
					if (haveSC)
						html += '<li class=subcategory>' + value;
					sc.sort(
						function (a, b) {
							if (a.Title < b.Title)
								return -1;
							else if (a.Title > b.Title)
								return 1;
							else
								return 0;
						}
					);
					html += '<ul>';
					sc.forEach(
						function (value, key) {
							html += '<li class=album id="id' + value.id +  '_' + value.Key + '">' + value.Title;
						}
					);
					html += '</ul>';
				}
			);
			if (haveSC)
				html += '</ul>';
		}
	);
	html += '</ul>';
	document.querySelector('#toc').innerHTML = html;
	CollapsibleLists.applyTo(document.getElementById('album-list'));
	albums.forEach(
		function (value, key) {
			document.querySelector('#id' + value.id +  '_' + value.Key).addEventListener("click",
				function(e) {
					console.dir(e.target);
					showAlbum(e.target.id, e.target.innerText);
				}
			);
		}
	);
}

function showAlbum(id_key, title) {
	document.querySelector('#album').innerHTML = '<p class=big>Wait...</p>';
	document.querySelector('#image').innerHTML = '';
	document.querySelector('#exifinfo').innerHTML = '';
	var a = id_key.substr(2).split('_');

	try {
		SmugMugAPI.callMethod('smugmug.images.get',
			{
				AlbumID: a[0],
				AlbumKey: a[1],
				Heavy: true
			},
			function (x) {
				showImages(x.Album.Images, '<a href="' + x.Album.URL + '" target=_blank><h1>' + title + '</h1></a>');
			}
		);
	}
	catch (e) {
		console.log('callSmugMug failed', e);
	}
}

function showImages(images, header) {
	document.querySelector('#image').innerHTML = '';
	document.querySelector('#exifinfo').innerHTML = '';
	var html = '';
	for (var i = 0; i < images.length; i++) {
		(function () {
			var image = images[i];
			if (i % 3 == 0)
				html += '<tr>';
			html += '<td><img class="image" id="id' + image.id + '"><p class="caption">' + image.Caption;
			var url = 'http://www.smugmug.com/photos/' + image.id +
			  '_' + image.Key + '-Ti.jpg';
			Ajax.ajaxSend(url, "blob",
				function (status, response) {
					var img = document.querySelector('#id' + image.id);
					if (img) {
						if (status === 200)
							img.src = webkitURL.createObjectURL(response);
						img.addEventListener("click",
							function(e) {
								showImage(image);
							}
						);
					}
				}
			);
		}());
	}
	document.querySelector('#album').innerHTML = header + '<table border=1 cellspacing=0 cellpadding=4>' +
	  html + '</table>';
}

function showImage(image) {
	document.querySelector('#image').innerHTML = '<img id=bigimage style="max-width:' +
	  imageWidth + 'px;">';
	document.querySelector('#exifinfo').innerHTML = '';
	Ajax.ajaxSend(image.XLargeURL, "blob",
		function (status, response) {
			var img = document.querySelector('#bigimage');
			if (status === 200)
				img.src = webkitURL.createObjectURL(response);
		}
	);
	SmugMugAPI.callMethod('smugmug.images.getEXIF',
		{
			ImageID: image.id,
			ImageKey: image.Key
		},
		function (x) {
			var html = '';
			for (var f in x.Image) {
				html += '<p class=exif><span class=exif_field>' + f +
				  ': </span><span class=exif_value>' + x.Image[f] + '</span></p>';
			}
			document.querySelector('#exifinfo').innerHTML = html;
		}
	);
}


function showSet(id) {
	SmugMugAPI.callMethod('flickr.photosets.getPhotos',
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
			Ajax.ajaxSend(url, "blob",
				function (status, response) {
					var blob_uri = webkitURL.createObjectURL(response);
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
			getAlbums();
		}
	);
}
