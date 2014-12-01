"use strict";
//begin onload
window.onload = function () {
	var requestFileSystem = window.webkitRequestFileSystem ||
	  window.requestFileSystem;
	requestFileSystem(PERSISTENT, 0, haveFileSystem, errorHandler);
	document.querySelector("#save").addEventListener("click", save);
	setupAutoSave();
};
//end

//begin setup_code
var dirty = false;

function setupAutoSave() {
	var taElement = document.querySelector("#textarea");
	taElement.addEventListener("keypress", didChange);
	taElement.addEventListener("paste", didChange);
	taElement.addEventListener("cut", didChange);
	taElement.addEventListener("change", didChange);
	taElement.addEventListener("keydown", didChange);
}

function didChange(e) {
	if (e.type !== 'keydown' ||
	  e.keyCode === 8 || e.keyCode === 46) // backspace or delete
		dirty = true;
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
	getFileEntry(
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
	getFileEntry(
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
			fileWriter.truncate(0); // important!
		}
	);
}

//begin getFileEntry_code
var fileEntry;
var fileWriter;

function getFileEntry(callback) {
	if (fileWriter)
		callback();
	else if (directoryEntry) {
		directoryEntry.getFile('note.txt',
			{
				create: true,
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
			errorHandler
		);
	}
}
//end

//put this in util file?
//introduce modules?

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

