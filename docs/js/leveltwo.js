import { BaseScene } from './basescene.js';
import { Obstacle } from './obstacle.js';

export class LevelTwoScene extends BaseScene {
    createObstacles() {
        // Create and add obstacles specific to Level Two
        const obstacle1 = new Obstacle(500, 500, 75, 75);
        const obstacle2 = new Obstacle(700, 300, 50, 100);
        this.road.addObstacle(obstacle1);
        this.road.addObstacle(obstacle2);

        this.add(obstacle1);
        this.add(obstacle2);
    }
}
