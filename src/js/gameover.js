import { Scene, Label, Vector, Color, Font, FontUnit, Actor, TextAlign } from 'excalibur';
import { Resources } from './resources.js';

export class GameOverScene extends Scene {
    onInitialize(engine) {
        // Create the background actor
        const background = new Actor();
        const backgroundSprite = Resources.GameOverBG.toSprite();
        background.graphics.use(backgroundSprite);
        background.pos = new Vector(engine.drawWidth / 2, engine.drawHeight / 2);
        this.add(background);

        // Create a "Game Over" label
        const gameOverLabel = new Label({
            text: 'Game Over',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 3),
            color: Color.Red,
            font: new Font({
                family: 'VT323', // New font
                size: 48,
                color: Color.Red,
                textAlign: TextAlign.Center,
            })
        });
        gameOverLabel.anchor.setTo(0.5, 0.5);
        this.add(gameOverLabel);

        // "Play Again" label
        this.playAgainLabel = new Label({
            text: 'Play Again',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 2),
            color: Color.Yellow,
            font: new Font({
                family: 'VT323', // New font
                size: 36,
                color: Color.Yellow,
                textAlign: TextAlign.Center,
            })
        });
        this.playAgainLabel.anchor.setTo(0.5, 0.5);
        this.add(this.playAgainLabel);

        // "Exit" label
        this.exitLabel = new Label({
            text: 'Exit',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 2 + 50),
            color: Color.Black,
            font: new Font({
                family: 'VT323', 
                size: 36,
                unit: FontUnit.Px,
                color: Color.Black,
                textAlign: TextAlign.Center,
            })
        });
        this.exitLabel.anchor.setTo(0.5, 0.5);
        this.add(this.exitLabel);

        // Create the Mofi image actor
        this.mofiImage = new Actor();
        this.mofiImage.scale = new Vector(0.2, 0.2);
        this.mofiImage.graphics.use(Resources.Mofi.toSprite());
        this.add(this.mofiImage);

        // Add keyboard navigation
        this.selectedOption = 0;
        this.updateSelection();

        engine.input.keyboard.on('press', (evt) => this.handleInput(evt, engine));
    }

    onActivate() {
        // Reset selected option and update selection
        this.selectedOption = 0;
        this.updateSelection();

        // Re-add the Mofi image actor to ensure it's displayed correctly
        if (!this.actors.includes(this.mofiImage)) {
            this.add(this.mofiImage);
        }

        // Ensure the keyboard listener is re-attached
        this.engine.input.keyboard.off('press');
        this.engine.input.keyboard.on('press', (evt) => this.handleInput(evt, this.engine));
    }

    handleInput(evt, engine) {
        if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
            this.selectedOption = this.selectedOption === 0 ? 1 : 0;
            this.updateSelection();
        } else if (evt.key === 'Enter') {
            if (this.selectedOption === 0) {
                engine.goToScene('levelOne'); // Restart the level
                
            } else {
                engine.goToScene('intro'); // Go to intro scene
            }
        }
    }

    updateSelection() {
        if (this.selectedOption === 0) {
            this.playAgainLabel.color = Color.Yellow;
            this.exitLabel.color = Color.Black;
            this.mofiImage.pos = new Vector(this.playAgainLabel.pos.x - 130, this.playAgainLabel.pos.y - 30); // Adjust position as needed
        } else {
            this.playAgainLabel.color = Color.Black;
            this.exitLabel.color = Color.Yellow;
            this.mofiImage.pos = new Vector(this.exitLabel.pos.x - 130, this.exitLabel.pos.y - 30); // Adjust position as needed
        }
    }
}
