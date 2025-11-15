
// Base image
let baseImg; 

// Array of layer images
let layerImgs = []; 
let layerSegments = [];


//Audio
let song, analyser;
let audioLevel = 0;

//Screamer image size
let screamerBaseWidth, screamerBaseHeight;
let screamerBaseX, screamerBaseY;
// Point for scaling
const screamerPointX = 0.5;       
const screamerPointY = 0.7; 

// Angles for each layer's line
let layerAngles = [-10, 0, 90, 0, 90,90];
let numSegments = 90;

// Store the scaled size and position of the image so it always fits the canvas properly
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};



// Preload all the assets
function preload() {

  baseImg = loadImage('assets/Edvard_Munch_The_Scream.jpeg');  

  layerImgs[0] = loadImage('assets/firesky.png');
  layerImgs[1] = loadImage('assets/bluesky.png');
  layerImgs[2] = loadImage('assets/greensky.png');
  layerImgs[3] = loadImage('assets/bridge.png');
  layerImgs[4] = loadImage('assets/screamer.png');
  layerImgs[5] = loadImage('assets/couple.png');

  song = loadSound('assets/186093__yoh__screams-male-high-pitched.wav');
}



function setup() {
  // Make canvas the size of the browser window
  createCanvas(windowWidth, windowHeight);
  imgDrwPrps.aspect = baseImg.width / baseImg.height; 

  calculateImageDrawProps();
  for (let i = 0; i < layerImgs.length; i++) {
    if (i === 4) continue;

    let segArray = [];                         
    createSegmentsFromImage(layerImgs[i], segArray, i);
    layerSegments.push(segArray);              
  }

  // Compute where each segment should be drawn
  for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.calculateSegDrawProps();
    }
  }
  //Screamer size fit
  screamerBaseWidth = imgDrwPrps.width;
  screamerBaseHeight = imgDrwPrps.height;
  screamerBaseX = imgDrwPrps.xOffset;
  screamerBaseY = imgDrwPrps.yOffset;

  analyser = new p5.Amplitude();
  analyser.setInput(song);

  let button = createButton('Play/Pause');
  button.position(20, 20);
  button.style('background', 'rgba(231, 111, 12, 0.94)');
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('padding', '10px 20px');
  button.style('border-radius', '10px');
  button.style('font-size', '12px');
  button.mousePressed(playPause);
}



function draw() {
   background(0);

  // First draw the full base image
   image(
    baseImg,
    imgDrwPrps.xOffset,
    imgDrwPrps.yOffset,
    imgDrwPrps.width,
    imgDrwPrps.height
  );

    // Then draw all segment layers with animation
    for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.animate();
      segment.draw();
    }
  }
  // Get the current loudness of the audio
  let rms = analyser ? analyser.getLevel() : 0;
  // Skip super tiny volume so it doesn’t shake all the time
  let noiseFloor = 0.02;
  let level = max(0, rms - noiseFloor);
  // Easier to use for animation
  let t = level / 0.3;
  audioLevel = t;
  // Calculate how much to scale the screamer layer
  let scaleFactor = lerp(1.0, 2.8, t);
  // Base size * scale factor = new width/height
  let drawWidth = screamerBaseWidth * scaleFactor;
  let drawHeight = screamerBaseHeight * scaleFactor;

  let drawX =
    screamerBaseX +
    screamerBaseWidth * screamerPointX -
    drawWidth * screamerPointX;

  let drawY =
    screamerBaseY +
    screamerBaseHeight * screamerPointY -
    drawHeight * screamerPointY;

  // Maximum shake
  let maxScreamerShake = 50;               
  let shakeStrength = audioLevel;

  // Random left right offset based on volume
  let shakeX = random(-maxScreamerShake * shakeStrength, maxScreamerShake * shakeStrength);
  let shakeY = random(-10 * shakeStrength, 10 * shakeStrength);

  // Apply the shake to the position
  drawX += shakeX;
  drawY += shakeY;

  image(layerImgs[4], drawX, drawY, drawWidth, drawHeight);
} 

function playPause() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();   
  }
}


function windowResized() {
  // Resize the canvas to the new window size
  resizeCanvas(windowWidth, windowHeight);

  calculateImageDrawProps();
  for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.calculateSegDrawProps();
    }
  }

  screamerBaseWidth  = imgDrwPrps.width;
  screamerBaseHeight = imgDrwPrps.height;
  screamerBaseX = imgDrwPrps.xOffset;
  screamerBaseY = imgDrwPrps.yOffset;
}

