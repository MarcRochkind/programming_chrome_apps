"use strict";

//begin authorize
var Facebook = (function () {
	var access_token = null;
	var api = {
		authorize: function (clientID, scope, callback) {
			access_token = null;
			chrome.identity.launchWebAuthFlow(
				{
					url: "https://www.facebook.com/dialog/oauth?client_id=" +
					  clientID + "&response_type=token&" +
					  "redirect_uri=" + chrome.identity.getRedirectURL() + "&" +
					  "scope=" + scope,
					interactive: true
				},
				function (responseURL) {
					console.log(responseURL);
					if (responseURL) {
						var a = responseURL.match(/access_token=([^&]*)&/);
						if (a.length > 0)
							access_token = a[1];
						callback(true);
					}
					else
						callback(false);
				}
			);
		}
//insert 	};
//insert 	return api;
//insert })();
//end
		,

//begin call
		call: function (method, successCallback, errorCallback) {
			var url = 'https://graph.facebook.com/' + method;
			if (method.indexOf('?') === -1)
				url += '?';
			else
				url += '&';
			url += 'access_token=' + access_token;
			Ajax.ajaxSend(url, "json",
				function (status, response) {
					if (response.error) {
						var err = response.error;
						if (response.error.message)
							err = response.error.message;
						if (errorCallback)
							errorCallback(response.error.message);
					}
					else
						successCallback(response);
				}
			);
		}
//end
	};
	return api;
})();
