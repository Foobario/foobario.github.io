class Metaball {
  constructor() {
    const size = Math.pow(Math.random(), 2);
    this.vel = p5.Vector.random2D().mult(5 * (1 - size) + 2);
    this.radius = 50 * size + 50;
    this.pos = new p5.Vector(random(this.radius, width - this.radius), random(this.radius, height - this.radius));
  }

  update() {
    this.pos.add(this.vel);

    if (this.pos.x < this.radius || this.pos.x > width  - this.radius) this.vel.x *= -1;
    if (this.pos.y < this.radius || this.pos.y > height - this.radius) this.vel.y *= -1;
  }
}
