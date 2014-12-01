"use strict";
var Flickr = (function () {
	var apiKey;
	var apiSecret;
	var user = {};
	var api = {
		authorize: function (key, secret, callback) {
			apiKey = key;
			apiSecret = secret;
			if (user.oauth_token && user.oauth_token_secret)
				callback();
			else {
				Storage.getParams(['oauth_token', 'oauth_token_secret'],
					function (items) {
						if (items.oauth_token && items.oauth_token_secret) {
							user.oauth_token = items.oauth_token;
							user.oauth_token_secret = items.oauth_token_secret;
							callback();
						}
						else {
							user = {};
							performAuthorization(callback);
						}
					}
				);
			}
		},

		callFlickr: function (url, parameters, tokenSecret, callback) {
			if (!tokenSecret && user.oauth_token_secret)
				tokenSecret = user.oauth_token_secret;
			var timestamp = Date.now();
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
						console.log("callFlickr got response", x);
					}
					catch (e) {
						console.log('callFlickr failed to parse JSON', response);
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
			Flickr.callFlickr('https://api.flickr.com/services/rest',
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
		api.callFlickr('https://www.flickr.com/services/oauth/request_token',
			{
				oauth_callback: chrome.identity.getRedirectURL('')//"https://" + chrome.runtime.id + ".chromiumapp.org"
			},
			null,
			function (x) {
				console.log('got request_token', x);
				gotRequestToken(x, callback);
			}
		);
	}

	function gotRequestToken(obj, callback) {
		chrome.identity.launchWebAuthFlow(
			{
				url: "https://www.flickr.com/services/oauth/authorize" +
				  "?oauth_token=" + obj.oauth_token +
				  "&perms=read",
				interactive: true
			},
			function (responseURL) {
				if (responseURL) {
					console.log("authorized", responseURL);
					var x = Ajax.responseToJSON(responseURL);
					if (!x.oauth_token_secret)
						x.oauth_token_secret = obj.oauth_token_secret; // came with request token
					gotAuthorization(x, callback);
				}
				else
					console.log("Error getting Flickr authorization");
			}
		);
	}

	function gotAuthorization(obj, callback) {
		try {
			api.callFlickr('https://www.flickr.com/services/oauth/access_token',
				{
					oauth_verifier: obj.oauth_verifier,
					oauth_token: obj.oauth_token
				},
				obj.oauth_token_secret,
				function (x) {
					console.log('got access_token', x);
					gotAccessToken(x, callback);
				}
			);
		}
		catch (e) {
			console.log('callFlickr failed', e);
		}
	}

	function gotAccessToken(x, callback) {
		user = x;
		Storage.setParams(user);
		callback();
	}

})();
