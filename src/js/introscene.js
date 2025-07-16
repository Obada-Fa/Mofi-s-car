import { Scene, Vector, Label, Color, Actor, Font, TextAlign, Animation, SpriteSheet } from 'excalibur';
import { Resources } from './resources.js';
import '../css/style.css'; // Ensure CSS is imported to apply styles

export class IntroScene extends Scene {
    onInitialize(engine) {
        // Create the background actor
        const background = new Actor();
        const backgroundSprite = Resources.Background.toSprite();
        background.graphics.use(backgroundSprite);
        background.pos = new Vector(engine.drawWidth / 2, engine.drawHeight / 2);
        this.add(background);

        // Create the start label with the loaded font
        this.startLabel = new Label({
            text: "This is Mofi's racing game!\nPress Enter to Continue",
            pos: new Vector(engine.drawWidth / 2, 230),
            color: Color.Yellow,
            font: new Font({
                size: 48,
                family: 'VT323',
                textAlign: TextAlign.Center,
            })
        });
        this.startLabel.anchor.setTo(0.5, 0.5);
        this.add(this.startLabel);

        // Create the Mofi sprite sheet
        const mofiSpriteSheet = SpriteSheet.fromImageSource({
            image: Resources.MofiSpriteSheet,
            grid: {
                rows: 1,
                columns: 2,
                spriteWidth: 404, // Adjust based on actual sprite size
                spriteHeight: 886 // Adjust based on actual sprite size
            }
        });

        // Create an animation from the sprite sheet
        const mofiAnimation = Animation.fromSpriteSheet(mofiSpriteSheet, [0, 1, 2, 3], 100);

        // Create the Mofi image actor with animation
        const mofiImage = new Actor({
            pos: new Vector(engine.drawWidth / 2 - 220, 490), // Position it next to the text
            scale: new Vector(0.3, 0.3) // Scale the image to 0.3
        });
        mofiImage.graphics.use(mofiAnimation);
        this.add(mofiImage);

        // High scores label
        this.highScoresLabel = new Label({
            text: '',
            pos: new Vector(50, 50),
            color: Color.Black,
            font: new Font({
                size: 24,
                family: 'VT323',
                textAlign: TextAlign.Left,
            })
        });
        this.highScoresLabel.anchor.setTo(0, 0);
        this.add(this.highScoresLabel);

        console.log('IntroScene initialized');
    }

    onActivate() {
        // Display high scores
        const highScores = this.getHighScores();
        let highScoresText = 'High Scores:\n';
        highScores.forEach((score, index) => {
            highScoresText += `${index + 1}. ${score.score}\n`;
        });
        this.highScoresLabel.text = highScoresText;

        // Set up the input listener
        this.engine.input.keyboard.off('press'); // Ensure no duplicate listeners
        this.engine.input.keyboard.on('press', (evt) => {
            if (evt.key === 'Enter') {
                this.engine.goToScene('levelOne');
            }
        });

        console.log('IntroScene activated');
    }

    getHighScores() {
        return JSON.parse(localStorage.getItem('highScores')) || [];
    }
}
