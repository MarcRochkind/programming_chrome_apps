"use strict";
//begin app
window.onload = function () {

document.querySelector("#speak").onclick = function () {
	chrome.tts.speak(
		document.querySelector("#textarea").value,
		{
			voiceName: "Google UK English Female",
			onEvent: function(event) {
				console.log('Event ' + event.type + ' at ' + event.charIndex);
				if (event.type === 'error')
					console.log('Error: ' + event.errorMessage);
			}
		},
		function() {
			if (chrome.runtime.lastError)
				console.log('Error: ' + chrome.runtime.lastError.message);
		}
	);
};

};
//end

//begin getvoices
chrome.tts.getVoices(
	function(voices) {
		console.log(voices);
	}
);
//end

