import 'phaser';
import { type PlayerConfig, type GameSetupData } from './SetupScene';

// Sound keys for generic sounds
const CHEER_SOUND_KEY = 'cheer';
const BOO_SOUND_KEY = 'boo';
const DEFAULT_CLICK_SOUND_KEY = 'default_click'; // For fallback if needed
const SOUND_CLICK = 'click';

interface WinningLineInfo {
    isWin: boolean;
    cells?: { row: number, col: number }[];
}

export class GameScene extends Phaser.Scene {
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

    private drawSound!: Phaser.Sound.BaseSound;
    private winSound!: Phaser.Sound.BaseSound;
    public isReady: boolean = false;

    constructor() {
        super('GameScene');
    }

    public getBoardState(): Readonly<(string | null)[][]> {
        return this.board;
    }

    public getActivePlayerInfo(): Readonly<PlayerConfig> {
        return this.activePlayer;
    }

    public isSceneReady(): boolean {
        return this.isReady;
    }

    public isGameOver(): boolean {
        return this.gameOver;
    }

    public getScores(): { player1: number, player2: number, draws: number } {
        return {
            player1: this.player1Wins,
            player2: this.player2Wins,
            draws: this.draws
        };
    }

    public getWinner(): PlayerConfig | null {
        return this.lastGameWinner;
    }

