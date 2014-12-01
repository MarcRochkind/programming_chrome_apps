"use strict";

//begin onload
window.onload = function () {

var entriesHolder;
var stack;

getMediaFileSystems();

function getMediaFileSystems() {
	stack = [];
	document.querySelector('#toc').innerHTML = '<p id="heading">Media File Systems</p>';
	chrome.mediaGalleries.getMediaFileSystems(
		{interactive: 'yes'},
		function (mediaFileSystems) {
			var id = 0;
			entriesHolder = [];
			mediaFileSystems.forEach(
				function(item, indx, arr) {
					var mData = chrome.mediaGalleries.getMediaFileSystemMetadata(item);
					document.querySelector('#toc').insertAdjacentHTML(
					  'beforeend',
					  '<p><a href="" class="de" id=' + id++ + '>' + mData.name + '</a>');
					entriesHolder.push(item.root);
				}
			);
		}
	);
}

//insert // ... rest of app ...
//insert };
//end

//begin onclick
document.querySelector('#toc').onclick = function (e) {
	if (e.target && e.target.nodeName == 'A') {
		if (e.target.id === 'back') {
			if (stack.length > 1) {
				stack.pop();
				var x = stack.pop();
				doDirectoryEntry(x.item, x.name);
			}
			else
				getMediaFileSystems();
		}
		else if (e.target.className === "de") {
			doDirectoryEntry(entriesHolder[parseInt(e.target.id)], e.target.innerText);
		}
		else if (e.target.className === "media") {
			showMedia(entriesHolder[parseInt(e.target.id)]);
		}
	}
	return false;
}
//end

function showMedia(item) {
	var viewDiv = document.querySelector('#view');
	var metadataDiv = document.querySelector('#metadata');
	viewDiv.innerHTML = '';
	metadataDiv.innerHTML = '';
	viewDiv.insertAdjacentHTML('beforeend', '<p>' + item.name + '</p>');
	item.file(
		function (file) {
			chrome.mediaGalleries.getMetadata(file, {},
				function (metadata) {
					if (metadata && metadata.mimeType) {
						var element;
						var mediaType = metadata.mimeType.split('/')[0];
						var elementName = mediaType === 'image' ? 'img' : mediaType;
						element = document.createElement(elementName);
						element.setAttribute("controls", "controls");
						viewDiv.appendChild(element);
						element.style['max-width'] = '700px';
						element.style['max-height'] = '700px';
						element.src = URL.createObjectURL(file);
					}
				}
			);
		},
		error
	);
	if (item.metadata)
		metadataDiv.innerText = item.metadata;
}

function doDirectoryEntry(de, name) {
	stack.push({ item: de, name: name });
	if (!name)
		name = de.name;
	document.querySelector('#toc').innerHTML = '';
	document.querySelector('#toc').insertAdjacentHTML(
	  'beforeend',
	  '<p><a href="" id="back">Back</a>');
	document.querySelector('#toc').insertAdjacentHTML(
	  'beforeend',
	  '<p id="heading">' + name + '</p>');
	var id = 0;
	entriesHolder = [];
	var dr = de.createReader();
	dr.readEntries(
		function (entries) {
			entries.forEach(
				function(item, indx, arr) {
					if (item.isDirectory) {
						document.querySelector('#toc').insertAdjacentHTML(
						  'beforeend',
						  '<p><a href="" class="de" id=' + id++ + '>' + item.name + '</a>');
						entriesHolder.push(item);
					}
					else {
						var toc = document.querySelector('#toc');
						var p = document.createElement('p');
						toc.appendChild(p);
						// img as object so closure below will grab it
						var img = document.createElement('img');
						img.className = 'thumbnail';
						p.appendChild(img);
						var a = document.createElement('a');
						a.className = 'media';
						a.id = id++;
						a.href = '';
						a.innerText = item.name;
						p.appendChild(a);
						entriesHolder.push(item);
						(new ExifData.Exif(item)).getMetadata(
							function (metadata, thumbURL) {
								if (thumbURL) {
									img.width = '125';
									img.src= thumbURL;
									p.style['margin-top'] = '10px';
									p.style['margin-bottom'] = '10px';
								}
								item.metadata = metadata;
							}
						);
					}
				}
			);
		},
		function (e) {
			console.log(e);
		}
	);
}

function error(e) {
	var msg = e.message || e;
	document.querySelector('#view').insertAdjacentHTML(
	  'beforeend',
	  '<p class="error">' + msg + '</p>');
	console.log('Error:', e);
}

// Following for book -- not part of app.

function ex1() {
//begin getMediaFileSystems1
chrome.mediaGalleries.getMediaFileSystems(
	{interactive: 'yes'},
	function (mediaFileSystems) {
		console.log(mediaFileSystems);
	}
);
//end
}

function ex2() {
//begin getMediaFileSystems2
chrome.mediaGalleries.getMediaFileSystems(
	{interactive: 'yes'},
	function (mediaFileSystems) {
		mediaFileSystems.forEach(
			function(item, indx, arr) {
				var mData =
				  chrome.mediaGalleries.getMediaFileSystemMetadata(item);
				console.log(mData);
			}
		);
	}
);
//end
}

};
