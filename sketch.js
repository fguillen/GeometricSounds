let polygons;
let numPolygons = 6;
let speed = 0.8;
let paused = false;

function setup() {
  createCanvas(400, 400);
  polygons = [];

  for (let index = 0; index < numPolygons; index++) {

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
    let soundActive = true;

    polygon = new Figure(x, y, radius, numSides, _color, sound, soundActive);
    polygons.push(polygon);
  }
}

function draw() {
  background(0);
  polygons.forEach(polygon => {
    polygon.draw(frameCount * speed);
  });

  PointAnimation.draAll();
}

function pauseToggle() {
  paused = !paused;

  if(paused) {
    loop();
  } else {
    noLoop();
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

class Figure {
  constructor(x, y, radius, num_sides, color, sound, soundActive) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.num_sides = num_sides;
    this.color = color;
    this.sound = sound;
    this.soundActive = soundActive;

    this.vertexes = this.calculateVertexes();
    this.sideLength = this.calculateSideLength();
    this.perimeterLength = this.sideLength * this.num_sides;

    this.pointActualVertex = this.vertexes[0];

    console.log("sideLength", this.sideLength);
  }

  calculateVertexes(){
    push();
    angleMode(RADIANS);
    let vertexes = [];
    let angle = TWO_PI / this.num_sides;
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = this.x + cos(a) * this.radius;
      let sy = this.y + sin(a) * this.radius;
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

  drawPointAt(step) {
    let truncatedStep = step % this.perimeterLength;
    let actualSideIndex = floor(truncatedStep / this.sideLength);
    let stepInSide = step % this.sideLength;
    let normalizedStepInSide = map(stepInSide, 0, this.sideLength, 0, 1);
    let vertexA = this.vertexes[actualSideIndex];
    let vertexB = this.vertexes[(actualSideIndex + 1) % this.vertexes.length];
    // console.log("vertexA", vertexA);
    // console.log("vertexB", vertexB);
    // console.log("normalizedStepInSide", normalizedStepInSide);
    // console.log("stepInSide", stepInSide);
    let pointPosition = p5.Vector.lerp(vertexA, vertexB, normalizedStepInSide);
    fill(this.color);
    circle(pointPosition.x, pointPosition.y, 5);

    if(vertexA != this.pointActualVertex){
      this.vertexImpact(pointPosition.x, pointPosition.y);
      this.pointActualVertex = vertexA;
    }
  }

  drawPolygon() {
    noFill();
    stroke(this.color);
    beginShape();
    this.vertexes.forEach(actual_vertex => {
      vertex(actual_vertex.x, actual_vertex.y);
    });
    endShape(CLOSE);
  }

  draw(step) {
    this.drawPolygon();
    this.drawPointAt(step)
  }

  vertexImpact(x, y){
    if(this.soundActive)
      this.sound.play();

    new PointAnimation(x, y, color(this.color.toString()));
  }
}

class PointAnimation {
  static numSteps = 10;
  static maxSize = 20;
  static allAnimations = [];
  static speed = 0.3;

  static draAll() {
    PointAnimation.allAnimations.forEach(pointAnimation => {
      pointAnimation.draw();
    });
  }

  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.step = 0;

    PointAnimation.allAnimations.push(this);
    // console.log("PointAnimation.allAnimations.length: " + PointAnimation.allAnimations.length);
  }

  draw() {
    push();
    let alpha = map(this.step, 0, PointAnimation.numSteps, 255, 100);
    this.color.setAlpha(alpha);
    fill(this.color);
    stroke(this.color);
    let radius = map(this.step, 0, PointAnimation.numSteps, PointAnimation.maxSize, 0);
    circle(this.x, this. y, radius);
    this.step += PointAnimation.speed;

    // Remove the Animation if finished
    if(this.isFinished() ) {
      PointAnimation.allAnimations = PointAnimation.allAnimations.filter(e => e !== this);
    }

    console.log("draw(), step: " + this.step + ", radius: " + radius + ", alpha: " + alpha + ", this.color: " + this.color);
    pop();
  }

  isFinished() {
    return this.step >= PointAnimation.numSteps
  }
}
