//RJ = added my comments with an RJ 

// Steps to complete:

// 1. Create Firebase link
// 2. Create initial train data in database
// 3. Create button for adding new trains - then update the html + update the database
// 4. Create a way to retrieve trains from the trainlist.
// 5. Create a way to calculate the time way. Using difference between start and current time.
//    Then take the difference and modulus by frequency. (This step can be completed in either 3 or 4)

//RJ key first of using firebase, needed apikey and link 
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCcPFcbAjIsgXGQwE-A3AcOXkeD40qypE8",
    authDomain: "train-times-93583.firebaseapp.com",
    databaseURL: "https://train-times-93583.firebaseio.com",
    storageBucket: "train-times-93583.appspot.com"
  };
  
  firebase.initializeApp(config);
  
  var trainData = firebase.database();
  
  //RJ Function is used creat clickable function to generate train schedule
  // 2. Populate Firebase Database with initial data (in this case, I did this via Firebase GUI)
  // 3. Button for adding trains
  $("#add-train-btn").on("click", function(event) {
    // Prevent the default form submit behavior
    event.preventDefault();
    //RJ id this wasnt there i beleive that anytime the page was refreshed the data would be cleared
  

    //RJ this selector is used to grab anything with id "train-name-input" ect  and set = to these new variables
    // Grabs user input
    var trainName = $("#train-name-input")
      .val()
      .trim();
    var destination = $("#destination-input")
      .val()
      .trim();
    var firstTrain = $("#first-train-input")
      .val()
      .trim();
    var frequency = $("#frequency-input")
      .val()
      .trim();
  
    // Creates local "temporary" object for holding train data
    //RJ this is needed so that variables can be assigned to the newTrain
    var newTrain = {
      name: trainName,
      destination: destination,
      firstTrain: firstTrain,
      frequency: frequency
    };
  
    // Uploads train data to the database
    //RJ needed to assign object 
    trainData.ref().push(newTrain);
  
    // Logs everything to console
    //RJ logs into console so data is not lost 
    console.log(newTrain.name);
    console.log(newTrain.destination);
    console.log(newTrain.firstTrain);
    console.log(newTrain.frequency);
  
    // Alert
    //RJ this is a pop-up type message that the user has to click out of 
    alert("Train successfully added");
  
    // Clears all of the text-boxes
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#first-train-input").val("");
    $("#frequency-input").val("");
  });
  
  // 4. Create Firebase event for adding trains to the database and a row in the html when a user adds an entry
  trainData.ref().on("child_added", function(childSnapshot, prevChildKey) {
    console.log(childSnapshot.val());
  
    // Store everything into a variable.
    //RJ important that info stored as variables so that can be stored w firebase
    var tName = childSnapshot.val().name;
    var tDestination = childSnapshot.val().destination;
    var tFrequency = childSnapshot.val().frequency;
    var tFirstTrain = childSnapshot.val().firstTrain;
  
    //RJ this is splitting the string to assist with time
    var timeArr = tFirstTrain.split(":");
    //RJ creating way to take string and view time as hours and mins
    var trainTime = moment()
      .hours(timeArr[0])
      .minutes(timeArr[1]);
    var maxMoment = moment.max(moment(), trainTime);
    var tMinutes;
    var tArrival;
  
    // If the first train is later than the current time, sent arrival to the first train time
    if (maxMoment === trainTime) {
      tArrival = trainTime.format("hh:mm A");
      tMinutes = trainTime.diff(moment(), "minutes");
    } else {
      // Calculate the minutes until arrival using hardcore math
      // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
      // and find the modulus between the difference and the frequency.
      var differenceTimes = moment().diff(trainTime, "minutes");
      var tRemainder = differenceTimes % tFrequency;
      tMinutes = tFrequency - tRemainder;
      // To calculate the arrival time, add the tMinutes to the current time
      tArrival = moment()
        .add(tMinutes, "m")
        .format("hh:mm A");
    }
    //RJ console.loging the info 
    console.log("tMinutes:", tMinutes);
    console.log("tArrival:", tArrival);
  
    // Add each train's data into the table
    //shift the data into a table to create user friendly way to view info
    $("#train-table > tbody").append(
      $("<tr>").append(
        $("<td>").text(tName),
        $("<td>").text(tDestination),
        $("<td>").text(tFrequency),
        $("<td>").text(tArrival),
        $("<td>").text(tMinutes)
      )
    );
  });
  
  // Assume the following situations.
  
  // (TEST 1)
  // First Train of the Day is 3:00 AM
  // Assume Train comes every 3 minutes.
  // Assume the current time is 3:16 AM....
  // What time would the next train be...? ( Let's use our brains first)
  // It would be 3:18 -- 2 minutes away
  
  // (TEST 2)
  // First Train of the Day is 3:00 AM
  // Assume Train comes every 7 minutes.
  // Assume the current time is 3:16 AM....
  // What time would the next train be...? (Let's use our brains first)
  // It would be 3:21 -- 5 minutes away
  
  // ==========================================================
  
  // Solved Mathematically
  // Test case 1:
  // 16 - 00 = 16
  // 16 % 3 = 1 (Modulus is the remainder)
  // 3 - 1 = 2 minutes away
  // 2 + 3:16 = 3:18
  
  // Solved Mathematically
  // Test case 2:
  // 16 - 00 = 16
  // 16 % 7 = 2 (Modulus is the remainder)
  // 7 - 2 = 5 minutes away
  // 5 + 3:16 = 3:21
  