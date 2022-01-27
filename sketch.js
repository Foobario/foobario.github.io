let shMetaball;

const numMetaballs = 12;
const metaballs    = [];
const colors       = [];

function preload() {
  shMetaball = metaballShader(this._renderer);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(RGB,1.0);

  // create metaballs
  for (let i = 0; i < numMetaballs; i ++) {
    metaballs.push(new Metaball());
  }

  shader(shMetaball);
}

function draw() {
  // clear the li
  let mb = [];

  for (const ball of metaballs) {
    ball.update();
    mb.push(ball.pos.x, ball.pos.y, ball.radius);
  }

  shMetaball.setUniform("metaballs", mb);
  shMetaball.setUniform("colors", colors);
  shMetaball.setUniform("mouse", [mouseX, mouseY]);
  rect(0, 0, width, height);
}

function mouseWheel() { // stop the canvas from scrolling
  return false;
}

function metaballShader(_renderer) {
  let vert = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;

    varying vec2 vTexCoord;

    void main() {
      vTexCoord = aTexCoord;

      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

      gl_Position = positionVec4;
    }
  `;

  let frag = `
    precision highp float;
    precision highp int;

    varying vec2 vTexCoord;

    uniform vec3  metaballs[${numMetaballs}];
    uniform vec2  mouse;
    uniform float colors[${numMetaballs}];

    const float WIDTH  = ${windowWidth}.0;
    const float HEIGHT = ${windowHeight}.0;

    vec3 clr(float ang) {
      ang += 0.8;
      ang = ang * 2.0;
      return vec3(
        sin(ang + 0.00) * 0.5 + 0.5,
        sin(ang + 1.05) * 0.5 + 0.5,
        sin(ang + 2.10) * 0.5 + 0.5
      );
    }

    void main() {
      float x = vTexCoord.x * WIDTH;
      float y = vTexCoord.y * HEIGHT;
      float v = 0.0;

      for (int i = 0; i < ${numMetaballs}; i++) {
        vec3 ball = metaballs[i];
        float dx = 0.5 * (ball.x - x);
        float dy = 0.5 * (ball.y - y);
        float r = ball.z;
        v += r * r / (dx * dx + dy * dy);
      }

      if (v > 1.5) gl_FragColor = vec4(clr(min(v, 4.3)), 1.0);
      else         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `;

  return new p5.Shader(_renderer, vert, frag);
}
