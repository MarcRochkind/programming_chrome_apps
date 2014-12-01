// File for some example code in book, but not part of the IndexedDB app.
"use strict";
window.onload = function () {

var db;
var deleteRequest = indexedDB.deleteDatabase("db1");
deleteRequest.onsuccess = function() {
	deleteRequest.onsuccess = null;
	console.log('database deleted');
	openDatabase();
}
deleteRequest.onerror = errorHandler;
deleteRequest = indexedDB.deleteDatabase("db_people");

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

function errorHandler(event) {
	console.log('Error: ' + event.target.errorHandler.message, event);
}

function showMessage(m) {
	console.log(m);
}

function add_examples() {
//begin db_example_add
add({last: "Smith", first: "John"});
add({last: "Jones", first: "Mary"});
add({last: "Gonzalez", first: "Sharon"});

function add(obj) {
	db
	.transaction("mailing-list", "readwrite")
	.objectStore("mailing-list")
	.add(obj)
	.onsuccess = function (event) {
		console.log('added', obj);
	};
}
//end
}

document.querySelector("#search").addEventListener("click",
	function () {
		find();
	}
);

document.querySelector("#save").addEventListener("click", add_examples);

function find() {
//begin db_example_get
db
.transaction("mailing-list")
.objectStore("mailing-list")
.index("name-index")
.get("Jones")
.onsuccess = function (event) {
	console.log("Found: ", event.target.result);
};
//end
}

};
/////////////////////////////////////////////////////
function ignore() {


openDatabase(false);


function openDatabase(wasDeleted) {
	var request = indexedDB.open("db1", 1);
	request.onsuccess = function(event) { 
	    db = request.result;
		db.onerror = errorHandler;
	    console.log("Database Opened", db);
		showMessage('Database ' + (wasDeleted ? 'deleted and ' : '') + 'opened', true);
	};
	request.onerror = errorHandler;
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		var store = db.createObjectStore("mailing-list", { autoIncrement: true });
		console.log('objectStore created', store);
		store.createIndex("name-index", "last", { unique: false });
	};
}

function deleteDatabase() {
	Dialogs.confirm('Delete entire database?', 'Delete', 'Cancel',
		function () {
			fillForm();
			console.log('delete');
			if (db) {
				db.close();
				db = null;
			}
			var request = indexedDB.deleteDatabase("db1");
			request.onsuccess = function() {
				console.log('database deleted');
				openDatabase(true)
			}
			request.onerror = errorHandler;
		}
	);
}

function countObjects() {
	db
	.transaction("mailing-list")
	.objectStore("mailing-list")
	.count()
	.onsuccess = function (event) {
		Dialogs.alert(event.target.result + ' objects in database');
	};
}

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

function loadData(objects) {
	var transaction = db.transaction("mailing-list", "readwrite");
	transaction.oncomplete = function(event) {
		showMessage(objects.length + ' objects imported', true);
	};
	var store = transaction.objectStore("mailing-list");
	for (var i in objects)
		store.add(objects[i]);
}

function exportData() {
	chrome.fileSystem.chooseEntry(
		{
			type: 'saveFile'
		},
		function (entry) {
console.dir(entry);
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
	fileWriter.write(new Blob([JSON.stringify(objects)]));
}

function find(key, dir, primaryKey) {
	var range;
	if (dir === "next")
		range = IDBKeyRange.lowerBound(key, false);
	else
		range = IDBKeyRange.upperBound(key, false);
	// use cursor instead of get, as we need the primaryKey
	// need to move past current object if primaryKey is set
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

document.querySelector("#search").addEventListener("click",
	function () {
		fillForm();
		find(document.querySelector("#search-key").value, "next", 0);
	}
);

document.querySelector("#prev").addEventListener("click",
	function () {
		find(document.querySelector("#field-last").value, "prev", document.querySelector("#field-primaryKey").value);
	}
);

document.querySelector("#next").addEventListener("click",
	function () {
		find(document.querySelector("#field-last").value, "next", document.querySelector("#field-primaryKey").value);
	}
);

document.querySelector("#clear").addEventListener("click",
	function () {
		fillForm();
	}
);

document.querySelector("#delete").addEventListener("click",
	function () {
		var primaryKey = parseInt(document.querySelector("#field-primaryKey").value);
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

document.querySelector("#save").addEventListener("click",
	function () {
		var store = db
			.transaction("mailing-list", "readwrite")
			.objectStore("mailing-list");
		var object = getForm();
		var key = document.querySelector("#field-primaryKey").value;
		var primaryKey = key ? parseInt(key) : 0;
		console.log(primaryKey);
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

document.querySelector("#delete").addEventListener("click", deleteDatabase);
document.querySelector("#import").addEventListener("click", importData);
document.querySelector("#export").addEventListener("click", exportData);
document.querySelector("#count").addEventListener("click", countObjects);

function fillForm(object, primaryKey) {
	if (!object)
		object = {};
	if (!primaryKey)
		primaryKey = 0;
	document.querySelector("#field-last").value = object.last;
	document.querySelector("#field-first").value = object.first;
	document.querySelector("#field-street").value = object.street;
	document.querySelector("#field-city").value = object.city;
	document.querySelector("#field-state").value = object.state;
	document.querySelector("#field-zip").value = object.zip;
	document.querySelector("#field-email").value = object.email;
	document.querySelector("#field-primaryKey").value = primaryKey;
}

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

}
