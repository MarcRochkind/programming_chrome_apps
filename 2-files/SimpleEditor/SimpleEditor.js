"use strict";
window.onload = function () {

//begin setup_code
var taElement = document.querySelector("#textarea");
var dirty = false;

document.querySelector("#new").addEventListener("click", newFile);
document.querySelector("#open").addEventListener("click", openFile);
document.querySelector("#save").addEventListener("click", saveFile);
document.querySelector("#saveas").addEventListener("click", saveFileAs);

taElement.addEventListener("keypress", didChange);
taElement.addEventListener("paste", didChange);
taElement.addEventListener("cut", didChange);
taElement.addEventListener("change", didChange);
taElement.addEventListener("keydown", didChange);

function didChange(e) {
	if (e.type !== 'keydown' ||
	  e.keyCode === 8 || e.keyCode === 46) // backspace or delete
		dirty = true;
}
//end

function dirtyCheck(callback) {
	if (dirty)
		Dialogs.confirm('Discard changes?', 'Discard', 'Keep', callback);
	else
		callback();
}

newFile();

function newFile() {
	dirtyCheck(
		function() {
			fileEntry = null;
			taElement.value = "";
			taElement.focus();
			dirty = false;
			document.title = 'Simple Editor - [new]';
		}
	);
}

function saveFile() {
	if (fileEntry)
		save();
	else
		chrome.fileSystem.chooseEntry(
			{
				type: 'saveFile'
			},
			function (fe) {
				if (fe) {
					fileEntry = fe;
					save();
					document.title = 'Simple Editor - ' + fe.name;
				}
			}
		);
}

function saveFileAs() {
	fileEntry = null;
	saveFile();
}

function save() {
	fileEntry.createWriter(
		function(fileWriter) {
			fileWriter.onerror = errorHandler;
			fileWriter.onwrite = function(e) {
				fileWriter.onwrite = function(e) {
					showMessage('Saved OK', true);
					dirty = false;
					taElement.focus();
				};
				var blob = new Blob([taElement.value],
				  {type: 'text/plain'});
				fileWriter.write(blob);
			};
			fileWriter.truncate(0);
		},
		errorHandler
	);
}

//begin openFile_code
var fileEntry;

function openFile() {
	dirtyCheck(
		function() {
			chrome.fileSystem.chooseEntry(
				{
					type: 'openFile'
				},
				function (fe) {
					if (fe) {
						fileEntry = fe;
						fe.file(
							function (file) {
								var reader = new FileReader();
								reader.onloadend = function(e) {
									taElement.value = this.result;
									taElement.focus();
									dirty = false;
									showMessage('Opened OK', true);
									document.title = 'Simple Editor - ' + fe.name;
								};
								reader.readAsText(file);
							},
							errorHandler
						);
					}
				}
			);
		}
	);
}
//end

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

};

// What follows is not part of the app, but is only code for the book.

function example() {

//begin window.onload
window.onload = function () {
	// ... entire app goes here ...
};
//end

}
