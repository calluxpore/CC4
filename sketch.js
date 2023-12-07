// ChatGPT Attribution: This code was reviewed and commented by ChatGPT, an AI developed by OpenAI.
// Font Attribution: Atkinson Hyperlegible Font by the Braille Institute. Source: https://brailleinstitute.org/freefont
// API Attribution: Quotable API by Luke Peavey. Source: https://github.com/lukePeavey/quotable
// Inspiration/Reference: Work by Taylor Tidwell. YouTube Video: https://youtu.be/8g-DF9hKMgg and p5.js Sketch: https://editor.p5js.org/ttidwell24/sketches/q6on3p4oy
// Inspiration/Reference: Work by Jeff Thompson. YouTube Video: https://www.youtube.com/watch?v=exrH7tvt3f4


// Global variables for different functionalities
let quoteData; // Stores the fetched quote data
let lastFetchTime; // Records the time of the last fetch operation
let myFont; // Font used for text rendering
let listOfColors = [
  "#9b2226",
  "#ae2012",
  "#bb3e03",
  "#ca6702",
  "#ee9b00",
  "#eeb300",
  "#e9d8a6",
  "#94d2bd",
  "#0a9396",
  "#005f73",
];
let fr = 60; // Frame rate for the sketch
let slider; // Slider UI element
let video; // Video capture object
let grid; // Object representing a grid of circles
let videoReady = false; // Flag to check if video is ready
let canvas2D, canvas3D; // Two canvases for 2D and 3D graphics

// Preload function to load assets before the sketch starts
function preload() {
  myFont = loadFont("Atkinson-Hyperlegible-Regular-102.ttf");
}

function setup() {
  canvas2D = createCanvas(windowWidth, windowHeight);
  canvas2D.position(0, 0);
  canvas3D = createGraphics(windowWidth, windowHeight, WEBGL);

  frameRate(fr);
  textFont(myFont);
  textSize(32);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  slider = createSlider(10, 60, 30, 1);
  slider.position(10, 10);
  slider.style("width", "150px");

  video = createCapture(VIDEO, function () {
    console.log("Video is ready");
    videoReady = true;
  });
  video.size(canvas3D.width, canvas3D.height);
  video.hide();

  grid = new CircleGrid();

  fetchQuote();
  setInterval(fetchQuote, 30000);
}

function draw() {
  background(0, 50);
  if (videoReady) {
    canvas3D.push();
    canvas3D.translate(-canvas3D.width / 2, -canvas3D.height / 2);
    grid.display();
    canvas3D.pop();
  } else {
    console.log("Waiting for video...");
  }
  image(canvas3D, 0, 0);
  if (quoteData) {
    displayQuote();
  }
}

// Function to fetch a new quote
function fetchQuote() {
  lastFetchTime = millis();
  let url = "https://api.quotable.io/random";
  loadJSON(url, processQuote);
}

// Function to process the fetched quote
function processQuote(data) {
  quoteData = data;
}

function displayQuote() {
  if (quoteData) {
    // Drawing the quote text on canvas
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

    stroke("#FFFFFF");
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

// Utility function to split the quote into lines
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

// Classes for Circle and CircleGrid
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
  // Manages a grid of circles that respond to video input
  constructor() {
    this.gridSize = 30;
    this.circles = [];

    for (let y = 0; y < video.height; y += this.gridSize) {
      let row = [];
      for (let x = 0; x < video.width; x += this.gridSize) {
        row.push(new CircleClass(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2));
      }
      this.circles.push(row);
    }
  }

  display() {
    // Start of the mirroring effect
    push();//with the help of Kate Hartman (Mirror)
    translate(video.width, 0);
    scale(-1, 1);
  
    video.loadPixels();
    this.gridSlider = slider.value();
  
    for (let i = 0; i < this.circles.length; i++) {
      for (let j = 0; j < this.circles[i].length; j++) {
        let x = j * this.gridSize;
        let y = i * this.gridSize;
        let index = (y * video.width + x) * 4;
        let r = video.pixels[index];
        let dia = map(r, 0, 255, this.gridSlider, 2);
        this.circles[i][j].size = dia;
        this.circles[i][j].display();
      }
    }
  
    // End of the mirroring effect
    pop();
  
    // Randomly change color of one circle
    let randomRow = int(random(this.circles.length));
    let randomCol = int(random(this.circles[0].length));
    this.circles[randomRow][randomCol].c = listOfColors[int(random(0, listOfColors.length))];
  }
  
}

function keyPressed() {
  // Saves the canvas as an image when 's' key is pressed
  if (key === "s" || key === "S") {
    saveCanvas("myCanvas", "png");
  }
}