// ---------------------------
// initialize global variables
// ---------------------------

// Server configuration: This code requires the server to have CORS enabled (edit httpd.conf appropriately) 

// set-up data object --> all key values will be the headers on the output csv
var thisData = {
  "subjID":[],
  "workerId": [],
  "experimentName":[],
  "versionName": [],
  "sequenceName":[],
  "url":[],
  "selected_row": [],
  "windowWidth":[],
  "windowHeight":[],
  "screenWidth":[],
  "screenHeight":[],
  "startDate":[],
  "startTime":[],
  "trial": [],
  "stimulus":[],
  "duration": [],
  "scale": [],
  "actual_depth": [],
  "depth_estimate": [],
  "trial_RT":[],
  "log_sceneDuration": [],
  "unitSelection": [],
  "seq_filepath": []
  };

var aqData = {}

// information flow: depth_duration_variables.csv --> url for participant --> counterbalancing csv indexed by url fragment --> sampled json path
// depth_duration_variables.csv is uploaded when publishing a batch --> This contains the url for each participant 

// Row of counterbalancing array to be sampled is stored in the url fragment (part after #)
var url = window.location.href 
// var url_num = url.split("#")[1].split("?")[0];

var url_split = url.split("#")
var url_num = url_split[url_split.length - 1]

console.log(url_num)

// set subject ID as a random 6 digit number
var subjID = randomIntFromInterval(100000, 999999);

// start time variables
var start = new Date;
var startDate = start.getMonth() + "-" + start.getDate() + "-" + start.getFullYear();
var startTime = start.getHours() + "-" + start.getMinutes() + "-" + start.getSeconds();

// initialize empty variables
var stimulus, scale, duration, actual_depth, depth_estimate, endExpTime, startExpTime, RT, log_sceneDuration, reported_age, ypos, reported_gender; 
var workerId = "";

// unit preference variables 
var pref = false // unit preference has not been made
var unit = null

// constant timing variables 
var fixation_time = 500
var mask_time = 500 

var practice_trial = 0 // counter that references the index of the practice_seq variable 

// includes a catch trial 
var pseq_json = [{"sequence": "practice", "image": "p1_1x_4_304.png", "duration": 250, "scene": "p1", "num": 0, "depth": 4.0, "scale": "1x", "ypos": 304, "image_path_target": "VR_PracticeStimuli/p1_1x_4_304.png", "mask_path": "masks/mask_0.jpg", "fixation_path": "fixation.jpg"}, {"sequence": "practice", "image": "p2_1.3x_3_371_BC.png", "duration": 250, "scene": "p2", "num": 1, "depth": 3.0, "scale": "1.3x", "ypos": 371, "image_path_target": "VR_PracticeStimuli/p2_1.3x_3_371_BC.png", "mask_path": "masks/mask_1.jpg", "fixation_path": "fixation.jpg"}, {"sequence": "practice", "image": "p3_0.75x_1.4_278.png", "duration": 250, "scene": "p3", "num": 2, "depth": 1.4, "scale": "0.75x", "ypos": 278, "image_path_target": "VR_PracticeStimuli/p3_0.75x_1.4_278.png", "mask_path": "masks/mask_2.jpg", "fixation_path": "fixation.jpg"}, {"sequence": "practice", "image": "c3.png", "duration": 250, "scene": "c3", "num": 3, "depth": 0, "scale": "0", "ypos": 420, "image_path_target": "VR_PracticeStimuli/c3.png", "mask_path": "masks/mask_3.jpg", "fixation_path": "fixation.jpg"}]
var practice_seq = JSON.parse(JSON.stringify(pseq_json))

var practiced = false // practice trials have not been completed 

var trial = 0 //counter that references the index of the stim_seq variable

var counter = 0 // counter for logging 

// 54 + 6 catch trials = 60
var num_trials = 59 // since indexing starts at zero num_trial = actual total trials - 1

// solves problem of last practice variables being saved in the estimate variable and getting recorded 
// set to true once trial has actually begun NOT in the beginning of the function because the practice trial is still saved in the estimate variable
var start_recording = false 
var age_recorded = false

