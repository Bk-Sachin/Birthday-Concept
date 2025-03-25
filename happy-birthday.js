document.addEventListener("DOMContentLoaded", () => {
    const c = document.getElementById("birthdayCanvas");
    const ctx = c.getContext("2d");
  
    // Setup canvas dimensions with DPR handling
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      w = window.innerWidth;
      h = window.innerHeight;
      hw = w / 2;
      hh = h / 2;
    }
  
    let w, h, hw, hh;
    resizeCanvas();
  
    let lastResetTime = Date.now();
    const cycleDuration = 15000; // 15 seconds cycle
  
    // Spacing factors
    const letterSpacingFactor = 0.2;
    const lineHeightFactor = 1.2;
    let baseCharSize = Math.max(20, window.innerWidth * 0.03);
  
    // Slow factor (if needed, here we use 1 for normal speed)
    const slowFactor = 1.0;
    // New constant to slow the fade-out phase (set to 2 for double duration, for example)
    const fadeMultiplier = 2.0;
  
    // Animation options (time values multiplied by slowFactor)
    let opts = {
      strings: ["HAPPY", "BIRTHDAY!", "to You"],
      charSize: baseCharSize,
      lineHeight: baseCharSize * lineHeightFactor,
      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200 * slowFactor,
      fireworkBaseReachTime: 30 * slowFactor,
      fireworkAddedReachTime: 30 * slowFactor,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30 * slowFactor,
      fireworkCircleAddedTime: 30 * slowFactor,
      // Base fade times without multiplier
      fireworkCircleFadeBaseTime: 10 * slowFactor,
      fireworkCircleFadeAddedTime: 5 * slowFactor,
      fireworkBaseShards: 5,
      fireworkAddedShards: 5,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: 0.1,
      upFlow: -0.1,
      letterContemplatingWaitTime: 360 * slowFactor,
      balloonSpawnTime: 20 * slowFactor,
      balloonBaseInflateTime: 10 * slowFactor,
      balloonAddedInflateTime: 10 * slowFactor,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: 0.4,
      balloonAddedVel: 0.4,
      balloonBaseRadian: -(Math.PI / 2 - 0.5),
      balloonAddedRadian: -1,
    };
  
    ctx.font = `${opts.charSize}px Verdana`;
  
    let letters = []; // holds Letter objects
    const Tau = Math.PI * 2;
    const TauQuarter = Tau / 4;
  
    // ======================================
    // 1) Letter Constructor
    // ======================================
    function Letter(char, finalX, finalY) {
      this.char = char;
      // Final (target) position near center (in CSS pixels)
      this.finalX = finalX;
      this.finalY = finalY;
  
      // Start position: bottom of the screen (y = h)
      this.startX = finalX;
      this.startY = h;
  
      // Measure character width to center it
      const charWidth = ctx.measureText(char).width;
      this.dx = -charWidth / 2;
      this.dy = opts.charSize / 2;
  
      // Set a hue based on finalX
      let hue = ((finalX + 300) / 600) * 360;
      this.alphaColor = `hsla(${hue}, 80%, 50%, alp)`;
  
      // Initialize phase and parameters
      this.phase = "firework";
      this.tick = 0;
      this.spawned = false;
      this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
      this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
      this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
      this.prevPoints = [[this.startX, this.startY, 0]];
      this.shards = [];
    }
  
    // ======================================
    // 2) Letter Step (Animation)
    // ======================================
    Letter.prototype.step = function () {
      if (this.phase === "firework") {
        if (!this.spawned) {
          this.tick++;
          if (this.tick >= this.spawningTime) {
            this.tick = 0;
            this.spawned = true;
          }
        } else {
          this.tick++;
          let linearProportion = this.tick / this.reachTime,
              armonicProportion = Math.sin(linearProportion * TauQuarter);
  
          let currentX = this.startX + (this.finalX - this.startX) * linearProportion;
          let currentY = this.startY + (this.finalY - this.startY) * armonicProportion;
  
          if (this.prevPoints.length > opts.fireworkPrevPoints) {
            this.prevPoints.shift();
          }
          this.prevPoints.push([currentX, currentY, linearProportion * this.lineWidth]);
  
          let lineWidthProportion = 1 / (this.prevPoints.length - 1);
          for (let i = 1; i < this.prevPoints.length; i++) {
            let point = this.prevPoints[i],
                point2 = this.prevPoints[i - 1];
            ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
            ctx.lineWidth = point[2] * lineWidthProportion * i;
            ctx.beginPath();
            ctx.moveTo(point2[0], point2[1]);
            ctx.lineTo(point[0], point[1]);
            ctx.stroke();
          }
  
          if (this.tick >= this.reachTime) {
            this.phase = "contemplate";
            this.tick = 0;
            this.tick2 = 0;
            this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
            this.circleCompleteTime = (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
            this.circleCreating = true;
            this.circleFading = false;
            // Use fadeMultiplier here to slow the fade-out phase
            this.circleFadeTime = ((opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) * fadeMultiplier) | 0;
  
            let shardCount = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0,
                angle = Tau / shardCount,
                cos = Math.cos(angle),
                sin = Math.sin(angle),
                sx = 1,
                sy = 0;
            this.shards = [];
            for (let i = 0; i < shardCount; i++) {
              let x1 = sx;
              sx = sx * cos - sy * sin;
              sy = sy * cos + x1 * sin;
              this.shards.push(new Shard(this.finalX, this.finalY, sx, sy, this.alphaColor));
            }
          }
        }
      } else if (this.phase === "contemplate") {
        this.tick++;
        if (this.circleCreating) {
          this.tick2++;
          let proportion = this.tick2 / this.circleCompleteTime,
              armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
          ctx.beginPath();
          ctx.fillStyle = this.alphaColor.replace("alp", proportion);
          ctx.arc(this.finalX, this.finalY, armonic * this.circleFinalSize, 0, Tau);
          ctx.fill();
          if (this.tick2 >= this.circleCompleteTime) {
            this.tick2 = 0;
            this.circleCreating = false;
            this.circleFading = true;
          }
        } else if (this.circleFading) {
          ctx.fillStyle = this.alphaColor.replace("alp", 1);
          ctx.fillText(this.char, this.finalX + this.dx, this.finalY + this.dy);
          this.tick2++;
          let proportion = this.tick2 / this.circleFadeTime,
              armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
          ctx.beginPath();
          ctx.fillStyle = this.alphaColor.replace("alp", 1 - armonic);
          ctx.arc(this.finalX, this.finalY, this.circleFinalSize, 0, Tau);
          ctx.fill();
          if (this.tick2 >= this.circleFadeTime) {
            this.circleFading = false;
          }
        } else {
          ctx.fillStyle = this.alphaColor.replace("alp", 1);
          ctx.fillText(this.char, this.finalX + this.dx, this.finalY + this.dy);
        }
  
        for (let i = 0; i < this.shards.length; i++) {
          this.shards[i].step();
          if (!this.shards[i].alive) {
            this.shards.splice(i, 1);
            i--;
          }
        }
  
        if (this.tick > opts.letterContemplatingWaitTime) {
          this.phase = "balloon";
          this.tick = 0;
          this.spawning = true;
          this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
          this.inflating = false;
          this.inflateTime = (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
          this.size = (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;
          let rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
              vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
          this.vx = Math.cos(rad) * vel;
          this.vy = Math.sin(rad) * vel;
        }
      } else if (this.phase === "balloon") {
        ctx.strokeStyle = "#fff";
        if (this.spawning) {
          this.tick++;
          ctx.fillStyle = "#fff";
          ctx.fillText(this.char, this.finalX + this.dx, this.finalY + this.dy);
          if (this.tick >= this.spawnTime) {
            this.tick = 0;
            this.spawning = false;
            this.inflating = true;
          }
        } else if (this.inflating) {
          this.tick++;
          let proportion = this.tick / this.inflateTime,
              x = this.finalX,
              y = this.finalY - this.size * proportion;
          ctx.fillStyle = this.alphaColor.replace("alp", proportion);
          ctx.beginPath();
          generateBalloonPath(x, y, this.size * proportion);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, this.finalY);
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.fillText(this.char, this.finalX + this.dx, this.finalY + this.dy);
          if (this.tick >= this.inflateTime) {
            this.tick = 0;
            this.inflating = false;
          }
        } else {
          this.finalX += this.vx;
          this.finalY += (this.vy += opts.upFlow);
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          generateBalloonPath(this.finalX, this.finalY, this.size);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(this.finalX, this.finalY);
          ctx.lineTo(this.finalX, this.finalY + this.size);
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.fillText(this.char, this.finalX + this.dx, this.finalY + this.dy + this.size);
          if (this.finalY + this.size < -hh || this.finalX < -hw || this.finalY > h + hh) {
            this.phase = "done";
          }
        }
      }
    };
  
    // ======================================
    // 3) Shard Constructor
    // ======================================
    function Shard(x, y, vx, vy, color) {
      let vel = opts.fireworkShardBaseVel + opts.fireworkAddedVel * Math.random();
      this.vx = vx * vel;
      this.vy = vy * vel;
      this.x = x;
      this.y = y;
      this.prevPoints = [[x, y]];
      this.alphaColor = color;
      this.alive = true;
      this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
    }
    Shard.prototype.step = function () {
      this.x += this.vx;
      this.y += (this.vy += opts.gravity);
      if (this.prevPoints.length > opts.fireworkShardPrevPoints) {
        this.prevPoints.shift();
      }
      this.prevPoints.push([this.x, this.y]);
      let lineWidthProportion = this.size / this.prevPoints.length;
      for (let k = 0; k < this.prevPoints.length - 1; k++) {
        let point = this.prevPoints[k],
            point2 = this.prevPoints[k + 1];
        ctx.strokeStyle = this.alphaColor.replace("alp", k / this.prevPoints.length);
        ctx.lineWidth = k * lineWidthProportion;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }
      if (this.prevPoints[0][1] > hh) {
        this.alive = false;
      }
    };
  
    // ======================================
    // 4) Balloon Path Function
    // ======================================
    function generateBalloonPath(x, y, size) {
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x - size / 2, y - size / 2,
        x - size / 4, y - size,
        x, y - size
      );
      ctx.bezierCurveTo(
        x + size / 4, y - size,
        x + size / 2, y - size / 2,
        x, y
      );
    }
  
    // ======================================
    // 5) Animation Loop
    // ======================================
    function anim() {
      requestAnimationFrame(anim);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      // Translate origin to canvas center
      ctx.translate(hw, hh);
      let allDone = true;
      letters.forEach((letter) => {
        letter.step();
        if (letter.phase !== "done") {
          allDone = false;
        }
      });
      ctx.restore();
      if (allDone || Date.now() - lastResetTime > cycleDuration) {
        // Re-create letters from scratch for a new cycle
        createLetters();
        lastResetTime = Date.now();
      }
    }
  
    // ======================================
    // 6) Create Letters (Centered)
    // ======================================
    function createLetters() {
      letters = [];
      ctx.font = `${opts.charSize}px Verdana`;
      const totalLinesHeight = opts.strings.length * opts.lineHeight;
      const offsetY0 = -totalLinesHeight / 2;
      opts.strings.forEach((str, lineIndex) => {
        let charWidths = [];
        for (let i = 0; i < str.length; i++) {
          charWidths.push(ctx.measureText(str[i]).width);
        }
        let letterSpacing = opts.charSize * letterSpacingFactor;
        let totalLineWidth =
          charWidths.reduce((sum, w) => sum + w, 0) +
          letterSpacing * (str.length - 1);
        let offsetX0 = -totalLineWidth / 2;
        let lineY = offsetY0 + lineIndex * opts.lineHeight;
        let currentX = offsetX0;
        for (let i = 0; i < str.length; i++) {
          let letterX = currentX + charWidths[i] / 2;
          let letterY = lineY;
          letters.push(new Letter(str[i], letterX, letterY));
          currentX += charWidths[i] + letterSpacing;
        }
      });
    }
  
    // ======================================
    // 7) Initialize Animation
    // ======================================
    createLetters();
    anim();
  
    // ======================================
    // 8) Resize Event (with DPR handling)
    // ======================================
    window.addEventListener("resize", () => {
      resizeCanvas();
      baseCharSize = Math.max(20, window.innerWidth * 0.03);
      opts.charSize = baseCharSize;
      opts.lineHeight = baseCharSize * lineHeightFactor;
      ctx.font = `${opts.charSize}px Verdana`;
      createLetters();
    });
  });
  