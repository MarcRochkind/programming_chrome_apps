"use strict";

window.onload = function () {

//begin 1
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
//end

//begin 2
context.fillStyle = '#ddd';
context.strokeStyle = 'black';
context.lineWidth = 3;
context.fillRect(5, 5, 500, 500);
context.strokeRect(5, 5, 500, 500);
//end

//begin 3
var gradient = context.createRadialGradient(200, 310, 0, 260, 310, 150);
gradient.addColorStop(.1, "white");
gradient.addColorStop(1, "black");

context.beginPath();
context.arc(200, 310, 150, 0, 2 * Math.PI);
context.fillStyle = gradient;
context.fill();
//end

//begin 4
context.font = "50px Times";
context.fillText('This is some text', 30, 80);
//end

//begin 5
context.save();
context.translate(420, 250);
context.rotate(Math.PI / 180 * 80);
context.textAlign = "center";
context.fillStyle = "white";
context.lineWidth = 1;
context.fillText("Some rotated text", 0, 0);
context.strokeText("Some rotated text", 0, 0);
context.restore();
//end

//begin 6
context.lineWidth = 4;
context.beginPath();
context.moveTo(50, 100);
context.lineTo(400, 450);
context.stroke();

saveFile(canvas);
//end

// http://stackoverflow.com/questions/12168909/blob-from-dataurl
function dataURItoBlob(dataURI, dataTYPE) {
	if (!dataTYPE)
		dataTYPE = 'image/jpeg';
	var binary = atob(dataURI.split(',')[1]);
	var array = [];
	for(var i = 0; i < binary.length; i++)
		array.push(binary.charCodeAt(i));
	return new Blob([new Uint8Array(array)], {type: dataTYPE});
}

/*
	Longer version than above; also works.
function dataURItoBlob2(dataURI) {
	// adapted from:
	// http://stackoverflow.com/questions/6431281/save-png-canvas-image-to-html5-storage-javascript

	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs
	var byteString = atob(dataURI.split(',')[1]);
	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	// write the ArrayBuffer to a blob
	var blob = new Blob([ab], { "type": mimeString });
	return blob;
};
*/

//begin saveFile_code
function saveFile(cvs) {
	var blob = dataURItoBlob(cvs.toDataURL('image/jpeg'));
	chrome.fileSystem.chooseEntry(
		{
			type: 'saveFile',
			suggestedName: 'canvas.jpg'
		},
		function(entry) {
			writeFileEntry(entry, blob,
				function(e) {
					if (e.target.error)
						errorHandler(e);
					else
						console.log('Saved.');
				}
			);
		}
	);
}

function writeFileEntry(entry, blob, callback) {
	if (entry)
		entry.createWriter(
			function(writer) {
				writer.onerror = errorHandler;
				writer.truncate(0);
				writer.onwriteend = function () {
					writer.write(blob);
					writer.onwriteend = callback;
				};
			},
			errorHandler
		);
}

function errorHandler(e) {
	if (e.target.error)
		console.log(e.target.error.message);
	else
		console.log(e);
}
//end

};
