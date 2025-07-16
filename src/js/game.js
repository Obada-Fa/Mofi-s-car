// src/js/game.js

import { Engine, DisplayMode } from 'excalibur';
import { ResourceLoader } from './resources.js';
import { IntroScene } from './introscene.js';
import { LevelOneScene } from './levelone.js';
import { LevelTwoScene } from './leveltwo.js';
import { GameOverScene } from './gameover.js'; // Import GameOverScene
import { WinningScene } from './winningscene.js'; // Import WinningScene

export class Game extends Engine {
    constructor() {
        super({
            width: 1280,
            height: 670,
            displayMode: DisplayMode.FitScreen
        });

        this.start(ResourceLoader).then(() => this.onInitialize());
    }

    onInitialize() {
        this.addSceneSafely('intro', new IntroScene());
        this.addSceneSafely('levelOne', new LevelOneScene());
        this.addSceneSafely('levelTwo', new LevelTwoScene());
        this.addSceneSafely('gameOver', new GameOverScene());
        this.addSceneSafely('winning', new WinningScene());

        this.goToScene('intro');
    }

    addSceneSafely(name, scene) {
        if (!this.scenes[name]) {
            this.addScene(name, scene);
        }
    }
}

new Game();
