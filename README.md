# Watching Diagram

## D-I-A-G-R-A-M
### Unit 7 - Information & Systems
---

## How it works

The code simply runs the webcam and every second analyses it for faces, this data is then converted to simple statistics.

It can also be used to log the data over a long period at intervals to gain extensive time based data.

### Loading in the pre-trained models

``` javascript
await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
await faceapi.loadFaceLandmarkModel(MODEL_URL)
await faceapi.loadFaceRecognitionModel(MODEL_URL)
await faceapi.loadFaceExpressionModel(MODEL_URL)
await faceapi.loadAgeGenderModel(MODEL_URL)
```

### Detect faces and resize for camera input

``` javascript
let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    resizedDescriptions = faceapi.resizeResults(fullFaceDescriptions, imageSize)
```

### Loop through found faces and build stats object

``` javascript
for (var i=0; i<resizedDescriptions.length; i++) {
  peopleStats.people++;
  (resizedDescriptions[i].age > peopleStats.oldest) ? peopleStats.oldest = resizedDescriptions[i].age : null;
  (resizedDescriptions[i].age < peopleStats.youngest) ? peopleStats.youngest = resizedDescriptions[i].age : null;
  (resizedDescriptions[i].gender === 'male') ? peopleStats.male++ : peopleStats.female++
  totalConfidence += resizedDescriptions[i].detection._score;
  peopleStats[pickHighest(resizedDescriptions[i].expressions)]++
}
```
---

## TODO:
- [x] Write code to run webcam stream to canvas
- [x] Implement face-api.js (Pre-trained model for face detection)
- [x] Implement expression detection
- [x] Convert array to explicit data
- [ ] Add logging function to git repo
- [ ] Build REST-API