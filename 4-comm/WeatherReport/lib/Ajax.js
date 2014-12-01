"use strict";
//begin Ajax
var Ajax = (function () {
	var api = {
		ajaxSend: function (url, responseType, successCallback, errorCallback) {
			var req = new XMLHttpRequest();
			req.onload = function (e) {
				successCallback(req.status, req.response);
			};
			req.onerror = errorCallback;
			req.responseType = responseType ? responseType : "text";
			req.open("get", url);
			req.send();
		}
//skipbegin
// not in book
		,

		responseToJSON: function (response) {
			if (response[0] == '{')
				return JSON.parse(response);
			var responseArray = response.split(/\?/);
			if (responseArray.length == 2)
				response = responseArray[1];
			var obj = JSON.parse('{"' +
			  decodeURI(response).replace(/"/g, '\\"').replace(/[&]/g, '","').replace(/=/g,'":"') + '"}');
			if (responseArray.length == 2)
				obj['responseURL'] = responseArray[0];
			return obj;
		}
//skipend
	};
	return api;
})();
//end
