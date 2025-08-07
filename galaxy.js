// galaxy.js

(function () {
  // Create and insert the canvas as full screen background
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none"; // so it won't block clicks
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let width, height, stars;

  // Star object
  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.1 + 0.3;
      this.alpha = Math.random();
      this.alphaChange = 0.005 + Math.random() * 0.01;
      this.moveX = (Math.random() - 0.5) * 0.2;
      this.moveY = (Math.random() - 0.5) * 0.2;
    }
    update() {
      this.x += this.moveX;
      this.y += this.moveY;

      if (this.x < 0 || this.x > width) this.moveX = -this.moveX;
      if (this.y < 0 || this.y > height) this.moveY = -this.moveY;

      this.alpha += this.alphaChange;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.alphaChange = -this.alphaChange;
      } else if (this.alpha >= 1) {
        this.alpha = 1;
        this.alphaChange = -this.alphaChange;
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.shadowColor = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.shadowBlur = 5;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Initialize stars
  function initStars() {
    stars = [];
    const numStars = Math.floor((width * height) / 8000); // density
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }
  }

  // Draw connecting lines between close stars
  function drawLines(ctx, stars) {
    const maxDistance = 100;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDistance) {
          const lineAlpha = 1 - dist / maxDistance;
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Resize canvas and reset stars
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    initStars();
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw stars
    stars.forEach((star) => {
      star.update();
      star.draw(ctx);
    });

    // Draw connecting lines
    drawLines(ctx, stars);

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);

  // Initialize on DOM ready
  window.addEventListener("DOMContentLoaded", () => {
    resize();
    animate();
  });
})();
