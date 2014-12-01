// To be run with node on a server.
// $ node NYCBus-server.js
// Replace <key> in url with your MTA Bus Time Developer key, which you can get from:
// http://bustime.mta.info/wiki/Developers/Index

var url = "http://api.prod.obanyc.com/api/siri/vehicle-monitoring.json?key=<key>&LineRef=MTA+NYCT_M4";

var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express()
	, request = require('request');

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(5002);

var wsActive;

console.log('http server listening');

function getBusStatus() {
	if (wsActive) {
		request(url,
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body);
					wsActive.send(body);
				}
				else
					console.log("Error", error, response);
			}
		);
	}
}

setInterval(getBusStatus, 60 * 1000); // 60 seconds

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection',
	function(ws) {
		console.log('websocket connection open');
		wsActive = ws;
		getBusStatus();

		ws.onclose = function() {
			console.log('websocket connection close');
			wsActive = null;
		};
	
		ws.onmessage = function (event) {
			console.log(event);
			try {
				if (event.data === "update")
					getBusStatus();
			}
			catch (e) {
				console.log('error: ', e);
			}
		};
	}
);