// reads in counterbalancing csv and calls function to get sequence filepath 
var data = $.ajax({
                url: 'counterbalancing.csv',
                dataType: 'text',
              }).done(successFunction);


function successFunction(data) {
  // reads in CSV and converts to JS array
  var allRows = data.split(/\r?\n|\r/);
  var table = [];
  for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
    var rowCells = allRows[singleRow].split(',');
    for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
      if (rowCell == 0){
        var table_row = []
      }                 
      table_row.push(rowCells[rowCell]);
    }
    table.push(table_row);

  }
  counterbalancing_array = table

  seq_filepath = counterbalancing_array[url_num][0]; // filepath is the first element of the row (passed in through URL)
  selected_row = url_num; // log which row was selected 
  console.log(seq_filepath)

  // ajax request for selected JSON (seq_filepath)
  stim_seq = $.ajax({ // loads in stimulus sequence from server
                          url: seq_filepath,
                          method: 'GET',
                          dataType: 'json',
                          data: JSON.stringify(),
                          success: function (data) {
                            stim_seq = data; 
                            sequenceName = seq_filepath// get sequence name, which is pushed in saveTrialData
                            preload(practice_seq, stim_seq); // calls function to preload all scene images 
                            preloadMasks(practice_seq, stim_seq); // calls function to preload all mask images 
                          },
                });

}


// ----------------
// set-up functions
// ----------------

$(document).ready(function(){

  // on open, add text to the startingInstructions div 
  $(".buttonDivPg2").hide();
  $(".buttonDivPg3").hide();
  $(".buttonDivPg4").hide();
  $(".metersButtonDiv").hide();
  $(".feetButtonDiv").hide();
  $("#getConsent").hide();
  $(".workerIdDiv").hide(); // hide WorkerId input page

  $("#start_trials").hide()
  $(".startTrialsButtonDiv").hide();


  $("#Instructions2").hide();
  $("#restart_trials").hide();
  $("#restartTrialsButton").hide();
  $("#FinalInstructions").hide();
  $("#container-questionnaire").hide();


  $("#startingInstructions").append( 
    "<h1>Thank you for accepting this task!</h1>"
    + "<p>In this task, you are asked to make judgments about everyday objects and scenes. This psychology task takes less than 10 minutes and you will be compensated $1.34.</p>"
    + "<p>This research is conducted by the Cognitive Neuroscience Lab at the George Washington University. You may contact us at kravitzlab.online@gmail.com.</p>"
    + "<p>This task can only be completed once. If you have already completed this task before the system will not allow you to run again. If this looks familiar please exit so someone else can participate. </p>"
    + "<p>Otherwise, please click 'NEXT' to reveal further instructions and an informed consent agreement.</p>"
    );

    // $("#startingInstructions").append( 
    //   "<h1>Thank you for accepting this HIT!</h1>"
    //   + "<p>In this Human Intelligence Task (HIT), you are asked to make judgments about everyday objects and scenes. This psychology task takes less than 10 minutes and you will be compensated $1.05.</p>"
    //   + "<p>This research is conducted by the Cognitive Neuroscience Lab at the George Washington University. You may contact us at kravitzlab.online@gmail.com.</p>"
    //   + "<p>This task can only be completed once. If you have already completed this task before the system will not allow you to run again. If this looks familiar please return the HIT so someone else can participate. </p>"
    //   + "<p>Otherwise, please click 'NEXT' to reveal further instructions and an informed consent agreement.</p>"
    //   );


  document.getElementById("subjID").value = subjID;
  document.getElementById("startDate").value = startDate;
  document.getElementById("startTime").value = startTime;

});


// INSTRUCTIONS & CONSENT - Before Practice // 


function showConsent(){
  $(".buttonDivPg2").show();
  $(".buttonDivPg1").hide();(9 * 2.9) /
  $(".buttonDivPg3").hide();
  $(".buttonDivPg4").hide();
  $(".metersButtonDiv").hide();
  $(".feetButtonDiv").hide();
  $(".workerIdDiv").hide(); // hide WorkerId input page



  $("#startingInstructions").hide();
  $("#Instructions2").hide();

  $("#FinalInstructions").hide()
  $("#container-questionnaire").hide();
  $("#getConsent").show();

}


