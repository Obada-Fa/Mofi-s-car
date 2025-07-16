import { Scene, Label, Vector, Color, Font, FontUnit } from 'excalibur';

export class WinningScene extends Scene {
    onInitialize(engine) {
        // Create a "You Win!" label
        const winLabel = new Label({
            text: 'You Win!',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 3),
            color: Color.White,
            font: new Font({
                family: 'Press Start 2P', // Retro font
                size: 48,
                unit: FontUnit.Px,
                color: Color.White,
            })
        });
        winLabel.anchor.setTo(0.5, 0.5);
        this.add(winLabel);

        // Create a "Proceed to Next Level" label
        this.nextLevelLabel = new Label({
            text: 'Proceed to Next Level',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 2),
            color: Color.Yellow,
            font: new Font({
                family: 'Press Start 2P',
                size: 36,
                unit: FontUnit.Px,
                color: Color.Yellow,
            })
        });
        this.nextLevelLabel.anchor.setTo(0.5, 0.5);
        this.add(this.nextLevelLabel);

        // Create a "Restart Level" label
        this.restartLabel = new Label({
            text: 'Restart Level',
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 2 + 50),
            color: Color.Gray,
            font: new Font({
                family: 'Press Start 2P',
                size: 36,
                unit: FontUnit.Px,
                color: Color.Gray,
            })
        });
        this.restartLabel.anchor.setTo(0.5, 0.5);
        this.add(this.restartLabel);

        // Add keyboard navigation
        this.selectedOption = 0;
        this.updateSelection();

        engine.input.keyboard.on('press', (evt) => this.handleInput(evt, engine));
    }

    handleInput(evt, engine) {
        if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
            this.selectedOption = this.selectedOption === 0 ? 1 : 0;
            this.updateSelection();
        } else if (evt.key === 'Enter') {
            if (this.selectedOption === 0) {
                engine.goToScene('levelTwo');
            } else {
                engine.goToScene('levelOne');
            }
        }
    }

    updateSelection() {
        if (this.selectedOption === 0) {
            this.nextLevelLabel.color = Color.Yellow;
            this.restartLabel.color = Color.Gray;
        } else {
            this.nextLevelLabel.color = Color.Gray;
            this.restartLabel.color = Color.Yellow;
        }
    }
}
