import { Actor, Vector, Color, Line, CollisionType } from 'excalibur';

export class Road extends Actor {
    constructor() {
        super({
            width: 1280,  // Set the width of the road
            height: 800,  // Set the height of the road
            color: Color.Gray // Darker color for the road
        });
        this.dashLines = [];
        this.obstacles = [];
        this.dashLength = 20;
        this.spaceBetweenDashes = 40;
        this.laneWidth = this.width / 3;
    }

    onInitialize(engine) {
        this.pos = new Vector(0, engine.drawHeight / 2);
        this.z = 0;

        // Split road into lanes
        for (let i = 1; i < 3; i++) {
            const x = (this.pos.x - this.width / 2) + (i * this.laneWidth);

            const lineActor = new Actor({
                pos: new Vector(x, 0)
            });

            lineActor.graphics.anchor = Vector.Zero;
            lineActor.graphics.use(
                new Line({
                    start: new Vector(0, 0),
                    end: new Vector(0, this.height),
                    color: Color.LightGray,
                    thickness: 5
                })
            );

            engine.add(lineActor);
        }

        // Draw white lines in the middle of the lane
        for (let j = 0; j < 3; j++) {
            const laneCenter = (this.pos.x - this.width / 2) + this.laneWidth / 2 + j * this.laneWidth;
            for (let y = -this.height; y < this.height; y += this.dashLength + this.spaceBetweenDashes) {
                const dashLine = new Actor({
                    pos: new Vector(laneCenter, y)
                });

                dashLine.graphics.anchor = Vector.Zero;
                dashLine.graphics.use(
                    new Line({
                        start: new Vector(0, 0),
                        end: new Vector(0, this.dashLength),
                        color: Color.White,
                        thickness: 3
                    })
                );

                engine.add(dashLine);
                this.dashLines.push(dashLine);
            }
        }
    }

    randomizeObstaclePosition(obstacle) {
        const minX = this.pos.x - this.width / 2 + obstacle.width / 2;
        const maxX = this.pos.x + this.width / 2 - obstacle.width / 2;
        const minY = -this.height; // Start above the screen
        const maxY = 0; // Spawn within the visible height
        const minDistance = this.laneWidth; // Minimum distance is one lane width

        let validPosition = false;
        let randomX, randomY;

        while (!validPosition) {
            randomX = Math.random() * (maxX - minX) + minX;
            randomY = Math.random() * (maxY - minY) + minY;
            validPosition = true;

            for (const existingObstacle of this.obstacles) {
                const distance = Math.sqrt(
                    Math.pow(randomX - existingObstacle.pos.x, 2) +
                    Math.pow(randomY - existingObstacle.pos.y, 2)
                );
                if (distance < minDistance) {
                    validPosition = false;
                    break;
                }
            }
        }

        obstacle.pos = new Vector(randomX, randomY);
    }

    addObstacle(obstacle) {
        this.randomizeObstaclePosition(obstacle);
        this.obstacles.push(obstacle);
    }

    resetObstacles() {
        for (const obstacle of this.obstacles) {
            this.randomizeObstaclePosition(obstacle);
        }
    }

    onPreUpdate(engine, delta) {
        const speed = 400; // Speed of the road animation in pixels per second
        const moveAmount = (speed * delta) / 1000;

        // Move dashed lines
        for (const dashLine of this.dashLines) {
            dashLine.pos.y += moveAmount;

            if (dashLine.pos.y > this.height) {
                dashLine.pos.y -= this.height + this.dashLength + this.spaceBetweenDashes;
            }
        }

        // Move obstacles
        for (const obstacle of this.obstacles) {
            obstacle.pos.y += moveAmount;

            if (obstacle.pos.y - obstacle.height / 2 > this.height) {
                // Reposition the obstacle randomly within the bounds
                this.randomizeObstaclePosition(obstacle);
            }
        }
    }
}