// SHOW WORKER ID PAGE AFTER USER INDICATES THEY ARE A TURK WORKER WITH A VALID WORKER ID 
function showWorkerIdInputBox(){

	$("#getConsent").hide();
  $(".buttonDivPg2").hide();
	// $("#findWorkerId").attr("src","findWorkerId.bmp"); // attribute bmp file name to img describing how/where to find workerId 
	$(".workerIdDiv").show(); // show WorkerId input page 

}

// SAVE TURK WORKER ID (FROM TEXTBOX INPUT) WHEN USER CLICKS "NEXT" ON WORKER ID PAGE 
function saveWorkerId(){
	
	workerId = document.getElementById("turkWorkerId").value; // save workerId to variable  
	if (workerId != ""){  
    $.ajax({ //same as $.post, but allows for more options to be specified
      type: "GET", // since data is included in the url it is a GET request 
      url: 'https://spatial-perception-4e1b90d4f4e5.herokuapp.com/mark_pending?experiment='+ encodeURIComponent(url), //update from unsampled to pending
  
      // if it works OR fails, submit the form
      success: function(){
        $(".workerIdDiv").hide(); // hide WorkerId input page 
		    nextInstructions();  
      },
      error: function(){
        window.alert("Server error. Please return the task and/or message us.");
      }
    });
    console.log(url)
		
	}
	else{   
		_text = "You must enter a valid Worker ID in order to proceed";  
		document.getElementById("workerId_feedback").innerHTML = _text; 
		window.alert("You must enter a valid Worker ID in order to proceed");
	}


}

function nextInstructions(){

  $("#getConsent").hide();
  $("#Instructions2").show();
  $("#FinalInstructions").hide()
  $("#container-questionnaire").hide();

  $(".buttonDivPg2").hide();
  $(".buttonDivPg1").hide();
  $(".buttonDivPg3").show();
  $(".buttonDivPg4").hide();
  $(".metersButtonDiv").hide();
  $(".feetButtonDiv").hide();
}

function finalInstructions(){

  $("#getConsent").hide();
  $("#Instructions2").hide();
  $("#FinalInstructions").show()
  $("#container-questionnaire").hide();

  $(".buttonDivPg2").hide();
  $(".buttonDivPg1").hide();
  $(".buttonDivPg3").hide();
  $(".metersButtonDiv").hide();
  $(".feetButtonDiv").hide();
  $(".buttonDivPg4").show()

  $("#FinalInstructions").append(
    "<h1> Instructions </h1>"
    + "<p> A fixation cross will appear in the center of the screen - focus on this cross. The target will then appear for a brief amount of time, so make sure you are watching closely as to not miss the target. Then, the scene and target will disappear, and you will see an image of colored squares. Once this image disappears you will be prompted to enter your distance judgment. Be sure to give your estimate as a single number, rather than a range of possible values. You can use decimals to indicate fractions. After entering your distance judgment, click the 'NEXT' button. As soon as you click this button, the fixation cross will be displayed.</p>"
    + "<b> On some trials, there will be NO target. On these trials, enter '0' in the response box. </b>"
    + "<p> We ask that you pay close attention on each trial so you detect all of the targets, but occasionally you may accidentally miss one. If you do, please enter '0' in the response box.</p>"
    + "<p> You will see 60 images, and the experiment will take approximately 9 minutes. </p>"
    + "<p> The experiment will begin with four practice trials. If you are ready to begin, please click 'BEGIN' below. </p>"
    )
}

function getUnits(){
  $("#getConsent").hide();
  $("#Instructions2").hide();
  $("#FinalInstructions").hide();
  $("#getUnits").show()

  $(".buttonDivPg2").hide();
  $(".buttonDivPg1").hide();
  $(".buttonDivPg3").hide();
  $(".buttonDivPg4").hide();
  $(".metersButtonDiv").show()
  $(".feetButtonDiv").show()

  $("#getUnits").append(
    "<p> This study will ask you to estimate the distance of objects. What unit of measurement would you like to use?<p/>"
    )
}

function recordUnitsMeters(){
  pref = true // units have been chosen 
  unit = "meters"
  console.log(unit)

  $("#getUnits").hide()
  $(".metersButtonDiv").hide()
  $(".feetButtonDiv").hide()

  $(".startPracticeButtonDiv").show()

}

