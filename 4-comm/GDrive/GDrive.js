"use strict";
window.onload = function () {

Google.authorize(
	function () {
		var ta = document.querySelector('#textarea');
		ta.value = 'Wait ...';
		Google.call('drive/v2/files?q=trashed%3dfalse',
			function (response) {
				var s = '';
				response.items.forEach(
					function (file) {
						s += file.modifiedDate + '  ' + file.title + '\n';
					}
				);
				ta.value = s;
			},
			function (msg) {
				ta.value = 'Error: ' + msg;
			}
		);
	}
);

};
