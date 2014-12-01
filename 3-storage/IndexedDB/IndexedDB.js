"use strict";
window.onload = function () {

var db;

openDatabase();

function openDatabase() {
	var request = indexedDB.open("db1", 1);
	request.onsuccess = function(event) {
		db = request.result;
		db.onerror = errorHandler;
		showMessage('Database opened', true);
	};
	request.onerror = errorHandler;
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		var store = db.createObjectStore("mailing-list", { autoIncrement: true });
		store.createIndex("name-index", "last", { unique: false });
	};
}

//begin deleteDatabase_code
document.querySelector("#delete_db").addEventListener("click", deleteDatabase);

function deleteDatabase() {
	console.log('d');
	Dialogs.confirm('Delete entire database?', 'Delete', 'Cancel',
		function () {
			fillForm();
			if (db) {
				db.close();
				db = null;
			}
			var request = indexedDB.deleteDatabase("db1");
			request.onsuccess = function() {
				openDatabase();
			};
			request.onerror = errorHandler;
		}
	);
}
//end

//begin handler_count
document.querySelector("#count").addEventListener("click",
	function () {
		db
		.transaction("mailing-list")
		.objectStore("mailing-list")
		.count()
		.onsuccess = function (event) {
			Dialogs.alert(event.target.result + ' objects in database');
		};
	}
);
//end

//begin import_code
document.querySelector("#import").addEventListener("click", importData);

function importData() {
	chrome.fileSystem.chooseEntry(
		{
			type: 'openFile'
		},
		function (entry) {
			if (entry) {
				entry.file(
					function (file) {
						var reader = new FileReader();
						reader.onloadend = function() {
							var objects = JSON.parse(this.result);
							loadData(objects);
							showMessage('Opened OK', true);
						};
						reader.readAsText(file);
					},
					errorHandler
				);
			}
		}
	);
}
//end

function loadData(objects) {
	var transaction = db.transaction("mailing-list", "readwrite");
	transaction.oncomplete = function(event) {
		showMessage(objects.length + ' objects imported', true);
	};
	var store = transaction.objectStore("mailing-list");
	for (var x of objects)
		store.add(x);
}

//begin export_code
document.querySelector("#export").addEventListener("click", exportData);

function exportData() {
	chrome.fileSystem.chooseEntry(
		{
			type: 'saveFile'
		},
		function (entry) {
			if (entry)
				saveToEntry(entry);
		}
	);
}

function saveToEntry(entry) {
	entry.createWriter(
		function(fileWriter) {
			fileWriter.onerror = errorHandler;
			fileWriter.onwrite = function() {
				writeData(fileWriter);
			};
			fileWriter.truncate(0);
		},
		errorHandler
	);
}
//end

//begin writeData_example_good
function writeData(fileWriter) {
	var objects = [];
	db
	.transaction("mailing-list")
	.objectStore("mailing-list")
	.openCursor()
	.onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			objects.push(cursor.value);
			cursor.continue();
		}
		else
			writeObjects(fileWriter, objects);
	};
}

function writeObjects(fileWriter, objects) {
	fileWriter.onwrite = function () {
		showMessage(objects.length + ' objects exported', true);
	};
	fileWriter.onerror = errorHandler;
	fileWriter.write(new Blob([JSON.stringify(objects)]));
}
//end

function writeData_example() {
// won't work -- see book
//begin writeData_example_bad
function writeData(fileWriter) {
	var objects = [];
	db
	.transaction("mailing-list")
	.objectStore("mailing-list")
	.openCursor()
	.onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			fileWriter.onwrite = function () {
				cursor.continue(); // ouch!
			};
			fileWriter.onerror = errorHandler;
			fileWriter.write(cursor.value);
		}
		else
			writeObjects(fileWriter, objects);
	};
}
//end
}

