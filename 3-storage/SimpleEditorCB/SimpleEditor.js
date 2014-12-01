"use strict";
window.onload = function () {

//begin setup_code
var taElement = document.querySelector("#textarea");
var dirty = false;
var wantSync = true;

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
	  (e.keyCode === 8 || e.keyCode === 46)) // backspace or delete
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
	saveToEntry(fileEntry,
		function () {
			dirty = false;
			taElement.focus();
			if (directoryEntryBackup)
				directoryEntryBackup.getFile(fileEntry.name,
					{
						create: true,
						exclusive: false
					},
					function (fe) {
						saveToEntry(fe,
							function () {
								showMessage('Saved/Backedup OK', true);
							}
						);
					},
					errorHandler
				);
			else
				showMessage('Saved/OK (no backup)', true);
		}
	);
}

function saveToEntry(fe, callback) {
	fe.createWriter(
		function(fileWriter) {
			fileWriter.onerror = errorHandler;
			fileWriter.onwrite = function(e) {
				fileWriter.onwrite = function(e) {
					callback();
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

//begin fcns1
function setBackground(color, wantSave) {
	if (color) {
		document.querySelector("#textarea").style["background-color"] = color;
		if (wantSave)
			setParams({ background: color }, wantSync);
	}
}

function setForeground(color, wantSave) {
	if (color) {
		document.querySelector("#textarea").style["color"] = color;
		if (wantSave)
			setParams({ foreground: color }, wantSync);
	}
}
//end

//begin getColors_code
getParams(["foreground", "background"],
	function (items) {
		if (chrome.runtime.lastError)
			console.log(chrome.runtime.lastError);
		else {
			setForeground(items.foreground);
			setBackground(items.background);
		}
	},
	wantSync
);
//end

// http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
	var components = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	return "#" + hex(components[1]) + hex(components[2]) + hex(components[3]);
}

//begin options-code
var optionsButton = document.querySelector("#options");
if (optionsButton)
	optionsButton.addEventListener("click", options);

function options() {
	var bg;
	var fg;
	Dialogs.dialog(
		"<p>Background Color: <input type='color' id='bg-color'>" +
		"<p>Foreground Color: <input type='color' id='fg-color'>" +
		"<p><button id='setbackup'>Set Backup...</button>" +
		"<p><button id='dlg-ok'>OK</button>",
		[
			{
				id: 'dlg-ok',
				action: function () {
					setBackground(bg.value, true);
					setForeground(fg.value, true);
				}
			}
		],
		function () {
			bg = document.querySelector('#bg-color');
			fg = document.querySelector('#fg-color');
			var bgcolor = taElement.style["background-color"];
			var fgcolor = taElement.style["color"];
			if (bgcolor && fgcolor) {
				bg.value = rgb2hex(bgcolor);
				fg.value = rgb2hex(fgcolor);
			}
			else {
				bg.value = "#ffffff";
				fg.value = "#000000";
			}
			document.querySelector("#setbackup").addEventListener("click",
			  setBackup);
		}
	);
}
//end
//begin setBackup_code
var directoryEntryBackup;

function setBackup() {
	chrome.fileSystem.chooseEntry({
			type: 'openDirectory'
		},
		function (entry) {
			if (entry) {
				directoryEntryBackup = entry;
				var entryID = chrome.fileSystem.retainEntry(entry);
				setParams({ BackupFolderID: entryID });
				show_backup_folder();
			}
			else
				showMessage("No folder chosen");
		});
}
//end

function show_backup_folder() {
	if (directoryEntryBackup)
		chrome.fileSystem.getDisplayPath(directoryEntryBackup,
			function (path) {
				showMessage('Backup Folder: ' + path, true);
			});
	else
		showMessage('No backup folder');
}

//begin get_BackupFolderID
getParams("BackupFolderID",
	function (items) {
		if (chrome.runtime.lastError)
			showMessage('Unable to get backup folder ID. (' +
			  chrome.runtime.lastError.message + ')');
		else if (items && items.BackupFolderID)
			chrome.fileSystem.restoreEntry(items.BackupFolderID,
				function (entry) {
					directoryEntryBackup = entry;
					show_backup_folder();
				}
			);
		else
			setBackup();
	}
);
//end

//begin onChanged
chrome.storage.onChanged.addListener(
	function(changes, areaName) {
		if (areaName === "sync") {
			if (changes.foreground)
				setForeground(changes.foreground.newValue);
			if (changes.background)
				setBackground(changes.background.newValue);
		}
	}
);
//end

//begin set-get-Params
function setParams(x, wantSync) {
	var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
	storageArea.set(x,
		function () {
			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError);
		}
	);
}

function getParams(x, callback, wantSync) {
	var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
	storageArea.get(x,
		function (items) {
			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError);
			else
				callback(items);
		}
	);
}
//end

// What follows is not part of the app, but is only code for the book.

function example() {

//begin window.onload
window.onload = function () {
	// ... entire app goes here ...
};
//end

}

};
