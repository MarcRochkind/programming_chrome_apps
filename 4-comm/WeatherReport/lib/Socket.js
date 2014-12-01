"use strict";
//begin open
var Socket = (function () {

var api = {
	HttpRequest: function () {
	}
};

api.HttpRequest.prototype.open = function (method, url) {
	var a = url.match(/^http:\/\/([^/]*)(.*)$/);
	this.host = a[1];
	this.path = a[2];
	this.req = "GET " + this.path + " HTTP/1.1\r\nHost: " +
	  this.host + "\r\n\r\n";
};

//insert return api;
//insert })();
//end

//begin activeSockets
var activeSockets = [];
//end

//begin send
api.HttpRequest.prototype.send = function () {
	var that = this;
	chrome.sockets.tcp.create({},
		function (createInfo) {
			activeSockets[createInfo.socketId] = that;
			chrome.sockets.tcp.connect(createInfo.socketId, that.host, 80,
				function (result) {
					if (chrome.runtime.lastError) {
						if (that.onerror)
							that.onerror(chrome.runtime.lastError.message);
					}
					else {
						chrome.sockets.tcp.send(createInfo.socketId, str2ab(that.req),
							function (sendInfo) {
							}
						);
					}
				}
			);
		}
	);
}
//end

//begin receiveData
api.HttpRequest.prototype.receiveData = function (s) {
	var a = s.split("\r\n");
	var msg;
	if (a.length > 0) {
		if (a[0].indexOf("HTTP/1.1 ") == 0)
			this.statusText = a[0].substr(9);
		else
			this.statusText = a[0];
		this.status = parseInt(this.statusText);
	}
	else {
		this.status = 0;
		this.statusText = null;
	}
	if (this.status == 200) {
		var a = s.split("\r\n\r\n");
		var n = a[1].indexOf("{");
		var len = parseInt(a[1], 16);
		this.response = a[1].substr(n, len);
	}
	else
		this.response = null;
	if (this.onload)
		this.onload();
}
//end

//begin onReceive
chrome.sockets.tcp.onReceive.addListener(
	function (info) {
		var req = activeSockets[info.socketId];
		if (req) {
			if (info.data)
				req.receiveData(ab2str(info.data));
			else
				req.receiveData();
		}
	}
);
//end

//begin onReceiveError
chrome.sockets.tcp.onReceiveError.addListener(
	function (info) {
		var req = activeSockets[info.socketId];
		if (req && req.onerror)
			req.onerror("Result Code: " + info.resultCode);
	}
);
//end

return api;

// From Google's tcpserver example

/**
* Converts an array buffer to a string
*
* @private
* @param {ArrayBuffer} buf The buffer to convert
* @param {Function} callback The function to call when conversion is complete
*/
function _arrayBufferToString(buf, callback) {
	var bb = new Blob([new Uint8Array(buf)]);
	var f = new FileReader();
	f.onload = function(e) {
		callback(e.target.result);
	};
	f.readAsText(bb);
}

// This is a better way, new with Chrome Version 38.
function ab2str(ab) {
	var dataView = new DataView(ab);
	var decoder = new TextDecoder('utf-8');
	return decoder.decode(dataView);
}

/**
* Converts a string to an array buffer
*
* @private
* @param {String} str The string to convert
* @param {Function} callback The function to call when conversion is complete
*/
function _stringToArrayBuffer(str, callback) {
console.log('_stringToArrayBuffer');
	var bb = new Blob([str]);
	var f = new FileReader();
	f.onload = function(e) {
		callback(e.target.result);
	};
	f.readAsArrayBuffer(bb);
}

// This is a better way, new with Chrome Version 38.
function str2ab(str) {
	var encoder = new TextEncoder('utf-8');
	return encoder.encode(str).buffer;
}

})();

function example_code() {
//begin example_code_Socket
var Socket = (function () {
	var module_var1 = 0;
	// ... more module variables ...

	var api = {
		HttpRequest: function () {
		}
	};

	api.HttpRequest.prototype.method1 = function () {
		// ...
	};
	
	// ... more methods ...
	
	return api;

	function internal_function1() {
		// ...
	}
	
	// ... more internal functions ...

})();
//end
}
