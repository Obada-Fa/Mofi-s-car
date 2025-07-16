import { Actor, Vector, Input, RotationType, EasingFunctions, CollisionType, SpriteSheet, Animation, Sprite } from 'excalibur';
import { Resources } from './resources.js';
import { OilObstacle, BusObstacle } from './obstacle.js';

export class Car extends Actor {
    constructor() {
        super({
            width: 293.5,
            height: 833,
        });
        this.scale = new Vector(0.2, 0.2);
        this.startingPos = new Vector(0, 570);
        this.z = 3;
        this.isThrownOff = false; // Track whether the car has been thrown off screen
        this.isUncontrollable = false; // Track whether the car is uncontrollable
    }

    onInitialize(engine) {
        this.pos = this.startingPos.clone();
        this.roadWidth = 1280; // Road width
        this.laneWidth = this.roadWidth / 3; // Width of each lane

        // Define the sprite sheet
        const spriteSheet = SpriteSheet.fromImageSource({
            image: Resources.CarSpriteSheet,
            grid: {
                rows: 1,
                columns: 2,
                spriteWidth: 285,
                spriteHeight: 833 
            }
        });

        // Define the animation
        this.animation = Animation.fromSpriteSheet(spriteSheet, [0, 1], 100); // 100ms per frame
        this.graphics.use(this.animation);

        engine.input.keyboard.on('hold', (evt) => this.handleMovement(evt));

        // Listen for collision events
        this.on('collisionstart', (evt) => this.handleCollisionByType(evt));
    }

    handleMovement(evt) {
        if (this.isUncontrollable) return; // Prevent movement if the car is uncontrollable

        const moveSpeed = 300; // pixels per second

        if (evt.key === Input.Keys.Left) {
            this.vel.x = -moveSpeed;
        } else if (evt.key === Input.Keys.Right) {
            this.vel.x = moveSpeed;
        }
    }

    onPreUpdate(engine, delta) {
        if (!this.isUncontrollable) {
            this.vel.x = 0; // Reset horizontal velocity to prevent continuous movement

            if (engine.input.keyboard.isHeld(Input.Keys.Left)) {
                this.vel.x = -300;
            }
            if (engine.input.keyboard.isHeld(Input.Keys.Right)) {
                this.vel.x = 300;
            }
        }

        // Boundary checks to keep the car within the road
        const carHalfWidth = this.width * this.scale.x / 2; // Use the width provided in the constructor
        const leftBoundary = -(this.roadWidth / 2) + carHalfWidth;
        const rightBoundary = (this.roadWidth / 2) - carHalfWidth;

        if (this.pos.x < leftBoundary) {
            this.pos.x = leftBoundary;
            this.vel.x = 0;
        }
        if (this.pos.x > rightBoundary) {
            this.pos.x = rightBoundary;
            this.vel.x = 0;
        }
    }

    handleCollisionByType(other) {
        if (other instanceof BusObstacle) {
            this.throwOffScreen(); // Maintain existing bus collision behavior
        } else if (other instanceof OilObstacle) {
            this.handleOilCollision();
        }
    }

    handleOilCollision() {
        if (this.isUncontrollable) return;

        this.isUncontrollable = true;
        const shakeDuration = 1; 
        const shakeIntensity = 5; // Intensity of the shake

        // Shake effect
        const shake = (elapsedTime) => {
            if (elapsedTime >= shakeDuration) {
                this.isUncontrollable = false;
                this.pos = this.startingPos.clone(); // Reset position after shaking
                return;
            }

            this.pos.x += (Math.random() - 0.5) * shakeIntensity;
            this.pos.y += (Math.random() - 0.5) * shakeIntensity;

            setTimeout(() => shake(elapsedTime + 100), 100);
        };

        shake(0);
    }

    throwOffScreen() {
        if (this.isThrownOff) return; // Prevent multiple throws
        this.isThrownOff = true;

        // Change the sprite to the smashed car sprite
        const smashedSprite = new Sprite({
            image: Resources.Smashed.image,
            destSize: {
                width: this.width * this.scale.x,
                height: this.height * this.scale.y
            }
        });
        console.log(smashedSprite);
        this.graphics.use(smashedSprite);

        // Determine the direction to throw the car based on its current position
        const throwDirection = this.pos.x > 0 ? 1 : -1; // 1 for right, -1 for left

        // Apply throw animation
        this.actions
            .rotateBy(Math.PI * 2, 0.5, RotationType.Clockwise)
            .moveTo(new Vector(this.pos.x + (throwDirection * 200), this.pos.y + 200), 400, EasingFunctions.EaseInOutCubic);
    }

    reset() {
        this.pos = this.startingPos.clone();
        this.vel = Vector.Zero.clone();
        this.rotation = 0;
        this.isThrownOff = false; // Reset the throw state
        this.isUncontrollable = false; // Reset the uncontrollable state

        // Reset the sprite to the default animation
        this.graphics.use(this.animation); // Use the default animation
    }
}