function recordUnitsFeet(){
  pref = true // units have been chosen 
  unit = "feet"
  console.log(unit)

  $("#getUnits").hide()
  $(".metersButtonDiv").hide()
  $(".feetButtonDiv").hide()
  $(".startPracticeButtonDiv").show()

}

function startPractice(){
  // not recording responses from practice trials 

  $(".startPracticeButtonDiv").hide()
  $(".practice_feedbackDiv").hide()
  // 4 practice trials
  if (practice_trial > 3){
    practiced = true
    $("#start_trials").show()
    $(".startTrialsButtonDiv").show();

  }

  else{
    scene_duration = getTrialDuration();
    var fixation = showFixation();
    // Timing note: time accumulates so it is not actual duration but relative time
    // have to account for the time already spent
    var scene = setTimeout(function(){showScene();}, fixation_time); // the time here is how long it takes to show up NOT time on the screen
    var mask = setTimeout(function(){showMask();}, fixation_time + scene_duration); 
    var response = setTimeout(function(){getResponse();}, fixation_time + scene_duration + mask_time)
  }
}

function runTrial(){ 

  $(".startPracticeButtonDiv").hide()
  $("#start_trials").hide()
  $(".startTrialsButtonDiv").hide();

  $("#restart_trials").hide();
  $("#restartTrialsButton").hide();
  $(".practice_feedbackDiv").hide()


  if (start_recording == true){ // prevents the last practice trial from being recorded 
    var trial_params = getTrialParams();

    stimulus = trial_params[0]
    duration = trial_params[1]
    actual_depth = trial_params[2]
    scale = trial_params[3]

    depth_estimate = document.getElementById("numb").value;
    console.log(depth_estimate)

    endTrialTime = new Date; // time at which response has been given for past trial
    RT = endTrialTime - startTrialTime;

    saveTrialData();

    counter ++;

  }

  if (trial == 0){
    startExpTime = new Date; // get start time of first trial to calculate total experiment time
  }

  if (trial > num_trials){ 
    endExpTime = new Date; //get time of end of last block to calculate total experiment time

    getAge();

  }

  else{
    console.log(trial)

    start_recording = true; // start recording because practice trials are done 
    scene_duration = getTrialDuration();
    var fixation = showFixation();
    // Timing note: time accumulates so it is not actual duration but relative time
    // have to account for the time already spent
    var scene = setTimeout(function(){showScene();}, fixation_time); // the time here is how long it takes to show up NOT time on the screen
    var mask = setTimeout(function(){showMask();}, fixation_time + scene_duration); 
    var response = setTimeout(function(){getResponse();}, fixation_time + scene_duration + mask_time)
      
  }
}



function showFixation(){

  f_path = "fixation.jpg"
  $("#fixation_image").attr("src", f_path)

  $(document).ready(function(){
    $(".fixationDiv").show();
    $(".practice_feedbackDiv").hide()
  })

}

function showScene(){
  if (practiced == false){
    var s_path = practice_seq[practice_trial].image_path_target

    const ypos = practice_seq[practice_trial].ypos

    var screenHeight = window.innerHeight;

    console.log(screenHeight, 'SH')
    console.log(ypos, 'YPOS')

    // var top_px = (screenHeight / 2 - (840 - ypos - 840 / 2)) - 420;
    const transf_ypos = 530 * (ypos/840)
    var top_px = (screenHeight / 2 - (530 - transf_ypos - 530 / 2)) - 265;

    console.log(top_px)
    var num_string = top_px.toString();
    var pos = document.getElementById("scene");
    pos.style.top = num_string + 'px'

    $("#scene_image").attr("src", s_path);


    var s_duration = practice_seq[practice_trial].duration 
    var actual_depth = stim_seq[trial].depth

  }

  else{ 
    startTrialTime = new Date; // time at which the scene is presented for a given trial 

    var s_path = stim_seq[trial].image_path_target

    var s_path_split = s_path.split("/")
    var folder = s_path_split[s_path_split.length - 2]

    const ypos = stim_seq[trial].ypos

    var screenHeight = window.innerHeight;

    console.log(screenHeight, 'SH')
    console.log(ypos, 'YPOS')

    // var top_px = (screenHeight / 2 - (840 - ypos - 840 / 2)) - 420;
    const transf_ypos = 530 * (ypos/840)
    var top_px = (screenHeight / 2 - (530 - transf_ypos - 530 / 2)) - 265;
    
    console.log(top_px)
    var num_string = top_px.toString();
    var pos = document.getElementById("scene");
    pos.style.top = num_string + 'px'


    $("#scene_image").attr("src", s_path);
    
    var s_duration = stim_seq[trial].duration 
    var actual_depth = stim_seq[trial].depth
  }

  startSceneTimeLog = new Date; // time at which scene is presented 
  


  $(document).ready(function(){
    $(".fixationDiv").hide();
    $(".maskDiv").hide();
    $(".sceneDiv").show();
    $(".practice_feedbackDiv").hide()
  })

}

