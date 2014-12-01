<?php

//begin bus1
define('REG_ID_FILE', 'regID-bus.data');
define('API_KEY', '<your API key>');
define('MTA_KEY', '<your MTA key>');

$url = "http://api.prod.obanyc.com/api/siri/stop-monitoring.json?key=" .
  MTA_KEY . "&MonitoringRef=400516";

if (!empty($_REQUEST['regid']))
	store_regID($_REQUEST['regid']);
else
	broadcast();

function get_regIDs() {
	if (file_exists(REG_ID_FILE))
		return unserialize(file_get_contents(REG_ID_FILE));
	return array();
}

function store_regID($regID) {
	$a = get_regIDs();
	$a[$regID] = 1;
	file_put_contents(REG_ID_FILE, serialize($a));
}
//end

function broadcast() {
	$num_sent = 0;
	for ($n = 0; $n < 20; ) {
		$regIDs = '';
		foreach (get_regIDs() as $k => $v)
			$regIDs .= ',"' . $k . '"';
		$regIDs = substr($regIDs, 1);
		if (send_message(API_KEY, $regIDs))
			$n++;
		sleep(15);
	}
}

function send_message($apiKey, $regIDs) {
	global $url;
	global $prev;

	$response = send_request(false, $url, array("Content-Type: application/json"));
	$x = json_decode($response);
	$sd = $x->Siri->ServiceDelivery;
	$rt = $sd->ResponseTimestamp;
	$msv = $sd->StopMonitoringDelivery[0]->MonitoredStopVisit;
	$s = '';
	foreach ($msv as $k => $v) {
		$mvj = $v->MonitoredVehicleJourney;
		$dist = $mvj->MonitoredCall->Extensions->Distances->PresentableDistance;
		$stopName = $mvj->MonitoredCall->StopPointName;
		switch ($dist) {
		case 'at stop':
		case 'approaching':
		case '1 stop away':
			$s .= "; {$mvj->PublishedLineName} {$dist}";
		}
	}
	if (!empty($s) && $s != $prev) {
		$prev = $s;
		$msg = substr($rt, 11, 8) . " -- " . substr($s, 2) . "@$stopName";
		echo "<hr>$msg";
		$data = <<<EOT
			{
				"data": {
					"message": "$msg"
				},
				"registration_ids": [$regIDs],
				"delay_while_idle": true,
				"time_to_live": 600
			}
EOT;
		send_request(true, "https://android.googleapis.com/gcm/send",
		  array("Content-Type: application/json", "Authorization: key=$apiKey"),
		  $data);
	}
}

function send_request($post, $url, $headers, $postText = null) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers); 
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, $post);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	if ($postText)
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postText);
	$response = curl_exec($ch);
	curl_close($ch);
	return $response;
}
?>
