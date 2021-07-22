let numPolygons = 6;
let paused = false;
let cycleTime = 14;
let step = 0;
let iconPause;
let iconPlay;
let myDeltaTime = 0;

function preload() {
  iconPause = loadImage("assets/pause.png");
  iconPlay = loadImage("assets/play.png");
}

function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent("canvas-container")

  for (let index = 0; index < numPolygons; index++) {
    createPolygon(index, numPolygons);
  }

  iconPause.loadPixels();
  iconPlay.loadPixels();

  // start paused
  pauseToggle();
  // noLoop();
}

function createPolygon(index, numPolygons) {
  let x = width / 2;
  let y = height / 2;
  let radius = (index  + 1) * 20;
  let numSides = index + 3

  push();
  colorMode(HSB, numPolygons);
  let _color = color(index, numPolygons / 2, 100)
  pop();

  let sound = loadSound("./assets/dong.wav");
  let soundRate = map(index, 0, numPolygons, 0.8, 1.5);
  sound.rate(soundRate);

  let dotTime =  ((index + 1) / numPolygons) * cycleTime;

  new Polygon(x, y, radius, numSides, _color, sound, dotTime);
}

function draw() {
  step += deltaTime;
  background(0);

  Polygon.drawAll(step);
  VertexImpactAnimation.draAll();

  drawPlayButton();
}

function drawPlayButton() {
  let speaker = speakerImage();
  tint(255, 255, 255, 100);
  image(speaker, width - 50, height - 50, speaker.width / 3, speaker.height / 3);
}

function pauseToggle() {
  paused = !paused;

  if(paused) {
    noLoop();
  } else {
    loop();
    deltaTime = 0;
  }
}

function keyPressed() {
  if (keyCode === 32) {
    pauseToggle();
  }
}

function mouseClicked() {
  pauseToggle();
}



function speakerImage() {
  if(paused)
    return iconPlay;
  else
    return iconPause;
}

class Polygon {
  static all = [];
  static dotRadius = 8;

  constructor(x, y, radius, num_sides, color, sound, dotTime) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.num_sides = num_sides;
    this.color = color;
    this.sound = sound;
    this.dotTime = dotTime;

    this.vertexes = this.calculateVertexes();
    this.sideLength = this.calculateSideLength();
    this.perimeterLength = this.sideLength * this.num_sides;

    this.dotActualVertex = this.vertexes[0];
    this.dotSpeed = this.perimeterLength / this.dotTime;

    Polygon.all.push(this);

    // console.log("perimeterLength: " + this.perimeterLength);
    // console.log("dotSpeed: " + this.dotSpeed);
    // console.log("sideLength", this.sideLength);
  }

  static drawAll(step) {
    Polygon.all.forEach(polygon => {
      polygon.draw(step);
    });
  }

  calculateVertexes(){
    push();
    angleMode(RADIANS);
    let vertexes = [];
    let angle = (TWO_PI / this.num_sides);
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = this.x + (cos(a) * this.radius);
      let sy = this.y + (sin(a) * this.radius);
      vertexes.push(createVector(sx, sy, 0))
    }
    pop();

    return vertexes;
  }

  // From here: https://www.mathopenref.com/polygonsides.html
  calculateSideLength() {
    push();
    angleMode(DEGREES);
    let sideLength = this.radius * 2 * sin(180 / this.num_sides);;
    pop();

    return sideLength;
  }

  drawDotAt(step) {
    // Messy stuff to calculate the position of the Dot
    // Basically is figuring out in which side of the Polygon the dot should be
    // and lerping among the both vertexes
    step = (step / 1000) * this.dotSpeed;
    let truncatedStep = step % this.perimeterLength;
    let actualSideIndex = floor(truncatedStep / this.sideLength);
    let stepOnSide = step % this.sideLength;
    let normalizedStepOnSide = map(stepOnSide, 0, this.sideLength, 0, 1);
    let vertexA = this.vertexes[actualSideIndex];
    let vertexB = this.vertexes[(actualSideIndex + 1) % this.vertexes.length];
    let dotPosition = p5.Vector.lerp(vertexA, vertexB, normalizedStepOnSide);

    // Draw the Dot
    push();
    fill(this.color);
    noStroke();
    circle(dotPosition.x, dotPosition.y, Polygon.dotRadius);
    pop();

    // When origin Vertex changed we trigger a VertexImpactAnimation
    if(vertexA != this.dotActualVertex){
      this.vertexImpact(dotPosition.x, dotPosition.y);
      this.dotActualVertex = vertexA;
    }
  }

  drawPolygon() {
    push();
    noFill();
    stroke(this.color);
    beginShape();
    this.vertexes.forEach(actual_vertex => {
      vertex(actual_vertex.x, actual_vertex.y);
    });
    endShape(CLOSE);
    pop();
  }

  draw(step) {
    this.drawPolygon();
    this.drawDotAt(step)
  }

  vertexImpact(x, y){
    this.sound.play();

    new VertexImpactAnimation(x, y, color(this.color.toString()));
  }
}

class VertexImpactAnimation {
  static numSteps = 10;
  static maxSize = 20;
  static allAnimations = [];
  static speed = 0.3;

  static draAll() {
    VertexImpactAnimation.allAnimations.forEach(VertexImpactAnimation => {
      VertexImpactAnimation.draw();
    });
  }

  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.step = 0;

    VertexImpactAnimation.allAnimations.push(this);
  }

  draw() {
    push();
    let alpha = map(this.step, 0, VertexImpactAnimation.numSteps, 255, 100);
    this.color.setAlpha(alpha);
    fill(this.color);
    noStroke();
    let radius = map(this.step, 0, VertexImpactAnimation.numSteps, VertexImpactAnimation.maxSize, 0);
    circle(this.x, this. y, radius);
    this.step += VertexImpactAnimation.speed;

    // Remove the Animation if finished
    if(this.isFinished() ) {
      VertexImpactAnimation.allAnimations = VertexImpactAnimation.allAnimations.filter(e => e !== this);
    }

    // console.log("draw(), step: " + this.step + ", radius: " + radius + ", alpha: " + alpha + ", this.color: " + this.color);
    pop();
  }

  isFinished() {
    return this.step >= VertexImpactAnimation.numSteps
  }
}
