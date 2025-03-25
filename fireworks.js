document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("fireworksCanvas");
    const ctx = canvas.getContext("2d");
  
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  
    function launchFirework() {
      const x = Math.random() * canvas.width;
      const startY = canvas.height;
      const targetY = Math.random() * canvas.height * 0.5;
      animateRocket(x, startY, targetY);
    }
  
    function animateRocket(x, startY, targetY) {
      let y = startY;
      const speed = 2;
      const trail = [];
  
      function step() {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        trail.push({ x, y });
        if (trail.length > 10) trail.shift();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.stroke();
  
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
  
        y -= speed;
        if (y <= targetY) {
          createExplosion(x, y);
        } else {
          requestAnimationFrame(step);
        }
      }
      step();
    }
  
    function createExplosion(x, y) {
      const particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: x,
          y: y,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 3 + 1,
          life: Math.random() * 60 + 80,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`
        });
      }
      animateExplosion(particles);
    }
  
    function animateExplosion(particles) {
      function step() {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        particles.forEach((p, index) => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.speed *= 0.98;
          p.life--;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          if (p.life <= 0) particles.splice(index, 1);
        });
  
        if (particles.length > 0) requestAnimationFrame(step);
      }
      step();
    }
  
    setInterval(launchFirework, 1200);
  });
  