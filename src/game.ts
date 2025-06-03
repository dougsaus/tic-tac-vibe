import 'phaser';
import { type GameSetupData, type PlayerConfig } from './SetupScene'; // PlayerConfig.symbol is now string

// Sound keys for generic sounds
const CHEER_SOUND_KEY = 'cheer';
const BOO_SOUND_KEY = 'boo';
const DEFAULT_CLICK_SOUND_KEY = 'default_click'; // For fallback if needed

interface WinningLineInfo {
    isWin: boolean;
    cells?: { row: number, col: number }[];
}

class GameScene extends Phaser.Scene {
    private player1!: PlayerConfig;
    private player2!: PlayerConfig;
    private activePlayer!: PlayerConfig;
    private board: (string | null)[][] = []; // Stores emoji symbols as strings
    private statusText!: Phaser.GameObjects.Text;
    private cells: Phaser.GameObjects.Rectangle[][] = [];
    private gameOver: boolean = false;
    private newRoundButton!: Phaser.GameObjects.Text; // Renamed from restartButton
    private newGameButton!: Phaser.GameObjects.Text; // Added New Game button
    private moveTextObjects: Phaser.GameObjects.Text[] = [];
    private winningLineGraphic: Phaser.GameObjects.Graphics | null = null;

    private currentPlayerWhoStartedThisGame!: PlayerConfig;
    private lastGameWinner: PlayerConfig | null = null;
    private isBoardInitializedOnce: boolean = false;

    private player1Wins: number = 0;
    private player2Wins: number = 0;
    private draws: number = 0;

    private player1ScoreText!: Phaser.GameObjects.Text;
    private player2ScoreText!: Phaser.GameObjects.Text;
    private drawsScoreText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    init(data: GameSetupData) {
        this.player1 = data.player1;
        this.player2 = data.player2;

        // Player 1 always starts the very first game of a session.
        this.activePlayer = this.player1; 

        this.isBoardInitializedOnce = false;
        this.lastGameWinner = null;
        this.player1Wins = 0;
        this.player2Wins = 0;
        this.draws = 0;
    }

