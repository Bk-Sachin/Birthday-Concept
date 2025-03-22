document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('.birthday-text span[data-firework]');
    const fireworksContainer = document.querySelector('.fireworks');
    let resizeTimeout;
    let activeFireworks = new Set();
    const maxFireworks = 20; // Maximum fireworks allowed
  
    // Initialize letter animations and hover events
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.animation = 'float 2s ease-out infinite, colorChange 8s linear infinite';
        span.addEventListener('mouseover', () => {
          const translateZ = window.innerWidth <= 768 ? '25px' : '50px';
          span.style.transform = `translateZ(${translateZ}) rotateX(10deg)`;
          span.style.transition = 'transform 0.3s ease';
          span.style.filter = 'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.8))';
          if (activeFireworks.size < maxFireworks) {
            // Create 3 fireworks per hover
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                createFireworkFromLetter(span);
              }, i * 150);
            }
          }
        });
        span.addEventListener('mouseout', () => {
          span.style.transform = 'translateZ(0) rotateX(0)';
          span.style.filter = 'drop-shadow(0 0 2px rgba(255,255,255,0.5))';
        });
      }, index * 150);
    });
  
    function createFirework(x) {
      if (activeFireworks.size >= maxFireworks) return;
  
      // Create a firework container (for the trail)
      const firework = document.createElement('div');
      firework.className = 'firework';
  
      // Randomly choose a vertical starting position:
      // Approximately half will launch from the bottom ("0vh") and half from higher up (between 50vh and 100vh)
      let randomBottom = Math.random() < 0.5
        ? "0vh"
        : Math.floor(Math.random() * 50 + 50) + "vh";
      firework.style.bottom = randomBottom;
  
      // Create and append the trail element
      const trail = document.createElement('div');
      trail.className = 'trail';
      firework.appendChild(trail);
  
      // Create the explosion element separately (it will be detached later)
      const explosion = document.createElement('div');
      explosion.className = 'explosion';
  
      // Create particles inside explosion
      const numParticles = Math.floor(Math.random() * 8) + 16; // 16-24 particles
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (360 / numParticles) * i;
        const distance = Math.floor(Math.random() * 40) + 100 + 'px';
        particle.style.setProperty('--angle', `${angle}deg`);
        particle.style.setProperty('--distance', distance);
        explosion.appendChild(particle);
      }
  
      // Append the firework container to the fireworks container
      fireworksContainer.appendChild(firework);
      activeFireworks.add(firework);
  
      // Set random horizontal position
      const minX = 5, maxX = 95;
      const randomX = x || (minX + Math.random() * (maxX - minX));
      firework.style.left = `${randomX}%`;
  
      // Choose a random vibrant color and apply to firework and explosion
      const colors = [
        '#ff3366', '#33ff66', '#3366ff', '#ff33ff', '#ffff33',
        '#ff6600', '#00ffff', '#ff0099', '#99ff00', '#ff0033',
        '#66ff33', '#3399ff', '#ff66ff', '#ffff66'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      firework.style.setProperty('--neon-color', color);
      explosion.style.setProperty('--neon-color', color);
  
      const launchDuration = 1500; // Launch duration (ms)
  
      // After launch, detach explosion from firework so it's not affected by firework scaling
      setTimeout(() => {
        if (fireworksContainer.contains(firework)) {
          const rect = firework.getBoundingClientRect();
          const containerRect = fireworksContainer.getBoundingClientRect();
          // Compute explosion position relative to container
          const explosionLeft = rect.left - containerRect.left + rect.width / 2;
          const explosionTop = rect.top - containerRect.top;
          explosion.style.left = `${explosionLeft}px`;
          explosion.style.top = `${explosionTop}px`;
          explosion.style.position = 'absolute';
          // Append explosion directly to the container and trigger its animation
          fireworksContainer.appendChild(explosion);
          explosion.classList.add('exploding');
        }
      }, launchDuration);
  
      // Remove firework and explosion after explosion animation completes
      setTimeout(() => {
        if (fireworksContainer.contains(firework)) {
          firework.remove();
          activeFireworks.delete(firework);
        }
        if (fireworksContainer.contains(explosion)) {
          explosion.remove();
        }
      }, launchDuration + 1600);
    }
  
    function createFireworkFromLetter(letter) {
      if (activeFireworks.size >= maxFireworks) return;
      const rect = letter.getBoundingClientRect();
      const containerRect = fireworksContainer.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) - containerRect.left) / containerRect.width * 100;
      createFirework(Math.max(5, Math.min(95, x)));
    }
  
    // Clear fireworks on window resize
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        activeFireworks.forEach(firework => {
          if (fireworksContainer.contains(firework)) {
            firework.remove();
          }
        });
        activeFireworks.clear();
      }, 150);
    }
  
    window.addEventListener('resize', handleResize);
  
    // Create initial fireworks
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createFirework();
      }, i * 400);
    }
  
    // Create random fireworks periodically
    let fireworkInterval = setInterval(() => {
      if (document.hidden || activeFireworks.size >= maxFireworks) return;
      const count = Math.floor(Math.random() * 2) + 2; // 2-3 fireworks
      for (let i = 0; i < count; i++) {
        setTimeout(() => createFirework(), i * 150);
      }
    }, window.innerWidth <= 768 ? 1500 : 1000);
  
    // Pause fireworks when the page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(fireworkInterval);
        activeFireworks.forEach(firework => {
          if (fireworksContainer.contains(firework)) {
            firework.remove();
          }
        });
        activeFireworks.clear();
      } else {
        fireworkInterval = setInterval(() => {
          if (activeFireworks.size >= maxFireworks) return;
          const count = Math.floor(Math.random() * 2) + 2;
          for (let i = 0; i < count; i++) {
            setTimeout(() => createFirework(), i * 150);
          }
        }, window.innerWidth <= 768 ? 1500 : 1000);
      }
    });
  });
  