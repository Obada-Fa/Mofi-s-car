import { Scene, Label, Vector, Timer, Color, Font, FontUnit, RotationType } from 'excalibur';
import { Road } from './road.js';
import { Car } from './car.js';
import { Obstacle, BusObstacle, OilObstacle } from './obstacle.js';
import { Resources } from './resources.js';

export class BaseScene extends Scene {
    constructor() {
        super();
        this.winningTime = 25;
        this.timeElapsed = 0;
        this.isGameOver = false;
        this.score = 0; // Initialize score
    }

    onInitialize(engine) {
        this.engine = engine;

        // Add road first to ensure it is the background
        this.road = new Road();
        this.road.pos.y = engine.drawHeight; // Start from the bottom
        this.add(this.road);

        // Add car
        this.car = new Car();
        this.car.pos = new Vector(640, 600);
        this.add(this.car);

        // Create obstacles (to be overridden by derived classes)
        this.createObstacles();

        // Lock camera to car with boundaries
        this.camera.strategy.lockToActor(this.car);
        this.camera.strategy.limitCameraBounds({
            left: this.road.pos.x - this.road.width / 2,
            right: this.road.pos.x + this.road.width / 2,
            top: 0,
            bottom: engine.drawHeight
        });
        this.camera.zoom = 1.2;

        // Add timer label
        this.timerLabel = new Label({
            text: `Time: ${this.winningTime}`,
            pos: new Vector(50, 50),
            color: Color.White,
            font: new Font({
                family: 'VT323',
                size: 24,
                unit: FontUnit.Px,
                color: Color.White
            }),
            z: 4
        });
        this.add(this.timerLabel);

        // Add winning label
        this.winningLabel = new Label({
            text: '',
            pos: new Vector(0, engine.drawHeight / 2),
            color: Color.White,
            font: new Font({
                family: 'VT323',
                size: 48, // Increase font size for bigger letters
                unit: FontUnit.Px,
                color: Color.White
            }),
            z: 4
        });
        this.winningLabel.anchor.setTo(0.5, 0.5);
        this.add(this.winningLabel);

        // Add score label
        this.scoreLabel = new Label({
            text: `Score: ${this.score}`,
            pos: new Vector(50, 100),
            color: Color.White,
            font: new Font({
                family: 'VT323',
                size: 24,
                unit: FontUnit.Px,
                color: Color.White
            }),
            z: 4
        });
        this.add(this.scoreLabel);

        // Set up collision handling
        this.car.on('collisionstart', (evt) => {
            this.handleCarCollision(evt);
        });

        // Update score every second
        this.scoreTimer = new Timer({
            fcn: () => this.updateScore(),
            interval: 1000, // 1 second
            repeats: true
        });
        this.add(this.scoreTimer);
    }

    updateScore() {
        if (!this.isGameOver) {
            this.score += 10; // Increment score
            this.scoreLabel.text = `Score: ${this.score}`;
        }
    }

    updateTime() {
        if (this.isGameOver) return;

        this.timeElapsed++;
        this.timerLabel.text = `Time: ${this.winningTime - this.timeElapsed}`;

        if (this.timeElapsed >= this.winningTime) {
            this.winLevel();
        }
    }

    winLevel() {
        this.isGameOver = true;
        this.winningLabel.text = 'YOU WIN!';
        this.winningLabel.pos = new Vector(0, this.engine.drawHeight / 2); // Ensure it's centered
        this.stopGame();
        this.saveScore(); // Save score locally
        setTimeout(() => {
            this.engine.goToScene('intro'); // Or transition to the next level
        }, 2000);
    }

    gameOver() {
        this.isGameOver = true;

        // Allow the car to complete its throw-off animation before stopping the game and transitioning scenes
        setTimeout(() => {
            this.stopGame();
            this.saveScore();
            this.engine.goToScene('gameOver'); // Go to Game Over scene
        }, 1000); // Reduced delay to 1 second
    }

    stopGame() {
        if (this.timer) {
            this.timer.cancel();
        }
        if (this.scoreTimer) {
            this.scoreTimer.cancel();
        }
        this.car.actions.clearActions();
        this.car.vel = Vector.Zero.clone();
        this.engine.currentScene.actors.forEach(actor => {
            actor.actions.clearActions();
            if (actor instanceof Obstacle) {
                this.remove(actor); // Remove all obstacles
            }
        });
    }

    saveScore() {
        const lastScore = { score: this.score, date: new Date().toISOString() };
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push(lastScore);
        highScores = highScores.sort((a, b) => b.score - a.score).slice(0, 5); // Keep top 5 scores
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }

