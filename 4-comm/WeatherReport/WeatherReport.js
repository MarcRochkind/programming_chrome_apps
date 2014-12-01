"use strict";

// Replaces similar statement below
//var skt = new XMLHttpRequest();

//begin onload
window.onload = function () {

var skt = new Socket.HttpRequest();

document.querySelector("#get").addEventListener("click",
	function () {
		getWeather(document.querySelector("#city").value);
	}
);

//insert };
//end

//begin getWeatherskt
function getWeather(city) {
	var textarea = document.querySelector("#textarea");
	textarea.value = "Wait...";

	skt.onload = function () {
		if (skt.status === 200) {
			var obj = JSON.parse(skt.response);
			showMessage(obj.message, true);
			textarea.value = formatWeather(obj);
		}
		else
			showMessage("Error: " + skt.status);
	}

	skt.onerror = function (msg) {
		showMessage(msg);
	};
	skt.open("get", "http://api.openweathermap.org/data/2.1/find/name" +
	  "?units=imperial&cnt=2&q=" + city);
	skt.send();
}
//end

function ajax_example() {
//begin getWeatherAjax
function getWeather(city) {
	var textarea = document.querySelector("#textarea");
	textarea.value = "Wait...";

	Ajax.ajaxSend("http://api.openweathermap.org/data/2.1/find/name" +
	  "?units=imperial&cnt=2&q=" + city, "json",
		function (status, obj) {
			if (status === 200) {
				showMessage(obj.message, true);
				textarea.value = formatWeather(obj);
			}
			else
				showMessage("Error: " + status);
		},
		function (e) {
			showMessage("Communication error");
			console.log('Communication error:', e);
		}
	);
}
//end
}

function formatWeather(value) {
	if (!value.list || value.list.count == 0)
		return "No cities found";
	var s = "";
	for (var x of value.list) {
		s += x.name;
		if (x.sys.country)
			s += ", " + x.sys.country;
		s += "\n";
		s += "Lat: " + x.coord.lat + ", Lon: " + x.coord.lon + "\n";
		s += "Date: " + x.date + "\n";
		for (var d of x.weather)
			s += d.description + "\n";
		if (x.main)
			for (var k in x.main)
				s += k + ": " + x.main[k] + "\n";
		if (x.wind)
			for (var k in x.wind)
				s += "Wind " + k + ": " + x.wind[k] + "\n";
		if (x.rain)
			s += "Rain today: " + x.rain.today + "\n";
		s += "----------------------\n";
	}
	return s;
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

};

/*
// Following not part of app, but just example code for the book.

//begin socket-ex1
var req = "GET /data/2.1/find/name?units=imperial&q=Chicago HTTP/1.1\r\n" +
  "Host: api.openweathermap.org\r\n\r\n";
//end

//begin socket-ex2
chrome.sockets.tcp.create({},
	function (createInfo) {
		console.log(createInfo.socketId);
	}
);
//end

//begin socket-ex3
chrome.sockets.tcp.create({},
	function (createInfo) {
		console.log(createInfo.socketId);
		chrome.sockets.tcp.connect(createInfo.socketId,
			"api.openweathermap.org", 80,
			function (result) {
				if (chrome.runtime.lastError)
					console.log(chrome.runtime.lastError.message);
				else {
					console.log(result);
				}
			}
		);
	}
);
//end

//begin socket-ex4
//insert var req = "GET /data/2.1/find/name?units=imperial&q=Chicago HTTP/1.1\r\n" +
//insert   "Host: api.openweathermap.org\r\n\r\n";

chrome.sockets.tcp.create({},
	function (createInfo) {
		console.log(createInfo.socketId);
		chrome.sockets.tcp.connect(createInfo.socketId,
			"api.openweathermap.org", 80,
			function (result) {
				if (chrome.runtime.lastError)
					console.log(chrome.runtime.lastError.message);
				else {
					console.log(result);
					chrome.sockets.tcp.send(createInfo.socketId, str2ab(req),
						function (sendInfo) {
							console.log(sendInfo);
						}
					);
// 					_stringToArrayBuffer(req,
// 						function (data) {
// 							chrome.sockets.tcp.send(createInfo.socketId, data,
// 								function (sendInfo) {
// 									console.log(sendInfo);
// 								}
// 							);
// 						}
// 					);
				}
			}
		);
	}
);
//end

chrome.sockets.tcp.onReceive.addListener(
	function (info) {
		if (info.data)
			console.log(ab2str(info.data));
// 			_arrayBufferToString(info.data,
// 				function (s) {
// 					console.log(s);
// 				}
// 			);
	}
);
//end

function _arrayBufferToString(buf, callback) {
	var bb = new Blob([new Uint8Array(buf)]);
	var f = new FileReader();
	f.onload = function(e) {
		callback(e.target.result);
	};
	f.readAsText(bb);
}

function _stringToArrayBuffer(str, callback) {
	var bb = new Blob([str]);
	var f = new FileReader();
	f.onload = function(e) {
		callback(e.target.result);
	};
	f.readAsArrayBuffer(bb);
}
*/

