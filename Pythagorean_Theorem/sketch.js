// Pythagorean tiling
// ==================
// This proof of the Pythagorean Theorem was first
// discovered by the Persian mathematician Al-Nayrizi.

function scalar(n, v) { return [n * v[0], n * v[1]]; }
function add(v, w) { return [v[0] + w[0], v[1] + w[1]]; }
function sub(v, w) { return [v[0] - w[0], v[1] - w[1]]; }
function dot(v, w) { return v[0] * w[0] + v[1] * w[1]; }
function nihil(v) { return v[0] == 0 && v[1] == 0; }
function slope(v) { return v[1] / v[0]; }
function vnorm(v) { return sqrt(dot(v, v)); }
function vdist(v, w) { return vnorm(sub(v, w)); }

function swap(v) { return [v[1], v[0]]; }
function swap_ray(r) { return [swap(r[0]), swap(r[1])]; }
function ray(from, to) { return [from, sub(to, from)]; }
function ray_at(t, r) { return add(r[0], scalar(t, r[1])); }
function lin_at(x, l) { return l[0] + x*l[1]; }
function center(r) { return ray_at(0.5, r); }
function center_poly(p) { return scalar(1/p.length, p.reduce(add, [0, 0])); }
function translate_poly(d, p) { return p.map(v => add(v, d)); }

// Compute vertices of
// a rectangular polygon.
function rect_to_poly(r) {
  return [r[0], add(r[0], [r[1][0], 0]),
    add(r[0], r[1]), add(r[0], [0, r[1][1]])];
}

// Compute the coefficients of a
// linear formula through a ray.
function ray_to_lin(r) {
  let d = slope(r[1]);
  let c = r[0][1] - d*r[0][0];
  return [c, d];
}

// Compute intersection between
// linear formulas or return null.
function isect_lin(f, g) {
  let d = g[1] - f[1];
  return d == 0 ? null : (f[0] - g[0]) / d;
}

// Compute intersection between
// rays as point on the first ray
// or return null.
function isect_ray(r, s) {
  if (nihil(r[1]) || nihil(s[1])) return null;
  if (r[1][0] != 0) {
    if (s[1][0] != 0) {
      let f = ray_to_lin(r);
      let g = ray_to_lin(s);
      let x = isect_lin(f, g);
      return x == null ? null : (x - r[0][0]) / r[1][0];
    } else {
      let x = s[0][0];
      return (x - r[0][0]) / r[1][0];
    }
  } else {
    if (s[1][1] != 0) {
      let f = ray_to_lin(swap_ray(r));
      let g = ray_to_lin(swap_ray(s));
      let y = isect_lin(f, g);
      return y == null ? null : (y - r[0][1]) / r[1][1];
    } else {
      let y = s[0][1];
      return (y - r[0][1]) / r[1][1];
    }
  }
}

// Cut polygon using a ray.
function cut_poly(r, p) {
  let q = [[], []];
  let qi = 0;
  let eps = 0.001;
  let prev = null;
  for (let i = 0; i < p.length; i++) {
    q[qi].push(p[i]);
    let j = (i + 1) % p.length;
    let line = ray(p[i], p[j]);
    let t = isect_ray(line, r);
    if (t != null && t >= 0 && t <= 1) {
      let v = ray_at(t, line);
      // Ignore if this point is very close
      // to the previous intersection.
      if (prev == null || vdist(v, prev) > eps) {
        q[qi].push(v);
        qi = 1 - qi;
        q[qi].push(v);
        prev = v;
      }
    }
  }
  // If we have not switched back to
  // the first polygon by the end, then
  // the number of intersections is odd.
  // We resort to ignoring the intersections.
  return qi == 0 ? q : [p, []];
}

// Compute intersection points
// between a ray and a polygon.
function isect_poly(r, p) {
  let points = [];
  for (let i = 0; i < p.length; i++) {
    let j = (i + 1) % p.length;
    let line = ray(p[i], p[j]);
    let t = isect_ray(line, r);
    if (t != null && t >= 0 && t <= 1) {
      points.push(ray_at(t, line));
    }
  }
  return points;
}

// Compute intersection line
// of a ray through a polygon
// or return null.
function isect_poly_line(r, p) {
  let ps = isect_poly(r, p);
  if (ps.length == 0) return null;
  if (ps.length == 1) return ray(ps[0], [0, 0]);
  // Ad-hoc solution for duplicate intersections:
  // use first and last points.
  return ray(ps[0], ps[ps.length - 1]);
}

// Draw ray section [0, 1] as line.
function draw_ray(r) {
  let v = add(r[0], r[1]);
  line(r[0][0], r[0][1], v[0], v[1]);
}

// Draw ray as rectangle.
function draw_rect(r) {
  rect(r[0][0], r[0][1], r[1][0], r[1][1]);
}

// Draw points as polygon.
function draw_poly(p) {
  beginShape();
  for (let v of p) {
    vertex(v[0], v[1]);
  }
  endShape(CLOSE);
}

let a = 120;
let b = 90;
let a_fill = 'rgba(0, 0, 0, 0.03)';
let b_fill = 'rgba(0, 0, 0, 0.12)';