    onActivate() {
        try {
            // Reset game state
            this.timeElapsed = 0;
            this.isGameOver = false;
            this.winningLabel.text = '';
            this.car.reset();
            this.timerLabel.text = `Time: ${this.winningTime}`;
            this.score = 0; // Reset score
            this.scoreLabel.text = `Score: ${this.score}`;

            // Ensure timers are stopped before creating new ones
            if (this.timer) {
                this.timer.cancel();
                this.remove(this.timer);
            }
            if (this.scoreTimer) {
                this.scoreTimer.cancel();
                this.remove(this.scoreTimer);
            }

            // Add and start a new timer for game time
            this.timer = new Timer({
                fcn: () => this.updateTime(),
                interval: 1000, // 1 second
                repeats: true
            });
            this.add(this.timer);
            this.timer.start();

            // Add and start a new timer for score
            this.scoreTimer = new Timer({
                fcn: () => this.updateScore(),
                interval: 1000, // 1 second
                repeats: true
            });
            this.add(this.scoreTimer);
            this.scoreTimer.start();

        } catch (error) {
            console.error('Error during onActivate:', error);
        }
    }

    onPreUpdate(engine, delta) {
        if (this.isGameOver) return;

        super.onPreUpdate(engine, delta);

        // Update timer label position based on camera
        const cameraPos = this.camera.pos;
        this.timerLabel.pos = new Vector(cameraPos.x - engine.drawWidth / 2 + 50, cameraPos.y - engine.drawHeight / 2 + 50);
        this.scoreLabel.pos = new Vector(cameraPos.x - engine.drawWidth / 2 + 50, cameraPos.y - engine.drawHeight / 2 + 100);
        this.winningLabel.pos = new Vector(cameraPos.x - engine.drawWidth / 2 + 50, cameraPos.y - engine.drawHeight / 2 + 100);

        // Ensure winning label stays centered
        this.winningLabel.pos = new Vector(engine.drawWidth / 2, engine.drawHeight / 2);
    }

    handleCarCollision(evt) {
        const other = evt.other;
        if (other instanceof BusObstacle) {
            const carCenterX = this.car.pos.x;
            const busCenterX = other.pos.x;
    
            // Determine the direction to throw the car
            const throwDirection = carCenterX < busCenterX ? -1 : 1; // -1 for left, 1 for right
    
            this.car.isThrownOff = true;
            this.car.isUncontrollable = true;
            this.car.vel = new Vector(throwDirection * 250, -125); // Apply a force to throw the car off screen
            this.car.graphics.use(Resources.Smashed.toSprite());
    
            // Apply a rotation for a realistic effect
            const rotationDirection = throwDirection === 1 ? RotationType.Clockwise : RotationType.CounterClockwise;
            this.car.actions.rotateBy(Math.PI / 4 * throwDirection, 0.7, rotationDirection);
    
            this.gameOver();
        } else if (other instanceof OilObstacle) {
            if (this.car.isUncontrollable) return;
    
            this.car.isUncontrollable = true;
            const shakeDuration = 1000; // Duration of uncontrollable state in milliseconds
            const shakeIntensity = 5; // Intensity of the shake
    
            // Shake effect
            const shake = (elapsedTime) => {
                if (elapsedTime >= shakeDuration) {
                    this.car.isUncontrollable = false;
                    this.car.actions.clearActions(); // Clear the shaking animation after 1 second
                    this.car.rotation = 0; // Reset rotation to 0
                    return;
                }
    
                this.car.pos.x += (Math.random() - 0.5) * shakeIntensity;
                this.car.pos.y += (Math.random() - 0.5) * shakeIntensity;
    
                setTimeout(() => shake(elapsedTime + 100), 100);
            };
    
            shake(0);
    
            // Rotation animation
            this.car.actions.repeatForever((ctx) => {
                ctx.rotateBy(Math.PI / 16, 100).rotateBy(-Math.PI / 8, 100).rotateBy(Math.PI / 16, 100);
            }).delay(shakeDuration).callMethod(() => {
                this.car.isUncontrollable = false;
                this.car.rotation = 0; // Reset rotation to 0
            });
    
            setTimeout(() => {
                this.car.isUncontrollable = false; // Allow control again after 1 second
                this.car.rotation = 0; // Reset rotation to 0
            }, shakeDuration);

            this.score -= 50; // Decrement score
            if (this.score < 0) this.score = 0;
            this.scoreLabel.text = `Score: ${this.score}`;
        }
    }
}
