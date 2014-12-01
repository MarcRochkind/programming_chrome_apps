"use strict";
//begin app1
window.onload = function () {

chrome.bluetooth.getDevices(
	function(devices) {
		devices.forEach(updateDeviceName);
	}
);

function updateDeviceName(device) {
	log('\nadded: ' + device.name);
	console.log(device);
	var b = document.createElement('button');
	b.className = 'device';
	b.innerText = 'Connect to ' + device.name;
	b.device = device;
	b.onclick = function (e) {
		connectTo(e.srcElement.device);
	};
	document.body.appendChild(b);
};

function log(msg) {
	var m = (typeof(msg) == 'object') ? JSON.stringify(msg) : msg;
	console.log(m);
	document.querySelector("#textarea").value += m + '\n';
}

//insert };
//end

//begin startDiscovery
document.querySelector("#discover").onclick = function () {
	chrome.bluetooth.startDiscovery(
		function() {
			log('\ndiscovery started');
			// Stop discovery after 30 seconds.
			setTimeout(
				function() {
					chrome.bluetooth.stopDiscovery(function() {});
					log('\ndiscovery stopped');
				},
				30000
			);
		}
	);
};
//end

function removeDeviceName(device) {
	log('\ndeleted: ' + device.name);
	for (var d of document.body.children) {
		if (d.className === 'device' && d.device.address === device.address)
			document.body.removeChild(d);
	}
}

//begin handlers
chrome.bluetooth.onDeviceAdded.addListener(updateDeviceName);
chrome.bluetooth.onDeviceChanged.addListener(updateDeviceName);
chrome.bluetooth.onDeviceRemoved.addListener(removeDeviceName);
//end

function connectTo(device) {
	var uuid = '1106';
	var onConnectedCallback = function() {
		if (chrome.runtime.lastError) {
			console.log("Connection failed: " +
			  chrome.runtime.lastError.message, device.name);
		}
		else {
			console.log('Connected OK');
			// ... use connection as defined by profile ...
		}
	};

	chrome.bluetoothSocket.create(
		function(createInfo) {
			console.log(createInfo);
			// ... should save createInfo.socketId ...
			chrome.bluetoothSocket.connect(createInfo.socketId,
			  device.address, uuid, onConnectedCallback);
		}
	);
}

};