let fig_w = 800;
let fig_h = 600;
let fig = [[0, 0], [fig_w, fig_h]];

let canvas;
let interact = true;

// Determine if a rectangle is inside the figure.
function rect_in_fig(r) {
  let in_x = r[0][0] + r[1][0] > 0 && r[0][0] < fig_w;
  let in_y = r[0][1] + r[1][1] > 0 && r[1][1] < fig_h;
  return in_x && in_y;
}

function setup() {
  canvas = createCanvas(fig_w, fig_h);
  noLoop();
}

function mouseMoved() {
  if (interact) {
    redraw();
  }
}

function mouseDragged() {
  if (mouseButton == LEFT && !keyIsDown(17)) {
    a = max(50, a + movedX / 5);
    b = max(50, b + movedY / 5);
    interact = true;
    redraw();
  }
}

function mousePressed() {
  if (mouseButton == CENTER || keyIsDown(17)) {
    interact = !interact;
    redraw();
  }
}

function draw() {
  background(255);

  // Compute background tiling. We compute tile positions
  // in diagonal lines such that each next rectangle
  // has a smaller x, and a larger y coordinate.
  // This reaches all tiles in the viewport.
  let pattern = [
    [a, 0, a_fill, []],
    [b, a, b_fill, []]
  ];
  for (let tile_set of pattern) {
    let side = tile_set[0];
    let x = tile_set[1];
    let y = 0;
    while (true) {
      let tiles = [];
      let xx = x;
      let yy = y;
      // Find diagonal start.
      while (yy + side > 0) {
        xx = xx + b;
        yy = yy - a;
      }
      // Add all tiles on diagonal.
      while (yy < fig_h && xx + side > 0) {
        tiles.push([[xx, yy], [side, side]]);
        xx = xx - b;
        yy = yy + a;
      }
      // Remove tiles outside the figure.
      tiles = tiles.filter(rect_in_fig);
      // Break if all tiles are filtered.
      if (tiles.length == 0) break;
      // Store tiles and move diagonal.
      tile_set[3].push(...tiles);
      x = x + a + b;
      y = y + b - a;
    }
  }

  // Draw background tiling.
  for (let tile_set of pattern) {
    fill(tile_set[2]);
    stroke(0);
    strokeWeight(0.3);
    for (let r of tile_set[3]) {
      draw_rect(r);
    }
  }

  // Compute cutting rays.
  let d1 = [a, b];
  let d2 = [-b, a];
  let c = [mouseX, mouseY];
  let v = sub(c, scalar(0.5, add(d1, d2)));
  let cuts = [[v, d1], [v, d2], [add(v, d1), d2], [add(v, d2), d1]];

  // Determine nearest A and B tile.
  let parts = [];
  let tiles = [];
  for (let tile_set of pattern) {
    let min_d = -1;
    let min_r = null;
    for (let r of tile_set[3]) {
      let d = vdist(c, center(r));
      if (min_d < 0 || d < min_d) {
        min_d = d;
        min_r = r;
      }
    }
    tiles.push(min_r);
    parts.push(rect_to_poly(min_r));
  }

  // Cut parts.
  for (let cut of cuts) {
    let n = parts.length;
    for (let i = 0; i < n; i++) {
      let result = cut_poly(cut, parts[i]);
      if (result[1].length > 0) {
        parts[i] = result[0];
        parts.push(result[1]);
      }
    }
  }

  // Move parts into cutting square.
  let moves = [
    [b, -a], [-b, a], [-a, -b], [a, b],
    [b - a, -a - b], [b + a, -a + b],
    [-b - a, a - b], [-b + a, a + b]
  ];
  for (let i = 0; i < parts.length; i++) {
    // Check if any of the moves brings
    // the segment closer to the center.
    let p = parts[i];
    let p_center = center_poly(p);
    let min_dist = vdist(c, p_center);
    let min_move = null;
    for (let move of moves) {
      let dist = vdist(c, add(p_center, move));
      if (dist < min_dist) {
        min_dist = dist;
        min_move = move;
      }
    }
    parts[i] = [p];
    if (min_move != null) {
      let q = translate_poly(min_move, p);
      parts[i].push(q);
    }
  }

  // Draw segments.
  stroke(0);
  strokeWeight(0.3);
  colorMode(HSB, 1);
  let n = parts.length;
  for (let i = 0; i < n; i++) {
    fill(i / n, 0.4, 0.95);
    for (let p of parts[i]) {
      draw_poly(p);
    }
  }

  // Stroke original tiles again.
  noFill();
  for (let params of [[1, 4], [0, 2]]) {
    stroke(params[0]);
    strokeWeight(params[1]);
    for (let tile of tiles) {
      draw_rect(tile);
    }
  }

  // Draw cutting rays.
  stroke(0);
  strokeWeight(1.5);
  let frame = rect_to_poly(fig);
  for (let i = 0; i < 4; i++) {
    let r = isect_poly_line(cuts[i], frame);
    if (r != null) draw_ray(r);
  }
}

