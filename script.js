window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1800;
  canvas.height = 900;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.font = "20px Helvatica";
  ctx.fillStyle = "white";

  //~* A S T E R O I D    C L A S S
  class Asteroid {
    constructor(game) {
      this.game = game;
      this.radius = 75;
      this.x = -this.radius;
      this.y = Math.random() * game.height;
      this.image = document.getElementById("asteroid");
      this.spriteWidth = 150; //asteroid width
      this.spriteHeight = 155; //asteroid height
      this.speed = Math.random() * 2 + 4;
      this.free = true;
      this.angle = 0;
      this.velocityOfAngel = Math.random() * 0.02 - 0.01;
    }

    draw(context) {
      if (!this.free) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(
          this.image,
          0 - 0.5 * this.spriteWidth,
          0 - 0.5 * this.spriteHeight,
          this.spriteWidth,
          this.spriteHeight
        );
        context.restore();
      }
    }

    update() {
      if (!this.free) {
        this.angle += this.velocityOfAngel;
        this.x += this.speed;
        if (this.x > this.game.width - this.radius) {
          this.reset();
          const explosion = this.game.getExplosion();
          if (explosion) explosion.start(this.x, this.y, 0);
        }
      }
    }

    reset() {
      this.free = true;
      this.angel = 0;
    }
    start() {
      this.free = false;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
    }
  }

  //~* E X P L O S I O N    C L A S S
  class Explosion {
    constructor(game) {
      this.game = game;
      this.x = 0;
      this.y = 0;
      this.speed = 0;
      this.image = document.getElementById("explosion");
      this.spriteWidth = 300;
      this.spriteHeight = 300;
      this.free = true;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
      this.maxFrame = 22;
      this.animationTimer = 0;
      this.animationInterval = 30;
      this.sound =
        game.explosionSounds[
          Math.floor(Math.random() * game.explosionSounds.length)
        ];
    }

    draw(context) {
      if (!this.free) {
        context.drawImage(
          this.image,
          this.spriteWidth * this.frameX,
          this.spriteHeight * this.frameY,
          this.spriteWidth,
          this.spriteHeight,
          this.x - this.spriteWidth * 0.5,
          this.y - this.spriteHeight * 0.5,
          this.spriteWidth,
          this.spriteHeight
        );
      }
    }

    update(deltaTime) {
      if (!this.free) {
        this.x += this.speed;
        if (this.animationTimer > this.animationInterval) {
          this.frameX++;
          if (this.frameX > this.maxFrame) this.reset();
          this.animationTimer = 0;
        } else {
          this.animationTimer += deltaTime;
        }
      }
    }

    play() {
      this.sound.curruntTime = 0; //set sound at start
      this.sound.play(); //play sound
    }

    reset() {
      this.free = true;
      this.frameX = 0;
    }

    start(x, y, speed) {
      this.free = false;
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.play();
      this.sound =
        this.game.explosionSounds[
          Math.floor(Math.random() * this.game.explosionSounds.length)
        ];
    }
  }

  //~* G A M E    C L A S S
  class Game {
    constructor(width, height) {
      this.height = height;
      this.width = width;
      this.asteroidPool = [];
      this.asteroidPoolSize = 15;
      this.asteroidTimer = 0;
      this.asteroidInterval = 500;
      this.createAsteroidPool();

      this.explosion1 = document.getElementById("explosion1");
      this.explosion2 = document.getElementById("explosion2");
      this.explosion3 = document.getElementById("explosion3");
      this.explosion4 = document.getElementById("explosion4");
      this.explosion5 = document.getElementById("explosion5");
      this.explosion6 = document.getElementById("explosion6");

      this.explosionSounds = [
        this.explosion1,
        this.explosion2,
        this.explosion3,
        this.explosion4,
        this.explosion5,
        this.explosion6,
      ];

      this.explosionPool = [];
      this.explosionPoolSize = 15;
      this.createExplosionPool(); //make sure to run this function after creating explosionSounds array as in Explosion object we are using this array

      this.score = 0;
      this.maxScore = 100;

      this.mouse = {
        x: 0,
        y: 0,
        radius: 1,
      };

      window.addEventListener("click", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        this.asteroidPool.forEach((asteroid) => {
          if (!asteroid.free && this.checkCollision(asteroid, this.mouse)) {
            const explosion = this.getExplosion();
            if (explosion) {
              explosion.start(asteroid.x, asteroid.y, asteroid.speed * 0.5);
              asteroid.reset();

              if (this.score < this.maxScore) this.score++;
            }
          }
        });
      });
    }

    createAsteroidPool() {
      for (let i = 0; i < this.asteroidPoolSize; i++)
        this.asteroidPool.push(new Asteroid(this));
    }

    createExplosionPool() {
      for (let i = 0; i < this.explosionPoolSize; i++) {
        this.explosionPool.push(new Explosion(this));
      }
    }

    getAsteroid() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }

    getExplosion() {
      for (let i = 0; i < this.explosionPool.length; i++) {
        if (this.explosionPool[i].free) {
          return this.explosionPool[i];
        }
      }
    }

    checkCollision(a, b) {
      const sumofRadii = a.radius + b.radius;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      return distance < sumofRadii;
    }

    render(context, deltaTime) {
      if (this.asteroidTimer > this.asteroidInterval) {
        const asteroid = this.getAsteroid();
        if (asteroid) asteroid.start();
        this.asteroidTimer = 0;
      } else {
        this.asteroidTimer += deltaTime;
      }

      this.asteroidPool.forEach((element) => {
        element.draw(context);
        element.update();
      });

      this.explosionPool.forEach((element) => {
        element.draw(context);
        element.update(deltaTime);
      });

      context.fillText("Score : " + this.score, 20, 35);

      if (this.score >= this.maxScore) {
        context.save();
        context.textAlign = "center";
        context.fillText(
          "You, win, final score: " + this.score,
          this.width * 0.5,
          this.height * 0.5
        );
        context.restore();
      }
    }
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear previos frames of animation
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }

  animate(0);
});