function getTrialDuration(){ // from sequence json
  if (practiced == false){
    var stim_duration = stim_seq[practice_trial].duration 
  }
  else{ 
    var stim_duration = stim_seq[trial].duration
  }
  return stim_duration
}

function showMask(){
  if (practiced == false){
    var m_path = practice_seq[practice_trial].mask_path
  }
  else{ 
    var m_path = stim_seq[trial].mask_path
  }

  endSceneTimeLog = new Date;
  log_sceneDuration = endSceneTimeLog - startSceneTimeLog;
  $("#mask_image").attr("src", m_path);
  $(document).ready(function(){
    $(".fixationDiv").hide();
    $(".sceneDiv").hide();
    $(".maskDiv").show();
    $(".practice_feedbackDiv").hide()
  })

}

// https://www.w3schools.com/js/js_validation.asp
// depth estimate is validated in html response div

function getResponse(){

  $(document).ready(function(){
    $(".fixationDiv").hide();
    $(".sceneDiv").hide();
    $(".maskDiv").hide();
    $(".responseDiv").show();
    $(".practice_feedbackDiv").hide()


  })

}

function showFeedback(){
  console.log('show feedback')
  $(document).ready(function(){
    $(".fixationDiv").hide();
    $(".sceneDiv").hide();
    $(".maskDiv").hide();
    $(".responseDiv").hide();
    $(".practice_feedbackDiv").show();
    $(".green_fixationDiv").hide();
    $("#practice_feedback").show()

  })
  if (practice_trial== 3){
    if (document.getElementById("numb").value == 0){
        $("#practice_feedback").empty().append("<b>Correct! There was no target in the image.</b>");
        // $("#practice_feedback").append("<p>Correct!</p>");
    }
    else{
        $("#practice_feedback").empty().append("<b>Incorrect. There was no target in the image. Remember to respond '0' when there is no target in the image</b>");
        // $("#practice_feedback").append("<b>Incorrect. There was no target in the image. Remember to respond '0' when there is no target in the image</b>");
    }
  }

  else{
    $("#practice_feedback").empty().append("<b>Good job. </b>");
  
  }

}

function getAge(){

  $(document).ready(function(){
    $(".fixationDiv").hide();
    $(".sceneDiv").hide();
    $(".maskDiv").hide();
    $(".responseDiv").hide();
    $(".practice_feedbackDiv").hide()
    $("#restart_trials").hide();
    $("#restartTrialsButton").hide();
    $("#age").show();


  })


}

function getTrialParams(){ // returns trial parameters to be logged 
  var stimulus = stim_seq[counter].image_path_target
  var duration = stim_seq[counter].duration 
  var actual_depth = stim_seq[counter].depth
  var scale = stim_seq[counter].scale

  return [stimulus, duration, actual_depth, scale];

}

function getAQ(){
  if (age_recorded == false){
    reported_age = document.getElementById("age_numb").value;
    reported_gender = document.getElementById("gender").value;
    console.log(reported_gender)
    saveTrialData();
    age_recorded = true
  }

  if (age_recorded == true){
    $("#age").hide() 
    $("#container-questionnaire").show();
    // $("#revealCodeButton").show();

  }

}