// Split an image into many segments
function createSegmentsFromImage(srcImg, targetArray, layerIndex) {
  let segmentWidth = srcImg.width / numSegments;
  let segmentHeight = srcImg.height / numSegments;

  // We use nested loops to scan the image:
  let positionInColumn = 0;
  for (let segYPos = 0; segYPos < srcImg.height; segYPos += segmentHeight) {
    let positionInRow = 0;
    for (let segXPos = 0; segXPos < srcImg.width; segXPos += segmentWidth) {

      // Pick the colour at the center of this grid
      let segmentColour = srcImg.get(
        segXPos + segmentWidth / 2,
        segYPos + segmentHeight / 2
      );

      // Choose the line angle for this layer based on layerIndex
      let angleForThisLayer = layerAngles[layerIndex];

      let segment = new ImageSegment(
        positionInColumn,
        positionInRow,
        segmentColour,
        angleForThisLayer,
        layerIndex 
      );

      // Push this segment into the target array for this layer
      targetArray.push(segment);

      // Move to the next column in this row
      positionInRow++;
    }
    // Move to the next row after finishing this row
    positionInColumn++;
  }
}

// calculates how image should be scaled and positioned on the canvas
function calculateImageDrawProps() {
  let canvasAspectRatio = width / height;
  
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    imgDrwPrps.width = width;
    imgDrwPrps.height = width / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (height - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;

  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
   
    imgDrwPrps.height = height;
    imgDrwPrps.width = height * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (width - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  }
  else {
  
    imgDrwPrps.width = width;
    imgDrwPrps.height = height;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}

// This constructor stores the grid position, colour, angle, and layer information
class ImageSegment {

  constructor(
    columnPositionInPrm,
    rowPositionInPrm,
    srcImgSegColourInPrm,
    angleInPrm,
    layerIndexInPrm  
  ) {
    this.columnPosition = columnPositionInPrm;
    this.rowPosition = rowPositionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;
    this.angle = angleInPrm;
    this.layerIndex = layerIndexInPrm;

    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.currentY = 0;
    this.phase = random(TWO_PI);
  }

  // This function figures out each segment’s size and where it should go on the canvas
  calculateSegDrawProps() {
    this.drawWidth = imgDrwPrps.width / numSegments;
    this.drawHeight = imgDrwPrps.height / numSegments;
    
    this.drawXPos = this.rowPosition * this.drawWidth + imgDrwPrps.xOffset;
    this.drawYPos = this.columnPosition * this.drawHeight + imgDrwPrps.yOffset;

  }

  animate() {

  // We noticed that different computers draw frames at different speeds, so we use real time (millis) to keep the animation moving at a consistent speed on all devices
    let t = millis() / 1000.0;

  // Start each frame from the original position
  this.currentX = this.drawXPos;
  this.currentY = this.drawYPos;

  let maxShake = 40;                 
  let shake = audioLevel * maxShake; 

  // Layer 0 shake strongly with the audio
  if (this.layerIndex === 0) {

    let wavelength = 24.0;
    let k = TWO_PI / wavelength;    
    let speed = 1;   
    let amplitude = this.drawHeight * 0.7;  
    let phase = k * this.rowPosition - speed * t;
    let waveOffsetY = sin(phase) * amplitude;

    this.currentX = this.drawXPos;
    this.currentY = this.drawYPos + waveOffsetY;
    this.currentX += random(-shake, shake);
    this.currentY += random(-shake, shake);

    return; 
  }

  // Layer 2 shake a bit
  if (this.layerIndex === 2) {
    let speed = 2.5;              
    let amplitude = this.drawHeight;

    let waveOffset = sin(
      t * speed + this.rowPosition * 0.3 + this.phase
    ) * amplitude;

    this.currentY = this.drawYPos + waveOffset;
    let greenShake = shake * 0.3;
    this.currentX += random(-greenShake, greenShake);
    this.currentY += random(-greenShake, greenShake);
    return;
  }

  // Layer 1 shake a medium amount
  if (this.layerIndex === 1) {
    let speed = 3.0;
    let amplitude = this.drawWidth;

    let waveOffset = sin(
      t * speed + this.columnPosition * 0.3 + this.phase
    ) * amplitude;

    this.currentX = this.drawXPos + waveOffset;
    this.currentY = this.drawYPos;

    let blueShake = shake * 0.5;
    this.currentX += random(-blueShake, blueShake);
    this.currentY += random(-blueShake, blueShake);
    return;
  }
}

  // Draws out small line in the centre of each segment, using the correct angle and the animated position.
  draw() {
    stroke(this.srcImgSegColour);
    strokeWeight(3);

    // Find the centre of the segment
    let cx = this.currentX + this.drawWidth / 2;
    let cy = this.currentY + this.drawHeight / 2;

    // Decide how long the line should be
    let halfLen = min(this.drawWidth, this.drawHeight) * 0.5;
    let rad = this.angle * PI / 180;

    // Calculate direction
    let dx = cos(rad) * halfLen;
    let dy = sin(rad) * halfLen;

    // Calculate two endpoints of the line
    let x1 = cx - dx;
    let y1 = cy - dy;
    let x2 = cx + dx;
    let y2 = cy + dy;

    // Draw the line
    line(x1, y1, x2, y2);
  }
}

