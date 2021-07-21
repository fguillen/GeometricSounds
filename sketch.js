let polygons;
let numPolygons = 6;
let speed = 0.8;
let pointAnimations;

function setup() {
  createCanvas(400, 400);
  pointAnimations = [];
  polygons = [];

  for (let index = 0; index < numPolygons; index++) {
    colorMode(HSB, numPolygons);
    let x = width / 2;
    let y = height / 2;
    let radius = (index  + 1) * 20;
    let numSides = index + 3
    let _color = color(index, numPolygons / 2, 100)
    let sound = loadSound("assets/dong.wav");
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
    polygon.draw();
    polygon.drawPointAt(frameCount * speed);
  });
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

    this.pointAnimations = [];

    console.log("sideLength", this.sideLength);
  }

  calculateVertexes(){
    let vertexes = [];
    let angle = TWO_PI / this.num_sides;
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = this.x + cos(a) * this.radius;
      let sy = this.y + sin(a) * this.radius;
      vertexes.push(createVector(sx, sy, 0))
    }

    return vertexes;
  }

  // From here: https://www.mathopenref.com/polygonsides.html
  calculateSideLength() {
    push();
    angleMode(DEGREES);
    let sideLength = this.radius * 2 * sin(180 / this.num_sides);;
    angleMode(RADIANS);
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

  drawPointAnimations() {
    this.pointAnimations.forEach(pointAnimation => {
      pointAnimation.draw();
    });

    this.pointAnimations = this.pointAnimations.filter(pointAnimation => !pointAnimation.isFinished());
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

  draw() {
    this.drawPolygon();
    this.drawPointAnimations();
  }


  vertexImpact(x, y){
    if(this.soundActive)
      this.sound.play();

    this.pointAnimations.push(new PointAnimation(x, y, this.color));
    console.log("PointAnimations.length: " + this.pointAnimations.length)
  }
}

class PointAnimation {
  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.step = 0;
    this.numSteps = 10;
    this.maxSize = 30;

    console.log("PointAnimation.new");
  }

  draw() {
    let alpha = map(this.step, 0, this.numSteps, 255, 0);
    this.color.setAlpha(alpha);
    fill(this.color);
    let radius = map(this.step, 0, this.numSteps, this.maxSize, 0);
    circle(this.x, this. y, radius);
    this.step += 0.5;

    console.log("draw(), step: " + this.step + ", radius: " + radius + ", alpha: " + alpha);
  }

  isFinished() {
    return this.step >= this.numSteps
  }
}
