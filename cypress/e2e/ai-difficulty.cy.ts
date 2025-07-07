/// <reference types="cypress" />

describe('AI Difficulty Integration', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
  });

  it('should pass selected AI difficulty to the AI player when starting a game', () => {
    // Select Player vs AI mode
    cy.findByLabelText(/game mode/i).select('pvai');
    
    // Select "hard" difficulty
    cy.findByLabelText(/ai difficulty/i).select('hard');
    
    // Start the game
    cy.findByRole('button', { name: /start game/i }).click();
    
    // Wait for game to initialize and verify AI player
    cy.window().then((win) => {
      const game = (win as any).phaserGame;
      const scene = game.scene.getScene('GameScene') as any;
      
      // Wait for scene to be ready
      cy.wrap(scene).should('satisfy', (s: any) => s.isSceneReady());
      
      // Verify the AI player exists
      cy.wrap(scene.aiPlayer).should('exist');
      
      // Verify the AI player has the correct difficulty
      // This will fail initially because we haven't implemented getDifficulty
      cy.wrap(scene.aiPlayer.getDifficulty()).should('equal', 'hard');
    });
  });
});