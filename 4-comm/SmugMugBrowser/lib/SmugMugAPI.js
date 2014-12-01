"use strict";
var SmugMugAPI = (function () {
	var apiKey;
	var apiSecret;
	var user = {};
	var api = {
		authorize: function (key, secret, callback) {
			apiKey = key;
			apiSecret = secret;
			if (user.oauth_token && user.oauth_token_secret)
				callback(true);
			else {
				Storage.getParams(['oauth_token', 'oauth_token_secret'],
					function (items) {
						if (items.oauth_token && items.oauth_token_secret) {
							user.oauth_token = items.oauth_token;
							user.oauth_token_secret = items.oauth_token_secret;
							callback(true);
						}
						else {
							user = {};
							performAuthorization(callback);
						}
					}
				);
			}
		},

		callSmugMug: function (url, parameters, tokenSecret, callback) {
			if (!tokenSecret && user.oauth_token_secret)
				tokenSecret = user.oauth_token_secret;
			var timestamp = Date.now() / 1000; // need seconds
			var params = {
				oauth_nonce: timestamp,
				oauth_timestamp: timestamp,
				oauth_consumer_key: apiKey,
				oauth_signature_method: 'HMAC-SHA1'
			};
			for (var p in parameters)
				params[p] = parameters[p];
			var encodedSignature = oauthSignature.generate('GET', url, params, apiSecret, tokenSecret);
			var s = '';
			for (var p in params)
				s +=  p + '=' + params[p] + '&';
			var urlComplete = url + '?' + s + "oauth_signature=" + encodedSignature;
			Ajax.ajaxSend(urlComplete, "text",
				function (status, response) {
					try {
						var x = Ajax.responseToJSON(response);
						console.log("callSmugMug got response", x);
					}
					catch (e) {
						console.log('callSmugMug failed to parse JSON', response);
					}
					callback(x);
				}
			);
		},

		callMethod: function(method, parameters, callback) {
			var params = {
				method: method,
				nojsoncallback: 1,
				format: 'json',
				oauth_token: user.oauth_token
			};
			if (parameters)
				for (var p in parameters)
					params[p] = parameters[p];
			SmugMugAPI.callSmugMug('https://api.smugmug.com/services/api/json/1.3.0/',
				params,
				null,
				function (x) {
					console.log('got REST result', x);
					callback(x);
				}
			);
		}
	};
	return api;

	function performAuthorization(callback) {
		api.callSmugMug('http://api.smugmug.com/services/oauth/getRequestToken.mg',
			{
				oauth_callback: chrome.identity.getRedirectURL('')
			},
			null,
			function (x) {
				console.log('got request_token', x);
				gotRequestToken(x.oauth_token, x.oauth_token_secret, callback);
			}
		);
	}

	function gotRequestToken(oauth_token, oauth_token_secret, callback) {
		chrome.identity.launchWebAuthFlow(
			{
				url: "http://api.smugmug.com/services/oauth/authorize.mg" +
				  "?oauth_token=" + oauth_token +
				  "&Access=Full" +
				  "&Permissions=Read",
				interactive: true
			},
			function () {
				gotAuthorization(oauth_token, oauth_token_secret, callback);
			}
		);
	}

	function gotAuthorization(oauth_token, oauth_token_secret, callback) {
		try {
			api.callSmugMug('http://api.smugmug.com/services/oauth/getAccessToken.mg',
				{
					//oauth_verifier: obj.oauth_verifier,
					oauth_token: oauth_token
				},
				oauth_token_secret,
				function (x) {
					console.log('got access_token', x);
					gotAccessToken(x, callback);
				}
			);
		}
		catch (e) {
			console.log('callSmugMug failed', e);
		}
	}

	function gotAccessToken(x, callback) {
		if (x) {
			user = x;
			Storage.setParams(user);
			callback(true);
		}
		else {
			user = {};
			callback(false);
		}
	}

})();
