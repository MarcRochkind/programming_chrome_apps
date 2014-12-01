"use strict";

var Google = (function () {
	var access_token;

	var api = {
		authorize: function (callback) {
			chrome.identity.getAuthToken(
				{
					'interactive': true
				},
				function(token) {
					access_token = token;
					callback(token !== undefined);
				}
			);
		},

		call: function (method, successCallback, errorCallback) {
			var url = 'https://www.googleapis.com/' + method;
			Ajax.ajaxSend(url, "json",
				function (status, response) {
					if (response && response.error && response.error.message)
						errorCallback(response.error.message);
					else if (status == 200)
						successCallback(response);
					else
						errorCallback('Result code: ' + status);
				},
				function (e) {
					if (errorCallback)
						errorCallback('Communication error');
				},
				{
					Authorization: 'Bearer ' + access_token
				}
			);
		}
	};
	return api;
})();
