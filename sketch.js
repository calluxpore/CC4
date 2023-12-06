let quoteData;
let lastFetchTime;
let myFont;
let listOfColors = ["#9b2226", "#ae2012", "#bb3e03", "#ca6702", "#ee9b00", "#eeb300", "#e9d8a6", "#94d2bd", "#0a9396", "#005f73"];
let fr = 60;
let slider;
let video;
let grid;
let videoReady = false;
let canvas2D, canvas3D;

function preload() {
  myFont = loadFont('Atkinson-Hyperlegible-Regular-102.ttf');
}

function fetchQuote() {
  lastFetchTime = millis();
  let url = 'https://api.quotable.io/random';
  loadJSON(url, processQuote);
}

function setup() {
  // Create a 2D canvas for text and 2D elements
  canvas2D = createCanvas(windowWidth, windowHeight);
  canvas2D.position(0, 0);

  // Create a WEBGL canvas for 3D elements
  canvas3D = createGraphics(windowWidth, windowHeight, WEBGL);
  
  frameRate(fr);
  textFont(myFont);
  textSize(32);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  slider = createSlider(10, 60, 30, 1);
  slider.position(10, 10);
  slider.style('width', '150px');

  video = createCapture(VIDEO, function() {
    console.log('Video is ready');
    videoReady = true;
  });
  video.size(canvas3D.width, canvas3D.height);
  video.hide();

  grid = new CircleGrid();

  fetchQuote();
  setInterval(fetchQuote, 30000);
}

function draw() {
  background(0);
  //clear();
  if (videoReady) {
    canvas3D.push();
    canvas3D.translate(-canvas3D.width / 2, -canvas3D.height / 2);
    grid.display();
    canvas3D.pop();
  } else {
    console.log("Waiting for video...");
  }

  // Display the WEBGL canvas onto the main canvas
  image(canvas3D, 0, 0);

  // Draw the 2D elements (quote box and text)
  if (quoteData) {
    displayQuote();
  }
}

function fetchQuote() {
  lastFetchTime = millis();
  let url = 'https://api.quotable.io/random';
  loadJSON(url, processQuote);
}

function processQuote(data) {
  quoteData = data;
}


function displayQuote() {
  if (quoteData) {
    textSize(32);
    textAlign(LEFT, TOP);
    const padding = 20;
    const lineHeight = 40;
    const quoteText = quoteData.content;
    const author = "- " + quoteData.author;
    const textBoxWidth = width - 2 * padding;

    let lines = splitQuoteIntoLines(quoteText, textBoxWidth);
    let textBoxHeight = (lines.length + 2) * lineHeight + padding * 2;

    const textBoxY = height - textBoxHeight;
    const cornerRadius = 20;

    stroke('#FFFFFF');
    fill(0);
    rect(0, textBoxY, width, textBoxHeight, cornerRadius);
    noStroke();
    let currentY = textBoxY + padding;
    for (let line of lines) {
      let words = line.split(" ");
      let currentX = width / 2 - textWidth(line) / 2;
      for (let i = 0; i < words.length; i++) {
        let word = words[i] + " ";
        fill(listOfColors[i % listOfColors.length]);
        text(word, currentX, currentY);
        currentX += textWidth(word);
      }
      currentY += lineHeight;
    }

    textAlign(CENTER, TOP);
    fill(255);
    text(author, width / 2, currentY + lineHeight);
  }
}

function splitQuoteIntoLines(quote, maxWidth) {
  let words = quote.split(" ");
  let lines = [];
  let currentLine = "";
  
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let testLine = currentLine + word + " ";
    let metrics = textWidth(testLine);
    
    if (metrics > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  return lines;
}

class CircleClass {
  constructor(px, py, s) {
    this.positionX = px;
    this.positionY = py;
    this.size = s;
    this.c = listOfColors[int(random(0, listOfColors.length))];
  }

  display() {
    circle(this.positionX, this.positionY, this.size);
    if (this.size > 15) {
      noStroke();
      fill(this.c);
    } else {
      noFill();
      strokeWeight(1);
      stroke(this.c);
    }
  }
}

class CircleGrid {
  constructor() {
    this.gridSize = 30;
    this.circles = [];
    this.initializeGrid();
  }

  initializeGrid() {
    for (let y = 0; y < height; y += this.gridSize) {
      let row = [];
      for (let x = 0; x < width; x += this.gridSize) {
        row.push(new CircleClass(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2));
      }
      this.circles.push(row);
    }
  }

  display() {
    if (videoReady) {
      video.loadPixels();
      this.updateCircles();
    }

    for (let row of this.circles) {
      for (let circle of row) {
        circle.display();
      }
    }
  }

  updateCircles() {
    this.gridSlider = slider.value();

    for (let i = 0; i < this.circles.length; i++) {
      for (let j = 0; j < this.circles[i].length; j++) {
        let x = j * this.gridSize;
        let y = i * this.gridSize;
        let index = (y * video.width + x) * 4;
        if (index < video.pixels.length) {
          let r = video.pixels[index];
          if (typeof r === 'number') {
            let dia = map(r, 0, 255, this.gridSlider, 2);
            this.circles[i][j].size = dia;
          }
        }
      }
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('myCanvas', 'png');
  }
}
