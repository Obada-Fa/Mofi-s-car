import { BaseScene } from './basescene.js';
import { BusObstacle, OilObstacle } from './obstacle.js';

export class LevelOneScene extends BaseScene {
    createObstacles() {
        const obstacle1 = new BusObstacle(400, 400);
        const obstacle2 = new BusObstacle(800, 200);
        const oil1 = new OilObstacle(600, 300);
        const oil2 = new OilObstacle(1000, 150);

        this.road.addObstacle(obstacle1);
        this.road.addObstacle(obstacle2);
        this.road.addObstacle(oil1);
        this.road.addObstacle(oil2);

        this.add(obstacle1);
        this.add(obstacle2);
        this.add(oil1);
        this.add(oil2);
    }

    onInitialize(engine) {
        super.onInitialize(engine);
        console.log('LevelOneScene initialized');
    }

    onActivate() {
        super.onActivate();

        // Clear existing obstacles from the road
        this.road.obstacles.forEach(obstacle => this.remove(obstacle));
        this.road.obstacles = [];

        // Create new obstacles
        this.createObstacles();
    }
}