    private dispatchGameEvent(eventType: string, detail: any = {}) {
        const event = new CustomEvent(eventType, { detail });
        window.dispatchEvent(event);
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
        this.isReady = false;

        // Reset game objects to ensure they are recreated cleanly on scene restart
        this.statusText = undefined!;
        this.newRoundButton = undefined!;
        this.newGameButton = undefined!;
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

    create(data: { player1: PlayerConfig, player2: PlayerConfig, startingPlayer: number }) {
        this.player1 = data.player1;
        this.player2 = data.player2;

        this.sound.unlock(); // Attempt to unlock audio context
        console.log('Audio context unlocked (attempted).');

        this.initializeBoard(); 

        this.add.text(this.cameras.main.width / 2, 50, 'Tic Tac Toe', { 
            fontSize: '32px', 
            color: '#000000',
            fontFamily: '"Poppins", sans-serif' // Use Poppins
        }).setOrigin(0.5);
        this.drawBoard();

        // New Round Button
        this.newRoundButton = this.add.text(this.cameras.main.width / 2 - 80, this.cameras.main.height - 70, 'New Round', {
            fontSize: '20px',
            fontFamily: '"Poppins", sans-serif',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 16, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setVisible(false);
        this.newRoundButton.on('pointerdown', () => this.startNewRound());

        // New Game Button
        this.newGameButton = this.add.text(this.cameras.main.width / 2 + 80, this.cameras.main.height - 70, 'New Game', {
            fontSize: '20px',
            fontFamily: '"Poppins", sans-serif',
            color: '#ffffff',
            backgroundColor: '#28a745',
            padding: { x: 16, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setVisible(false);
        this.newGameButton.on('pointerdown', () => this.startNewGameSetup());

        const scoreTextStyle = { 
            fontSize: '18px', 
            color: '#333333',
            fontFamily: '"Poppins", sans-serif'
        };
        this.player1ScoreText = this.add.text(10, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(0, 0.5);
        this.player2ScoreText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(1, 0.5);
        this.drawsScoreText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 30, '', scoreTextStyle).setOrigin(0.5, 0.5);
        this.updateScoreDisplay();

        this.isReady = true;
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
             this.statusText.setText(`${this.activePlayer.name}'s turn (${this.activePlayer.symbol})`);
        } else {
            this.statusText = this.add.text(this.cameras.main.width / 2, 100, `${this.activePlayer.name}'s turn (${this.activePlayer.symbol})`, 
                { 
                    fontSize: '28px', // Larger font size
                    color: '#000000',
                    fontFamily: '"Poppins", sans-serif' // Use Poppins
                })
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
        const cellFillColor = 0xE9ECEF;
        const cellHoverColor = 0xDCDCDC;

        this.cells = [];
        for (let i = 0; i < 3; i++) {
            this.cells[i] = [];
            for (let j = 0; j < 3; j++) {
                const cellX = boardX + j * cellSize;
                const cellY = boardY + i * cellSize;
                const cell = this.add.rectangle(cellX + cellSize / 2, cellY + cellSize / 2, cellSize, cellSize, cellFillColor)
                    .setStrokeStyle(2, 0xADB5BD) // Softer stroke color
                    .setInteractive();
                
                cell.on('pointerover', () => {
                    if (!this.gameOver && this.board[i][j] === null) {
                        cell.setFillStyle(cellHoverColor);
                    }
                });

                cell.on('pointerout', () => {
                    cell.setFillStyle(cellFillColor);
                });

                cell.on('pointerdown', () => this.handleCellClick(i, j));
                this.cells[i][j] = cell;
            }
        }
    }

    public handleCellClick(row: number, col: number) {
        if (this.gameOver || this.board[row][col] !== null) return;

        const playerMakingMove = this.activePlayer;

        this.board[row][col] = playerMakingMove.symbol;
        const moveText = this.add.text(
            this.cells[row][col].x, 
            this.cells[row][col].y, 
            playerMakingMove.symbol, 
            { fontSize: '64px', color: '#000000' }
        ).setOrigin(0.5);
        this.moveTextObjects.push(moveText);

        // Dispatch that a move was made
        this.dispatchGameEvent('moveMade', {
            player: playerMakingMove,
            position: { row, col }
        });

        // Play sound for the move
        if (playerMakingMove.soundKey) {
            this.sound.play(playerMakingMove.soundKey);
        }

        const winInfo = this.checkWinCondition(row, col);
        if (winInfo.isWin) {
            this.lastGameWinner = this.activePlayer;
            this.statusText.setText(`${this.activePlayer.name} wins!`);
            this.drawWinningLine(winInfo.cells!, this.activePlayer.color);
            this.gameOver = true;
            this.newRoundButton.setVisible(true);
            this.newGameButton.setVisible(true);
            if (this.activePlayer === this.player1) {
                this.player1Wins++;
            } else {
                this.player2Wins++;
            }
            this.updateScoreDisplay();

            // Dispatch a win event
            this.dispatchGameEvent('gameWin', {
                winner: this.activePlayer,
                winningLine: winInfo.cells
            });

            // Play win/boo sounds
            this.sound.play(CHEER_SOUND_KEY);

        } else if (this.checkDrawCondition()) {
            this.statusText.setText("It's a draw!");
            this.gameOver = true;
            this.newRoundButton.setVisible(true);
            this.newGameButton.setVisible(true);
            this.draws++;
            this.updateScoreDisplay();
            this.lastGameWinner = null; // No winner in a draw

            // Dispatch a draw event
            this.dispatchGameEvent('gameDraw');
            // Play boo sound for a draw
            this.sound.play(BOO_SOUND_KEY);
        } else {
            this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;
            this.statusText.setText(`${this.activePlayer.name}'s turn (${this.activePlayer.symbol})`);
        }
    }

    checkWinCondition(lastRow: number, lastCol: number): WinningLineInfo {
        const symbol = this.board[lastRow][lastCol];
        let winningCells: { row: number, col: number }[] = [];
        if (this.board[lastRow][0] === symbol && this.board[lastRow][1] === symbol && this.board[lastRow][2] === symbol) {
            winningCells = [{row: lastRow, col: 0}, {row: lastRow, col: 1}, {row: lastRow, col: 2}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][lastCol] === symbol && this.board[1][lastCol] === symbol && this.board[2][lastCol] === symbol) {
            winningCells = [{row: 0, col: lastCol}, {row: 1, col: lastCol}, {row: 2, col: lastCol}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][0] === symbol && this.board[1][1] === symbol && this.board[2][2] === symbol) {
            winningCells = [{row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}];
            return { isWin: true, cells: winningCells };
        }
        if (this.board[0][2] === symbol && this.board[1][1] === symbol && this.board[2][0] === symbol) {
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
        
        const lineColor = Phaser.Display.Color.ValueToColor(color).color;
        
        const line = new Phaser.Geom.Line(firstCellPos.x, firstCellPos.y, firstCellPos.x, firstCellPos.y);

        this.tweens.add({
            targets: line,
            x2: lastCellPos.x,
            y2: lastCellPos.y,
            duration: 250,
            ease: 'Power1',
            onUpdate: () => {
                if (this.winningLineGraphic) {
                    this.winningLineGraphic.clear();
                    this.winningLineGraphic.lineStyle(5, lineColor, 1);
                    this.winningLineGraphic.strokeLineShape(line);
                }
            }
        });
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

    public startNewRound() { // Renamed from restartGame
        this.initializeBoard();
    }

    public startNewGameSetup() {
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

declare global {
    interface Window {
      phaserGame: Phaser.Game;
    }
}

window.onload = () => {
    const game = new Phaser.Game(config);
    window.phaserGame = game;
}; 