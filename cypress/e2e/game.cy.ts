/// <reference types="cypress" />

import { GameScene } from '../../src/game';

declare global {
  interface Window {
    gameScene: GameScene;
  }
}

describe('Tic-Tac-Toe Game', () => {
  beforeEach(() => {
    // Visit the page before each test
    cy.visit('http://localhost:8080');
  });

  context('Setup Screen', () => {
    it('should display the setup form with default values on load', () => {
      // Test that the setup form is visible and the game container is hidden
      cy.findByRole('heading', { name: /game setup/i }).should('be.visible');
      cy.get('#phaser-game-container').should('not.be.visible');

      // Test that player names default to "Player 1" and "Player 2"
      cy.findByLabelText(/player 1/i).should('have.value', 'Player 1');
      cy.findByLabelText(/player 2/i).should('have.value', 'Player 2');
    });

    it('should display game mode selector with Player vs Player as default', () => {
      // Test that game mode selector is visible
      cy.findByLabelText(/game mode/i).should('be.visible');
      
      // Test that default value is Player vs Player
      cy.findByLabelText(/game mode/i).should('have.value', 'pvp');
      
      // Test that Player vs AI option exists
      cy.findByLabelText(/game mode/i).within(() => {
        cy.findByRole('option', { name: /player vs ai/i }).should('exist');
      });
    });

    it('should update player 2 to AI Player when Player vs AI mode is selected', () => {
      // Wait for the Phaser game to be loaded
      cy.window().should('have.property', 'phaserGame');
      
      // Wait for the setup form to be visible (SetupScene shows it)
      cy.get('#setupForm').should('be.visible');
      
      // Initially Player 2 name should be editable with default value
      cy.findByLabelText(/player 2/i).should('have.value', 'Player 2');
      cy.findByLabelText(/player 2/i).should('not.have.attr', 'readonly');
      
      // Select Player vs AI mode
      cy.findByLabelText(/game mode/i).select('pvai');
      
      // Check that the field becomes readonly (this is the main requirement)
      cy.findByLabelText(/player 2/i).should('have.attr', 'readonly');
      cy.findByLabelText(/player 2/i).should('have.value', 'AI Player');
      
      // Verify the game mode value is correct
      cy.findByLabelText(/game mode/i).should('have.value', 'pvai');
      
      // Switch back to Player vs Player mode
      cy.findByLabelText(/game mode/i).select('pvp');
      
      // Player 2 name should be editable again
      cy.findByLabelText(/player 2/i).should('not.have.attr', 'readonly');
      cy.findByLabelText(/player 2/i).should('have.value', 'Player 2');
    });

    it('should allow player configuration to be updated', () => {
      // Test updating player 1's name
      cy.findByLabelText(/player 1/i).clear().type('Alice');
      cy.findByLabelText(/player 1/i).should('have.value', 'Alice');

      // Test updating player 1's symbol
      cy.findAllByLabelText(/^symbol$/i).first().select('🚀');
      cy.findAllByLabelText(/^symbol$/i).first().should('have.value', '🚀');

      // Test updating player 1's color
      const newColor = '#ff00ff';
      cy.findAllByLabelText(/line color/i).first().invoke('val', newColor).trigger('change');
      cy.findAllByLabelText(/line color/i).first().should('have.value', newColor);
    });

    it('should enforce symbol uniqueness between players', () => {
      // Player 1 selects a symbol
      cy.findAllByLabelText(/^symbol$/i).first().select('❤️');

      // Check if that symbol is disabled for Player 2
      cy.findAllByLabelText(/^symbol$/i).eq(1).find('option[value="❤️"]').should('be.disabled');

      // Player 2 selects a different symbol
      cy.findAllByLabelText(/^symbol$/i).eq(1).select('🍕');

      // Now, check if that new symbol is disabled for Player 1
      cy.findAllByLabelText(/^symbol$/i).first().find('option[value="🍕"]').should('be.disabled');
    });

    it('should show an alert and not start if symbols are the same', () => {
        cy.window().then(win => {
            cy.stub(win, 'alert').as('alertStub');
        });
        
        const sharedSymbol = '❤️';
        cy.findAllByLabelText(/^symbol$/i).first().select(sharedSymbol);
        cy.findAllByLabelText(/^symbol$/i).eq(1).invoke('val', sharedSymbol);

        cy.findByRole('button', { name: /start game/i }).click();
        
        cy.get('@alertStub').should('have.been.calledWith', 'Players cannot choose the same symbol. Please select different symbols.');

        cy.findByRole('heading', { name: /game setup/i }).should('be.visible');
        cy.get('#phaser-game-container').should('not.be.visible');
    });
  });

  context('Game Start', () => {
    it('should start the game with the correct player configurations', () => {
      // Configure players with unique symbols
      cy.findByLabelText(/player 1/i).clear().type('Player X');
      cy.findAllByLabelText(/^symbol$/i).first().select('❤️');
      
      cy.findByLabelText(/player 2/i).clear().type('Player O');
      cy.findAllByLabelText(/^symbol$/i).eq(1).select('🍕');

      // Start the game
      cy.findByRole('button', { name: /start game/i }).click();

      // Assert that the setup form is hidden and the game is visible
      cy.findByRole('heading', { name: /game setup/i }).should('not.exist');
      cy.get('#phaser-game-container').should('be.visible');
    });
  });

  context('Game Play', () => {
    beforeEach(() => {
      cy.findByLabelText(/player 1/i).clear().type('Player X');
      cy.findAllByLabelText(/^symbol$/i).first().select('❤️');
      cy.findByLabelText(/player 2/i).clear().type('Player O');
      cy.findAllByLabelText(/^symbol$/i).eq(1).select('🍕');
      cy.findByRole('button', { name: /start game/i }).click();
    });

    it('should display the initial game state correctly', () => {
      cy.get('#phaser-game-container canvas').should('be.visible');
    });

    it('should update game state when clicking a cell', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        // Wait until the scene reports that it is ready
        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        // Now that the scene is ready, proceed with the test
        cy.then(() => {
            // 1. Check initial state
            const initialPlayer = gameScene.getActivePlayerInfo();
            expect(initialPlayer.name).to.equal('Player X');

            // 2. Directly call the move handler
            gameScene.handleCellClick(1, 1);

            // 3. Assert the new state
            const boardState = gameScene.getBoardState();
            const currentPlayer = gameScene.getActivePlayerInfo();
            expect(boardState[1][1]).to.equal('❤️');
            expect(currentPlayer.name).to.equal('Player O');
        });
      });
    });

    it('should correctly handle a win condition', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        // Wait for the scene to be ready before interacting
        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // Player 1 (X) moves
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 2); // X (wins)

          // Assert game over state
          expect(gameScene.isGameOver()).to.be.true;

          // Assert winner by using the new dedicated getter
          const winner = gameScene.getWinner();
          expect(winner).to.not.be.null;
          expect(winner?.name).to.equal('Player X');
          
          // Assert score update
          const scores = gameScene.getScores();
          expect(scores.player1).to.equal(1);
          expect(scores.player2).to.equal(0);
        });
      });
    });

    it('should correctly handle a draw condition', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        // Wait for the scene to be ready
        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // A sequence of moves that results in a draw
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(0, 2); // O
          gameScene.handleCellClick(2, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(1, 2); // X
          gameScene.handleCellClick(2, 1); // O
          gameScene.handleCellClick(2, 2); // X (Draw)

          // Assert game over state
          expect(gameScene.isGameOver()).to.be.true;

          // Assert there is no winner
          expect(gameScene.getWinner()).to.be.null;

          // Assert score update for a draw
          const scores = gameScene.getScores();
          expect(scores.draws).to.equal(1);
          expect(scores.player1).to.equal(0);
          expect(scores.player2).to.equal(0);
        });
      });
    });

    it('should reset for a new round, making the loser the new active player', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // 1. Create a win condition to make the button appear
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 2); // X (wins)

          // Sanity check that the game is over and score is updated
          expect(gameScene.isGameOver()).to.be.true;
          expect(gameScene.getScores().player1).to.equal(1);

          // 2. Start a new round
          gameScene.startNewRound();

          // 3. Assert the game state is reset
          expect(gameScene.isGameOver()).to.be.false;
          
          // Assert that the loser (Player 2) is now the active player
          const newActivePlayer = gameScene.getActivePlayerInfo();
          expect(newActivePlayer.name).to.equal('Player O');

          const boardState = gameScene.getBoardState();
          // Check that all cells are null (empty)
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              expect(boardState[i][j]).to.be.null;
            }
          }

          // 4. Assert that scores are preserved
          const scores = gameScene.getScores();
          expect(scores.player1).to.equal(1);
          expect(scores.player2).to.equal(0);
          expect(scores.draws).to.equal(0);
        });
      });
    });

    it('should return to the setup screen for a new game', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // 1. Create a win condition to make the button appear
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 2); // X (wins)

          // 2. Start a new game
          gameScene.startNewGameSetup();

          // 3. Assert that the UI has reverted to the setup screen
          cy.get('#setupForm').should('be.visible');
          cy.findByRole('heading', { name: /game setup/i }).should('be.visible');
          cy.get('#phaser-game-container canvas').should('not.be.visible');
        });
      });
    });

    it('should reset scores to zero when starting a new game', () => {
      cy.window().then((win) => {
        let game = (win as any).phaserGame;
        let gameScene = game.scene.getScene('GameScene') as GameScene;

        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // 1. Win a game to get a non-zero score
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 2); // X (wins)
          expect(gameScene.getScores().player1).to.equal(1);

          // 2. Go back to the setup screen
          gameScene.startNewGameSetup();
          cy.get('#setupForm').should('be.visible');

          // 3. Start a new game from the setup screen
          cy.findByRole('button', { name: /start game/i }).click();
          cy.get('#phaser-game-container canvas').should('be.visible');

          // 4. Get the new scene and verify the scores are reset
          game = (win as any).phaserGame;
          gameScene = game.scene.getScene('GameScene') as GameScene;
          cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());
          cy.then(() => {
            const scores = gameScene.getScores();
            expect(scores.player1).to.equal(0);
            expect(scores.player2).to.equal(0);
            expect(scores.draws).to.equal(0);
          });
        });
      });
    });

    it('should reset for a new round, making the loser the new active player', () => {
      cy.window().then((win) => {
        const game = (win as any).phaserGame;
        const gameScene = game.scene.getScene('GameScene') as GameScene;

        cy.wrap(gameScene).should('satisfy', (scene: GameScene) => scene.isSceneReady());

        cy.then(() => {
          // 1. Create a win condition to make the button appear
          gameScene.handleCellClick(0, 0); // X
          gameScene.handleCellClick(1, 0); // O
          gameScene.handleCellClick(0, 1); // X
          gameScene.handleCellClick(1, 1); // O
          gameScene.handleCellClick(0, 2); // X (wins)

          // Sanity check that the game is over and score is updated
          expect(gameScene.isGameOver()).to.be.true;
          expect(gameScene.getScores().player1).to.equal(1);

          // 2. Start a new round
          gameScene.startNewRound();

          // 3. Assert the game state is reset
          expect(gameScene.isGameOver()).to.be.false;
          
          // Assert that the loser (Player 2) is now the active player
          const newActivePlayer = gameScene.getActivePlayerInfo();
          expect(newActivePlayer.name).to.equal('Player O');

          const boardState = gameScene.getBoardState();
          // Check that all cells are null (empty)
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              expect(boardState[i][j]).to.be.null;
            }
          }

          // 4. Assert that scores are preserved
          const scores = gameScene.getScores();
          expect(scores.player1).to.equal(1);
          expect(scores.player2).to.equal(0);
          expect(scores.draws).to.equal(0);
        });
      });
    });
  });
}); 