// Variables //

var width = 1280;
var height = 0;

var streaming = false;

var video = null;
var canvas = null;
var photo = null;
var streamObj = null;

const updateInt = 1000

// Pick Strongest Emotion //

const pickHighest = (obj, num = 1) => {
  var requiredOBJ = "";
  if (num > Object.keys(obj).length) {
    return false;
  };
  Object.keys(obj).sort((a, b) => obj[b] - obj[a]).forEach((key, ind) => {
    if (ind < num) {
      requiredOBJ = Object.keys(obj).find(keyy => obj[keyy] === obj[key]);
    }
  });
  return requiredOBJ;
}

// Face Detection API //

async function faceDect(){

  console.log("Started");

  const MODEL_URL = 'models'

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL)
  await faceapi.loadFaceExpressionModel(MODEL_URL)
  await faceapi.loadAgeGenderModel(MODEL_URL)

  console.log("Models loaded")

  const input = document.getElementById('videoTest')
  const canvas = document.getElementById('canvasTest')
  const imageSize = {width: $("#videoTest").width(), height: $("#videoTest").height()}
  faceapi.matchDimensions(canvas, imageSize)

  var logDesc = true;

  var peopleStats = {
    people: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    disgusted: 0,
    fearful: 0,
    surprised: 0,
    youngest: 1000,
    oldest: 0,
    ageArray: [],
    male: 0,
    female: 0,
  }

  // var agesArray = [0,0,0];

  setInterval(async () => {
    let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    resizedDescriptions = faceapi.resizeResults(fullFaceDescriptions, imageSize)

    // console.log(logDesc ? resizedDescriptions : 'Description logging disabled')

    Object.keys(peopleStats).forEach((key) => { (key == 'ageArray' || key == 'youngest') ? null : peopleStats[key] = 0 });
    let totalConfidence = 0;

    peopleStats.ageArray = [];

    for (var i=0; i<resizedDescriptions.length; i++) {
      peopleStats.people++;
      (resizedDescriptions[i].age > peopleStats.oldest) ? peopleStats.oldest = resizedDescriptions[i].age : 0;
      (resizedDescriptions[i].age <= peopleStats.youngest) ? peopleStats.youngest = resizedDescriptions[i].age : 0;
      (resizedDescriptions[i].gender === 'male') ? peopleStats.male++ : peopleStats.female++
      totalConfidence += resizedDescriptions[i].detection._score;
      peopleStats[pickHighest(resizedDescriptions[i].expressions)]++
    }


    document.getElementById("peopleOutput").innerHTML = (peopleStats.people === 1) ? '1 person.' : peopleStats.people+' people.'
    document.getElementById("confidenceOutput").innerHTML = ((Math.floor((totalConfidence / resizedDescriptions.length) * 100) / 100) || 0) + ' confidence.'

    document.getElementById("happyOutput").innerHTML = (peopleStats.happy === 1) ? '1 happy person.' : peopleStats.happy+' happy people.'
    document.getElementById("neutralOutput").innerHTML = (peopleStats.neutral === 1) ? '1 neutral person.' : peopleStats.neutral+' neutral people.'
    document.getElementById("sadOutput").innerHTML = (peopleStats.sad === 1) ? '1 sad person.' : peopleStats.sad+' sad people.'
    document.getElementById("angryOutput").innerHTML = (peopleStats.angry === 1) ? '1 angry person.' : peopleStats.angry+' angry people.'
    document.getElementById("disgustedOutput").innerHTML = (peopleStats.disgusted === 1) ? '1 disgusted person.' : peopleStats.disgusted+' disgusted people.'
    document.getElementById("fearfulOutput").innerHTML = (peopleStats.fearful === 1) ? '1 fearful person.' : peopleStats.fearful+' fearful people.'
    document.getElementById("surprisedOutput").innerHTML = (peopleStats.surprised === 1) ? '1 surprised person.' : peopleStats.surprised+' surprised people.'

    document.getElementById("ageOutput").innerHTML = Math.round(peopleStats.youngest) +'-'+ Math.round(peopleStats.oldest) + ' age range.'

    document.getElementById("maleOutput").innerHTML = (peopleStats.male === 1) ? '1 man.' : peopleStats.male+' men.'
    document.getElementById("femaleOutput").innerHTML = (peopleStats.surprised === 1) ? '1 woman.' : peopleStats.female+' women.'

    canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDescriptions)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDescriptions)
  }, updateInt)

  console.log("Completed")
}


// Output Function

const outputDiv = document.getElementById('textOutput')
const step = 10;

const output = async (textData, command) => {

  for (var i=0; i < textData.length; i++) {
    await writeLine(textData[i], command);
  }

}

const writeLine = async (text, command) => {
  let index = 0;

  // outputDiv.innerHTML += '<br>';
  if (command) {
    outputDiv.innerHTML += 'will@kali$/uni/unit7/I&S: '
  }

  return await new Promise(resolve => {
    var writeLineLoop = setInterval(() => {
      if (index < text.length) {
        outputDiv.innerHTML += text[index];
        index++;
      } else {
        outputDiv.innerHTML += '<br>';
        resolve();
        clearInterval(writeLineLoop);
      }
    }, step)
  })

}

const addLine = async (text, noLineBreak) => {
  // outputDiv.innerHTML += text;
  for (var i=0; i<text.length; i++) {
    outputDiv.innerHTML += text[i] + '<br>';
  }

  if (noLineBreak) {
    outputDiv.innerHTML = outputDiv.innerHTML.slice(0,-4);
  }

}

const pause = async (time) => {
  return await new Promise(res => {
    setTimeout(async _ => {res()}, time)
  })
}

const runScript = async () => {
  for (var i=0; i<scriptData.length; i++) {
    switch (scriptData[i].type) {
      case 'add':
        await addLine(scriptData[i].data)
        break;

      case 'output':
        await output(scriptData[i].data)
        break;

      case 'pause':
        await pause(scriptData[i].data)
        break;
    
      case 'rmBr':
        outputDiv.innerHTML = outputDiv.innerHTML.slice(0,-4);
        break;

      case 'pre':
        outputDiv.innerHTML += 'will@kali$/uni/unit7/I&S: ';
        break;

      default:
        break;
    }
  }
}

runScript();

// Camera Startup Function //

function startup() {
    video = document.getElementById('videoTest');
    canvas = document.getElementById('canvasTest');
    outputHolder = document.getElementById('outputHolder');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = streamObj = stream;
        video.play();
        console.log("Video play")
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth/width);
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

}  

function endStream() {
  streamObj.getTracks().forEach(function(track) {
    track.stop();
  });
}

// Button onclick Functions //

document.getElementById("btn0").onclick = function(){
  startup();
};

document.getElementById("btn1").onclick = function(){
  faceDect();
};

document.getElementById("btn2").onclick = function(){
  endStream();
};

document.getElementById("btn3").onclick = function(){
  location.reload(true);
};

document.getElementById("btn4").onclick = function(){
  startup();
  setTimeout(() => {faceDect();},500)
};

// $(document).ready(function(){
//   startup();
//   setTimeout(() => {faceDect();},500)
// })