function lastInstructions(){ 
  if (age_recorded == false){
    reported_age = document.getElementById("age_numb").value;
    reported_gender = document.getElementById("gender").value;
    console.log(reported_gender)
    saveTrialData();
    age_recorded = true
  }

  if (age_recorded == true){
    $("#age").hide() 
    $("#container-questionnaire").hide();
    $("#lastBlockInstructions").append(
      "<p style='text-align:center'>Congratulations, you have finished the experiment. Thank you for your participation!</p>"
      +"<p style='text-align:center'>Click the button below to reveal your unique completion code.</p>")
    $("#lastBlockInstructions").show();
    $("#revealCodeButton").show();

  }
 

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function endExperiment(){

  if (age_recorded == true){
    // gives participant their unique code and saves data to server --> this page should look identical to redirect html (revealCode.html)
    $("#lastBlockInstructions").append("<br><p style='text-align:center'><strong>Your unique completion code is: </strong>" +subjID+"</p>");
    $("#revealCodeButton").hide();
    saveAllData();
  }
}

// ---------------------
// saving data functions
// ---------------------

function saveTrialData(){
  // at the end of each trial, appends values to data dictionary

  // global variables --> will be repetitive, same value for every row (each row will represent one trial)
  thisData["subjID"].push(subjID);
  thisData["workerId"].push(workerId);
  thisData["experimentName"].push("final-intermixed-textured");
  thisData["versionName"].push("v2");
  thisData["sequenceName"].push(sequenceName);
  thisData["url"].push(url);
  thisData["selected_row"].push(selected_row);
  thisData["windowWidth"].push($(window).width());
  thisData["windowHeight"].push($(window).height());
  thisData["screenWidth"].push(screen.width);
  thisData["screenHeight"].push(screen.height);
  thisData["startDate"].push(startDate);
  thisData["startTime"].push(startTime);
  thisData["unitSelection"].push(unit);

  // trial-by-trial variables, changes each time this function is called
  thisData["trial"].push(trial);
  thisData["stimulus"].push(stimulus);
  thisData["duration"].push(duration);
  thisData["actual_depth"].push(actual_depth);
  thisData["scale"].push(scale);
  thisData["depth_estimate"].push(depth_estimate);
  thisData["trial_RT"].push(RT);
  thisData["log_sceneDuration"].push(log_sceneDuration);

}

function saveAllData() {
  // saves last pieces of data that needed to be collected at the end, and calls sendToServer function

  // add experimentTime and totalTime to data dictionary
  var experimentTime = (endExpTime - startExpTime);
  var totalTime = ((new Date()) - start);
  thisData["experimentTime"]=Array(trial).fill(experimentTime);
  thisData["totalTime"]=Array(trial).fill(totalTime);
  var age = reported_age;
  console.log('age', age)
  thisData["age"] = Array(trial).fill(age);
  thisData["gender"] = Array(trial).fill(reported_gender);
  thisData["seq_filepath"] = Array(trial).fill(seq_filepath);
  // change values for input divs to pass to php
  $("#experimentData").val(JSON.stringify(thisData));
  $("#completedTrialsNum").val(trial); //how many trials this participant completed

  sendToServer();
  console.log("save all data")
}

function sendToServer() {
  // send the data to the server as string (which will be parsed IN php)

  $.ajax({ //same as $.post, but allows for more options to be specified
    headers:{"Access-Control-Allow-Origin": "*", "Content-Type": "text/csv"}, //headers for request that allow for cross-origin resource sharing (CORS)
    type: "POST", //post instead of get because data is being sent to the server
    url: $("#saveData").attr("action"), //url to php
    data: $("#experimentData").val(),  

    // if it works OR fails, submit the form
    success: function(){
      $.ajax({ //same as $.post, but allows for more options to be specified
        type: "GET", // since data is included in the url it is a GET request 
        url: 'https://spatial-perception-4e1b90d4f4e5.herokuapp.com/mark_done?experiment='+ encodeURIComponent(url), //update from unsampled to pending
    
        // if it works OR fails, submit the form
        success: function(){
          console.log('marked done')
        },
        error: function(){
          window.alert("Server error. Please return the task and/or message us.");
        }
      });
      document.forms[0].submit();
    },
    error: function(){
      document.forms[0].submit();
    }
  });
}

// ----------------------
// other random functions
// ----------------------

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}