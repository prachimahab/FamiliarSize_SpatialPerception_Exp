<?php
	// set response headers that are required for cross-origin resource sharing (CORS) --> I got these from the internet so not sure what they do exactly
	// Update: CORS issue was solved by editing httpd.conf file @ /etc/httpd/conf/httpd.conf in server
	header("Access-Control-Allow-Origin:*");
	header("Access-Control-Allow-Credentials:true");
	header("Access-Control-Max-Age: 100000");
	header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
	header("Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS, DELETE");

	// set variables, either explicitly or post variables from form inputs
	// $experimentName = "DepthDuration"; // basic paradigm with duration manipulation 
	$experimentPath = "FacialAge/BNav_EC2/DepthDuration";
	// $versionName = "duration_manipulation";
	$folderName = "MX_fS_MTurk";
	// $dataURL = "/var/www/html/{$experimentPath}/{$folderName}/data"; //this needs to be the location on the SERVER, not on the IP address
	$dataURL = "/var/www/html/FacialAge/BNav_EC2/DepthDuration/MX_fS_VE_MTurk/data";
	$startDate = $_POST["startDate"];
	$startTime = $_POST["startTime"];
	$subjID = $_POST["subjID"];
	$workerId = $_POST["workerId"];
	$totalTrials = $_POST["completedTrialsNum"];
	$dataDictString = $_POST["experimentData"]; //input as a string version of data dictionary

	// FIXES OFFSET PHP SAVE ERROR
	// reroute on form submit instead of refresh
	header("Location: revealCode.html?code=".$subjID); //any variables to pass to new html should exist after a ? at the end of the re-route url

	// parse incoming data
	$dataDict = json_decode($dataDictString, true); //parses input string, true specifies that it is an object and not an array so you can have key-value pairs
	$dataKeys = array_keys($dataDict); //this is an object consisting of all the csv headers

	// format data for csv
	$data = implode(",",$dataKeys)."\r\n"; //first row of csv, put commas between every csv header value and add newline at the end
	for ($trial=0; $trial < $totalTrials; $trial++){ //number of rows
		$row = array(); //initialize new row to be added to final data
		for ($header=0; $header < count($dataKeys); $header++){ //number of headers
		    array_push($row, $dataDict[$dataKeys[$header]][$trial]); //add the $trial-th value of the $header-th header to this row
		}
		$row = implode(",", $row); //put commas between all values in this row
		$row = $row . "\r\n"; //add newline at the end of the row
		$data = $data . $row; //add this row to data variable
	}

	// write data to csv
	$fname = "{$dataURL}/{$startDate}_{$startTime}_{$subjID}.csv"; //location and name of file to save
	$fcon = fopen($fname,'w'); //create a writable file at that location with that name
	fwrite($fcon, $data); //write data (formatted for csv) to writable file
	fclose($fcon);

	// reroute on form submit instead of refresh
	// header("Location: revealCode.html?code=".$subjID); //any variables to pass to new html should exist after a ? at the end of the re-route url
?>