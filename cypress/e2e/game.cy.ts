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
    it('should start the a ame with the correct player configurations', () => {
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
  });
}); 