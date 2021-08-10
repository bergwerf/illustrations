let w = 600;
let h = 600;
let m = 100;
let n = 70;

let z = 5;
let bg = "#005"
let colors = ["#88f", "#ddf"];

function setup() {
  createCanvas(w, h);
  noLoop();
}

function setValues(mm, nn) {
  m = max(1, min(w / z, mm));
  n = max(1, min(h / z, nn));
  redraw();
}

function setFromMouse() {
  setValues(round(mouseX / z), round(mouseY / z));
}

function mousePressed() { setFromMouse(); }
function mouseDragged() { setFromMouse(); }

function keyPressed() {
  const delta = {
    [LEFT_ARROW]:  [-1,  0],
    [RIGHT_ARROW]: [ 1,  0],
    [UP_ARROW]:    [ 0, -1],
    [DOWN_ARROW]:  [ 0,  1],
  };
  let d = delta[keyCode] || [0, 0];
  setValues(m + d[0], n + d[1]);
}

function draw() {
  background(bg);
  scale(z);
  stroke(bg);
  strokeWeight(0.7/z);

  let pos = [0, 0];
  let dim = [m, n];
  let big = m > n ? 0 : 1;
  let c = 0;
  while (dim[1-big] > 0) {
    let k = dim[1-big];
    while (dim[big] >= k) {
      fill(colors[++c % 2]);
      rect(pos[0], pos[1], k, k);
      dim[big] -= k;
      pos[big] += k;
    }
    big = 1-big;
  }
}
