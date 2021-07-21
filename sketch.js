let polygons;
let numPolygons = 6;

function setup() {
  createCanvas(720, 400);

  polygons = [];


  for (let index = 0; index < numPolygons; index++) {
    colorMode(HSB, numPolygons);
    let x = width / 2;
    let y = height / 2;
    let radius = (index  + 1) * 20;
    let numSides = index + 3
    let _color = color(index, numPolygons / 2, 100)
    let sound = loadSound("assets/dong.wav");
    let soundRate = map(index, 0, numPolygons, 0.8, 2);
    sound.rate(soundRate);

    polygon = new Figure(x, y, radius, numSides, _color, sound);
    polygons.push(polygon);
  }


}

function draw() {
  background(0);
  polygons.forEach(polygon => {
    polygon.draw();
    polygon.draw_point_at(frameCount);
  });
}

class Figure {
  constructor(x, y, radius, num_sides, color, sound) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.num_sides = num_sides;
    this.color = color;
    this.sound = sound;
    this.sound

    this.vertexes = this.calculateVertexes();
    this.sideLength = this.calculateSideLength();
    this.perimeterLength = this.sideLength * this.num_sides;

    this.pointActualVertex = this.vertexes[0];

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

  draw_point_at(step) {
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
      this.vertexImpact();
      this.pointActualVertex = vertexA;
    }
  }

  draw() {
    noFill();
    stroke(this.color);
    beginShape();
    this.vertexes.forEach(actual_vertex => {
      vertex(actual_vertex.x, actual_vertex.y);
    });
    endShape(CLOSE);
  }

  vertexImpact(){
    this.sound.play();
  }
}