// Use cursor instead of get in search(), as we need the primaryKey.
// Need to move past current object if primaryKey is set.
//begin handler_search
document.querySelector("#search").addEventListener("click",
	function () {
		fillForm();
		search(document.querySelector("#search-key").value, "next", 0);
	}
);

function search(key, dir, primaryKey) {
	primaryKey = parseInt(primaryKey);
	var range;
	if (dir === "next")
		range = IDBKeyRange.lowerBound(key, false);
	else
		range = IDBKeyRange.upperBound(key, false);
	db
	.transaction("mailing-list")
	.objectStore("mailing-list")
	.index("name-index")
	.openCursor(range, dir)
	.onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			if (primaryKey > 0) {
				if (primaryKey === cursor.primaryKey)
					primaryKey = 0;
				cursor.continue();
			}
			else {
				showMessage('');
				fillForm(cursor.value, cursor.primaryKey);
			}
		}
		else
			showMessage('Not found');
	};
}
//end

//begin handler_prev
document.querySelector("#prev").addEventListener("click",
	function () {
		search(document.querySelector("#field-last").value, "prev",
		  document.querySelector("#field-primaryKey").value);
	}
);
//end

//begin handler_next
document.querySelector("#next").addEventListener("click",
	function () {
		search(document.querySelector("#field-last").value, "next",
		  document.querySelector("#field-primaryKey").value);
	}
);
//end

//begin handler_clear
document.querySelector("#clear").addEventListener("click",
	function () {
		fillForm();
	}
);
//end

//begin handler_delete
document.querySelector("#delete").addEventListener("click",
	function () {
		var primaryKey =
		  parseInt(document.querySelector("#field-primaryKey").value);
		if (primaryKey > 0) {
			db
			.transaction("mailing-list", "readwrite")
			.objectStore("mailing-list")
			.delete(primaryKey)
			.onsuccess = function (event) {
				fillForm();
				showMessage('Deleted', true);
			};
		}
	}
);
//end

//begin handler_save
document.querySelector("#save").addEventListener("click",
	function () {
		var store = db
			.transaction("mailing-list", "readwrite")
			.objectStore("mailing-list");
		var object = getForm();
		var key = document.querySelector("#field-primaryKey").value;
		var primaryKey = key ? parseInt(key) : 0;
		if (primaryKey === 0) {
			store
			.add(object)
			.onsuccess = function (event) {
				showMessage('Added', true);
			};
		}
		else {
			store
			.put(object, primaryKey)
			.onsuccess = function (event) {
				showMessage('Updated', true);
			};
		}
	}
);
//end

//begin fillForm_code
function fillForm(object, primaryKey) {
	if (!object)
		object = {};
	if (!primaryKey)
		primaryKey = 0;
	document.querySelector("#field-last").value = val(object.last);
	document.querySelector("#field-first").value = val(object.first);
	document.querySelector("#field-street").value = val(object.street);
	document.querySelector("#field-city").value = val(object.city);
	document.querySelector("#field-state").value = val(object.state);
	document.querySelector("#field-zip").value = val(object.zip);
	document.querySelector("#field-email").value = val(object.email);
	document.querySelector("#field-primaryKey").value = primaryKey;
}

function val(x) {
	return x ? x : "";
}
//end

function getForm() {
	return {
		last: document.querySelector("#field-last").value,
		first: document.querySelector("#field-first").value,
		street: document.querySelector("#field-street").value,
		city: document.querySelector("#field-city").value,
		state: document.querySelector("#field-state").value,
		zip: document.querySelector("#field-zip").value,
		email: document.querySelector("#field-email").value
	};
}

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
/*
function errorHandler(e) {
	console.dir(e);
	var msg;
	if (e.target && e.target.error) {
		e = e.target.error;
	}
	if (e.message) {
		msg = e.message;
	}
	else if (e.name) {
		msg = e.name;
	}
	else if (e.code) {
		msg = "Code " + e.code;
	}
	else {
		msg = e.toString();
	}
	showMessage('Error: ' + msg);
}
*/

};
