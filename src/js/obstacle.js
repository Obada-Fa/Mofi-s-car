import { Actor, Vector, CollisionType, Shape } from 'excalibur';
import { Resources } from './resources.js';

// Base Obstacle class
export class Obstacle extends Actor {
    constructor(x, y, width, height) {
        super({
            pos: new Vector(x, y),
            width: width,
            height: height,
        });

        this.scale = new Vector(0.6, 0.6);
    }

    onInitialize(engine) {
        // Set the collision shape to a rectangle matching the dimensions of the obstacle
        this.collider.set(Shape.Box(this.width, this.height));
    }
}

// BusObstacle class
export class BusObstacle extends Obstacle {
    constructor(x, y) {
        super(x, y, Resources.Bus.width, Resources.Bus.height);
        this.collisionType = CollisionType.Active;
        this.graphics.use(Resources.Bus.toSprite());
        this.z = 3;
    }

    onInitialize(engine) {
        super.onInitialize(engine);
    }
}

// OilObstacle class
export class OilObstacle extends Obstacle {
    constructor(x, y) {
        super(x, y, Resources.Oil.width, Resources.Oil.height);
        this.collisionType = CollisionType.Passive;
        this.graphics.use(Resources.Oil.toSprite());
        this.z = 1;
    }

    onInitialize(engine) {
        super.onInitialize(engine);
    }
}
