"use strict";
//begin onload
window.onload = function () {
	chrome.syncFileSystem.requestFileSystem(
		function (fs) {
			if (chrome.runtime.lastError)
				showMessage(chrome.runtime.lastError.message);
			else
				haveFileSystem(fs);
		}
	);
	setupAutoSave();
};
//end

//begin haveFileSystem_code
var directoryEntry;

function haveFileSystem(fs) {
	fs.root.getDirectory("Note",
		{
			create: true,
			exclusive: false
		},
		function (de) {
			directoryEntry = de;
			read();
		},
		errorHandler
	);
}
//end

//begin read_code
function read() {
	showFileStatus();
	getFileEntry(false,
		function() {
			if (fileEntry)
				fileEntry.file(haveFile, errorHandler);
		}
	);
}

function haveFile(file) {
	var reader = new FileReader();
	reader.onload = function() {
		document.querySelector("#textarea").value = reader.result;
	};
	reader.readAsText(file);
}
//end

function save() {
	getFileEntry(true,
		function() {
			fileWriter.onwrite = function(e) {
				fileWriter.onwrite = function(e) {
					dirty = false;
					showMessage("Saved", true);
				};
				var blob = new Blob([document.querySelector("#textarea").value],
				  {type: 'text/plain'});
				fileWriter.write(blob);
			};
			fileWriter.onerror = errorHandler;
			fileWriter.truncate(0);
		}
	);
}

//begin getFileEntry_code
var fileEntry;
var fileWriter;

function getFileEntry(create, callback) {
	if (fileWriter)
		callback();
	else if (directoryEntry) {
		directoryEntry.getFile('note.txt',
			{
				create: create,
				exclusive: false
			},
			function (fe) {
				fileEntry = fe;
				fileEntry.createWriter(
					function (fw) {
						fileWriter = fw;
						callback();
					},
					errorHandler
				);
			},
			function (e) {
				if (e.name === 'NotFoundError')
					callback();
				else
					errorHandler(e);
			}
		);
	}
}
//end

//begin chrome.idle
chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener(
	function (state) {
		if (state === "idle" && dirty)
			save();
	}
);
//end

//begin onFileStatusChanged.addListener
 chrome.syncFileSystem.onFileStatusChanged.addListener(
 	function (detail) {
 		if (detail.fileEntry.name === "note.txt") {
 			showMessage(detail.fileEntry.name + " &bull; " +
 			  detail.direction + " &bull; " + detail.action +
 			  " &bull; " + detail.status, true);
 			if (detail.direction === 'remote_to_local' &&
 			  detail.status === 'synced')
 				read();
 			showFileStatus(detail.status);
 		}
 	}
 );
//end

function showFileStatus(status) {
	var statusElement = document.querySelector("#status");
	if (status)
		statusElement.innerHTML = status;
	else
		getFileEntry(false,
			function() {
				if (fileEntry)
					chrome.syncFileSystem.getFileStatus(fileEntry,
						function (status) {
							statusElement.innerHTML = status;
						}
					);
				else
					statusElement.innerHTML = "no local copy";
			}
		);
}

//begin showMessage_code
var timeoutID;

function showMessage(msg, good) {
	console.log(msg);
	var messageElement = document.querySelector("#message");
	messageElement.style.color = good ? "green" : "red";
	messageElement.innerHTML = msg;
	if (timeoutID)
		clearTimeout(timeoutID);
	timeoutID = setTimeout(
		function () {
			messageElement.innerHTML = "&nbsp;";
		},
		5000
	);
 	showFileStatus();
}
//end

function errorHandler(e) {
	console.dir(e);
	var msg;
	if (e.target && e.target.error)
		e = e.target.error;
	if (e.message)
		msg = e.message;
	else if (e.name)
		msg = e.name;
	else if (e.code)
		msg = "Code " + e.code;
	else
		msg = e.toString();
	showMessage('Error: ' + msg);
}

//begin setup_code
var dirty = false;

function setupAutoSave() {
	document.querySelector("#textarea").addEventListener("keypress", didChange);
	document.querySelector("#textarea").addEventListener("paste", didChange);
	document.querySelector("#textarea").addEventListener("cut", didChange);
	document.querySelector("#textarea").addEventListener("change", didChange);
	document.querySelector("#textarea").addEventListener("keydown", didChange);
}

function didChange(e) {
	if (e.type !== 'keydown' ||
	  e.keyCode === 8 || e.keyCode === 46) // backspace or delete
		dirty = true;
}
//end
