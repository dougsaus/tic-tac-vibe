/// <reference types="cypress" />

describe('Tic-Tac-Toe Game', () => {
  beforeEach(() => {
    // Visit the page before each test
    cy.visit('http://localhost:8080');
  });

  context('Setup Screen', () => {
    it('should display the setup form with default values on load', () => {
      // Test that the setup form is visible and the game container is hidden
      cy.get('[data-testid="setup-form"]').should('be.visible');
      cy.get('[data-testid="game-container"]').should('not.be.visible');

      // Test that player names default to "Player 1" and "Player 2"
      cy.get('[data-testid="player1-name-input"]').should('have.value', 'Player 1');
      cy.get('[data-testid="player2-name-input"]').should('have.value', 'Player 2');
    });

    it('should allow player configuration to be updated', () => {
      // Test updating player 1's name
      cy.get('[data-testid="player1-name-input"]').clear().type('Alice');
      cy.get('[data-testid="player1-name-input"]').should('have.value', 'Alice');

      // Test updating player 1's symbol
      cy.get('[data-testid="player1-symbol-select"]').select('🚀');
      cy.get('[data-testid="player1-symbol-select"]').should('have.value', '🚀');

      // Test updating player 1's color
      const newColor = '#ff00ff';
      cy.get('[data-testid="player1-color-input"]').invoke('val', newColor).trigger('change');
      cy.get('[data-testid="player1-color-input"]').should('have.value', newColor);
    });

    it('should enforce symbol uniqueness between players', () => {
      // Player 1 selects a symbol
      cy.get('[data-testid="player1-symbol-select"]').select('❤️');

      // Check if that symbol is disabled for Player 2
      cy.get('[data-testid="player2-symbol-select"] option[value="❤️"]').should('be.disabled');

      // Player 2 selects a different symbol
      cy.get('[data-testid="player2-symbol-select"]').select('🍕');

      // Now, check if that new symbol is disabled for Player 1
      cy.get('[data-testid="player1-symbol-select"] option[value="🍕"]').should('be.disabled');
    });

    it('should show an alert and not start if symbols are the same', () => {
        cy.window().then(win => {
            cy.stub(win, 'alert').as('alertStub');
        });
        
        const sharedSymbol = '❤️';
        cy.get('[data-testid="player1-symbol-select"]').select(sharedSymbol);
        cy.get('[data-testid="player2-symbol-select"]').invoke('val', sharedSymbol);

        cy.get('[data-testid="start-game-btn"]').click();
        
        cy.get('@alertStub').should('have.been.calledWith', 'Players cannot choose the same symbol. Please select different symbols.');

        cy.get('[data-testid="setup-form"]').should('be.visible');
        cy.get('[data-testid="game-container"]').should('not.be.visible');
    });
  });

  context('Game Start', () => {
    it('should start the game with the correct player configurations', () => {
      // Configure players with unique symbols
      cy.get('[data-testid="player1-name-input"]').clear().type('Player X');
      cy.get('[data-testid="player1-symbol-select"]').select('❤️');
      
      cy.get('[data-testid="player2-name-input"]').clear().type('Player O');
      cy.get('[data-testid="player2-symbol-select"]').select('🍕');

      // Start the game
      cy.get('[data-testid="start-game-btn"]').click();

      // Assert that the setup form is hidden and the game is visible
      cy.get('[data-testid="setup-form"]').should('not.be.visible');
      cy.get('[data-testid="game-container"]').should('be.visible');
    });
  });

  context('Game Play', () => {
    beforeEach(() => {
      cy.get('[data-testid="player1-name-input"]').clear().type('Player X');
      cy.get('[data-testid="player1-symbol-select"]').select('❤️');
      cy.get('[data-testid="player2-name-input"]').clear().type('Player O');
      cy.get('[data-testid="player2-symbol-select"]').select('🍕');
      cy.get('[data-testid="start-game-btn"]').click();
    });

    it('should display the initial game state correctly', () => {
      cy.get('#phaser-game-container canvas').should('be.visible');
    });
  });
}); 