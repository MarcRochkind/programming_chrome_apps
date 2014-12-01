"use strict";
var Storage = (function () {
	return {
		setParams: function (x, wantSync) {
			var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
			storageArea.set(x,
				function () {
					if (chrome.runtime.lastError)
						console.log(chrome.runtime.lastError);
				}
			);
		},

		getParams: function (x, callback, wantSync) {
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
	};
})();