    preload() {
        console.log('Preloading sounds...');

        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            if (file.type === 'audio') {
                console.error(`Error loading audio: ${file.key} - URL: ${file.url}`, file);
            }
        });
         // Event listener for individual file load success (for debugging)
        this.load.on('filecomplete', (key: string, type: string) => {
            if (type === 'audio') {
                console.log(`Audio file loaded successfully: ${key}`);
            }
        });

        if (this.player1 && this.player1.soundKey) {
            const p1SoundKey = this.player1.soundKey;
            this.load.audio(p1SoundKey, [
                `/assets/sounds/${p1SoundKey}.ogg`,
                `/assets/sounds/${p1SoundKey}.mp3`
            ]);
            console.log(`Attempting to load sound for ${this.player1.name} (key: ${p1SoundKey}): /assets/sounds/${p1SoundKey}.ogg, /assets/sounds/${p1SoundKey}.mp3`);
        }
        if (this.player2 && this.player2.soundKey) {
            const p2SoundKey = this.player2.soundKey;
            this.load.audio(p2SoundKey, [
                `/assets/sounds/${p2SoundKey}.ogg`,
                `/assets/sounds/${p2SoundKey}.mp3`
            ]);
            console.log(`Attempting to load sound for ${this.player2.name} (key: ${p2SoundKey}): /assets/sounds/${p2SoundKey}.ogg, /assets/sounds/${p2SoundKey}.mp3`);
        }

        // For generic sounds, also provide ogg and mp3 fallbacks
        this.load.audio(CHEER_SOUND_KEY, ['/assets/sounds/cheer.ogg', '/assets/sounds/cheer.mp3']);
        console.log(`Attempting to load sound (key: ${CHEER_SOUND_KEY}): /assets/sounds/cheer.ogg, /assets/sounds/cheer.mp3`);
        this.load.audio(BOO_SOUND_KEY, ['/assets/sounds/boo.ogg', '/assets/sounds/boo.mp3']);
        console.log(`Attempting to load sound (key: ${BOO_SOUND_KEY}): /assets/sounds/boo.ogg, /assets/sounds/boo.mp3`);
        this.load.audio(DEFAULT_CLICK_SOUND_KEY, ['/assets/sounds/default_click.ogg', '/assets/sounds/default_click.mp3']); 
        console.log(`Attempting to load sound (key: ${DEFAULT_CLICK_SOUND_KEY}): /assets/sounds/default_click.ogg, /assets/sounds/default_click.mp3`);
    }

    create() {
        this.sound.unlock(); // Attempt to unlock audio context
        console.log('Audio context unlocked (attempted).');

        this.initializeBoard(); 

        this.add.text(this.cameras.main.width / 2, 50, 'Tic Tac Toe', { fontSize: '32px', color: '#000000' }).setOrigin(0.5);
        this.drawBoard();

        // New Round Button (formerly Restart Game)
        this.newRoundButton = this.add.text(this.cameras.main.width / 2 - 70, this.cameras.main.height - 70, 'New Round', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setVisible(false);
        this.newRoundButton.on('pointerdown', () => this.startNewRound());

        // New Game Button
        this.newGameButton = this.add.text(this.cameras.main.width / 2 + 70, this.cameras.main.height - 70, 'New Game', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#28a745', // Green color for New Game
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setVisible(false);
        this.newGameButton.on('pointerdown', () => this.startNewGameSetup());

        const scoreTextStyle = { fontSize: '18px', color: '#333333' };
        this.player1ScoreText = this.add.text(10, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(0, 0.5);
        this.player2ScoreText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(1, 0.5);
        this.drawsScoreText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(0.5, 0.5);
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        if (!this.player1 || !this.player2) return;
        this.player1ScoreText.setText(`${this.player1.name} (${this.player1.symbol}): ${this.player1Wins}`);
        this.player2ScoreText.setText(`${this.player2.name} (${this.player2.symbol}): ${this.player2Wins}`);
        this.drawsScoreText.setText(`Draws: ${this.draws}`);
    }

    initializeBoard() {
        const oldGameOverState = this.gameOver;
        const previousGameWinner = this.lastGameWinner;
        this.board = [[null, null, null], [null, null, null], [null, null, null]];
        this.gameOver = false;

        this.moveTextObjects.forEach(textObj => textObj.destroy());
        this.moveTextObjects = [];
        if (this.winningLineGraphic) {
            this.winningLineGraphic.destroy();
            this.winningLineGraphic = null;
        }

        if (!this.isBoardInitializedOnce) {
            // this.activePlayer is already set to player1 in init() for the very first game.
            this.currentPlayerWhoStartedThisGame = this.activePlayer;
            this.isBoardInitializedOnce = true;
        } else {
            if (oldGameOverState && previousGameWinner) {
                this.activePlayer = (previousGameWinner === this.player1) ? this.player2 : this.player1;
            } else if (oldGameOverState) {
                this.activePlayer = (this.currentPlayerWhoStartedThisGame === this.player1) ? this.player2 : this.player1;
            } else {
                this.activePlayer = (this.currentPlayerWhoStartedThisGame === this.player1) ? this.player2 : this.player1;
            }
            this.currentPlayerWhoStartedThisGame = this.activePlayer;
        }
        this.lastGameWinner = null;

        if (this.statusText) {
             this.statusText.setText(`${this.activePlayer.name}\'s turn (${this.activePlayer.symbol})`);
        } else {
            this.statusText = this.add.text(this.cameras.main.width / 2, 100, `${this.activePlayer.name}\'s turn (${this.activePlayer.symbol})`, 
                { fontSize: '24px', color: '#000000' })
                .setOrigin(0.5);
        }

        if (this.newRoundButton) this.newRoundButton.setVisible(false);
        if (this.newGameButton) this.newGameButton.setVisible(false);
        // Score display updated via updateScoreDisplay() when scores change or on create.
    }

    drawBoard() {
        const boardSize = 300;
        const cellSize = boardSize / 3;
        const boardX = (this.cameras.main.width - boardSize) / 2;
        const boardY = (this.cameras.main.height - boardSize) / 2;
        this.cells = [];
        for (let i = 0; i < 3; i++) {
            this.cells[i] = [];
            for (let j = 0; j < 3; j++) {
                const cellX = boardX + j * cellSize;
                const cellY = boardY + i * cellSize;
                const cell = this.add.rectangle(cellX + cellSize / 2, cellY + cellSize / 2, cellSize, cellSize, 0xcccccc)
                    .setStrokeStyle(2, 0x000000)
                    .setInteractive();
                cell.on('pointerdown', () => this.handleCellClick(i, j));
                this.cells[i][j] = cell;
            }
        }
    }

    handleCellClick(row: number, col: number) {
        if (this.gameOver || this.board[row][col] !== null) return;

        this.board[row][col] = this.activePlayer.symbol;
        // Emojis have their own color, player.color is for the line.
        // Font size for emojis might need to be larger for visibility.
        const moveText = this.add.text(
            this.cells[row][col].x, 
            this.cells[row][col].y, 
            this.activePlayer.symbol, 
            { fontSize: '64px', /* Increased font size for emojis */ color: '#000000' } // Default black for emoji rendering
        ).setOrigin(0.5);
        this.moveTextObjects.push(moveText);

        // Play sound using this.sound.play(key) directly
        if (this.activePlayer.soundKey) {
            if (this.sound.play(this.activePlayer.soundKey)) {
                console.log(`Played sound: ${this.activePlayer.soundKey}`);
            } else {
                console.warn(`Failed to play sound. Key '${this.activePlayer.soundKey}' for player symbol not found in cache or sound system error.`);
                // Additional check for debugging
                if (!this.sound.get(this.activePlayer.soundKey)) {
                    console.warn(`Follow-up check: this.sound.get('${this.activePlayer.soundKey}') also confirms key is not in cache.`);
                }
            }
        } else {
            console.warn(`No soundKey defined for player '${this.activePlayer.name}'. No sound played for symbol.`);
        }

        const winInfo = this.checkWinCondition(row, col);
        if (winInfo.isWin && winInfo.cells) {
            this.statusText.setText(`${this.activePlayer.name} wins!`);
            this.gameOver = true;
            this.lastGameWinner = this.activePlayer;
            if (this.activePlayer === this.player1) this.player1Wins++; else this.player2Wins++;
            this.updateScoreDisplay();
            this.drawWinningLine(winInfo.cells, this.activePlayer.color);
            this.newRoundButton.setVisible(true);
            this.newGameButton.setVisible(true);
            
            if (this.sound.play(CHEER_SOUND_KEY)) {
                console.log(`Played sound: ${CHEER_SOUND_KEY}`);
            } else {
                console.warn(`Failed to play sound. Key '${CHEER_SOUND_KEY}' not found or sound system error.`);
                if (!this.sound.get(CHEER_SOUND_KEY)) {
                    console.warn(`Follow-up check: this.sound.get('${CHEER_SOUND_KEY}') also confirms key is not in cache.`);
                }
            }
            return;
        }

        if (this.checkDrawCondition()) {
            this.statusText.setText('It\'s a draw!');
            this.gameOver = true;
            this.lastGameWinner = null;
            this.draws++;
            this.updateScoreDisplay();
            this.newRoundButton.setVisible(true);
            this.newGameButton.setVisible(true);

            if (this.sound.play(BOO_SOUND_KEY)) {
                console.log(`Played sound: ${BOO_SOUND_KEY}`);
            } else {
                console.warn(`Failed to play sound. Key '${BOO_SOUND_KEY}' not found or sound system error.`);
                if (!this.sound.get(BOO_SOUND_KEY)) {
                    console.warn(`Follow-up check: this.sound.get('${BOO_SOUND_KEY}') also confirms key is not in cache.`);
                }
            }
            return;
        }

        this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;
        this.statusText.setText(`${this.activePlayer.name}\'s turn (${this.activePlayer.symbol})`);
    }

    checkWinCondition(lastRow: number, lastCol: number): WinningLineInfo {
        const playerSymbol = this.activePlayer.symbol;
        let winningCells: { row: number, col: number }[] = [];
        if (this.board[lastRow][0] === playerSymbol && this.board[lastRow][1] === playerSymbol && this.board[lastRow][2] === playerSymbol) {
            winningCells = [{row: lastRow, col: 0}, {row: lastRow, col: 1}, {row: lastRow, col: 2}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][lastCol] === playerSymbol && this.board[1][lastCol] === playerSymbol && this.board[2][lastCol] === playerSymbol) {
            winningCells = [{row: 0, col: lastCol}, {row: 1, col: lastCol}, {row: 2, col: lastCol}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][0] === playerSymbol && this.board[1][1] === playerSymbol && this.board[2][2] === playerSymbol) {
            winningCells = [{row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][2] === playerSymbol && this.board[1][1] === playerSymbol && this.board[2][0] === playerSymbol) {
            winningCells = [{row: 0, col: 2}, {row: 1, col: 1}, {row: 2, col: 0}];
            return { isWin: true, cells: winningCells };
        }
        return { isWin: false };
    }

    drawWinningLine(winningCells: { row: number, col: number }[], color: string) {
        if (winningCells.length < 3) return;
        const firstCellPos = this.cells[winningCells[0].row][winningCells[0].col].getCenter();
        const lastCellPos = this.cells[winningCells[2].row][winningCells[2].col].getCenter();
        if (this.winningLineGraphic) {
            this.winningLineGraphic.destroy();
        }
        this.winningLineGraphic = this.add.graphics();
        const lineColor = parseInt(color.substring(1), 16);
        this.winningLineGraphic.lineStyle(5, lineColor, 1);
        this.winningLineGraphic.beginPath();
        this.winningLineGraphic.moveTo(firstCellPos.x, firstCellPos.y);
        this.winningLineGraphic.lineTo(lastCellPos.x, lastCellPos.y);
        this.winningLineGraphic.closePath();
        this.winningLineGraphic.strokePath();
    }

    checkDrawCondition(): boolean {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    startNewRound() { // Renamed from restartGame
        this.initializeBoard();
    }

    startNewGameSetup() {
        // Scores are reset when SetupScene starts and calls this scene's init() method.
        this.scene.start('SetupScene');
    }

    update() {}
}

import { SetupScene } from './SetupScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    parent: 'phaser-game-container',
    scene: [SetupScene, GameScene]
};

window.onload = () => {
    const game = new Phaser.Game(config);
}; 