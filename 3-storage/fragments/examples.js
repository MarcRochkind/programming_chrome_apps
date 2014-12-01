//begin set-get-example
var obj = {
	k_array: [ 1, 2, 3, 4, "five", { number: "six" } ],
	k_date: new Date(),
	k_function: function () { return 123; },
	k_object: { k2_key1: "one", k2_key2: "two" },
	k_regex: /abc/,
	k_string: "string value"
};
chrome.storage.local.set(obj,
	function () {
		chrome.storage.local.get(null,
			function (items) {
				if (chrome.runtime.lastError)
					console.log(chrome.runtime.lastError);
				else
					console.dir(items);
			}
		);
	}
);
//end
