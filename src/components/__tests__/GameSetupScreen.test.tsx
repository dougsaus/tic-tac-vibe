import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameSetupScreen } from '../GameSetupScreen';

// This describes a group of related tests
describe('GameSetupScreen', () => {
  // Create a fake function to capture when "Start Game" is clicked
  const mockOnStartGame = jest.fn();

  // Before each test, clear any previous test data
  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  // This is our actual test - it reads like a user story!
  test('should show AI difficulty selector when Player vs AI mode is selected', async () => {
    // Set up a virtual user who can interact with our component
    const user = userEvent.setup();
    
    // Draw the GameSetupScreen component on a virtual screen
    render(<GameSetupScreen onStartGame={mockOnStartGame} />);

    // Check that difficulty selector is NOT visible initially
    expect(screen.getByLabelText('AI Difficulty')).not.toBeVisible();

    // Find the "Game Mode" dropdown by its label text
    const gameModeSelect = screen.getByLabelText('Game Mode');
    
    // Have our virtual user select "Player vs AI" option
    await user.selectOptions(gameModeSelect, 'pvai');

    // Now check that the difficulty selector IS visible
    expect(screen.getByLabelText('AI Difficulty')).toBeVisible();
    
    // Get the difficulty dropdown
    const difficultySelect = screen.getByLabelText('AI Difficulty');
    
    // Check it starts with 'medium' selected
    expect(difficultySelect).toHaveValue('medium');
    
    // Check all three difficulty options are visible
    expect(screen.getByRole('option', { name: 'Easy' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Hard' })).toBeVisible();
  });

  test('should include AI difficulty in game setup data when starting AI game', async () => {
    const user = userEvent.setup();
    render(<GameSetupScreen onStartGame={mockOnStartGame} />);

    // Switch to Player vs AI mode
    const gameModeSelect = screen.getByLabelText('Game Mode');
    await user.selectOptions(gameModeSelect, 'pvai');

    // Change difficulty to Hard
    const difficultySelect = screen.getByLabelText('AI Difficulty');
    await user.selectOptions(difficultySelect, 'hard');

    // Click Start Game button
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    await user.click(startButton);

    // Check that onStartGame was called with correct data
    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    
    // Get the data that was passed to onStartGame
    const gameSetupData = mockOnStartGame.mock.calls[0][0];
    
    // Check that player2 is AI with correct difficulty
    expect(gameSetupData.player2.isAI).toBe(true);
    expect(gameSetupData.player2.aiDifficulty).toBe('hard');
  });

  test('should hide AI difficulty selector and not include difficulty when switching back to PvP mode', async () => {
    const user = userEvent.setup();
    render(<GameSetupScreen onStartGame={mockOnStartGame} />);

    // First switch to Player vs AI mode
    const gameModeSelect = screen.getByLabelText('Game Mode');
    await user.selectOptions(gameModeSelect, 'pvai');

    // Verify difficulty selector is visible
    expect(screen.getByLabelText('AI Difficulty')).toBeVisible();

    // Switch back to Player vs Player mode
    await user.selectOptions(gameModeSelect, 'pvp');

    // Verify difficulty selector is no longer visible
    expect(screen.getByLabelText('AI Difficulty')).not.toBeVisible();

    // Verify Player 2 name field is editable again
    const player2NameInput = screen.getByLabelText('Player 2') as HTMLInputElement;
    expect(player2NameInput).not.toHaveAttribute('readonly');
    expect(player2NameInput.value).toBe('Player 2');

    // Start the game and verify no AI properties are included
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    await user.click(startButton);

    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    const gameSetupData = mockOnStartGame.mock.calls[0][0];
    
    // Check that player2 is NOT AI and has no difficulty
    expect(gameSetupData.player2.isAI).toBe(false);
    expect(gameSetupData.player2.aiDifficulty).toBeUndefined();
  });

  test('should preserve AI difficulty selection when toggling between game modes', async () => {
    const user = userEvent.setup();
    render(<GameSetupScreen onStartGame={mockOnStartGame} />);

    const gameModeSelect = screen.getByLabelText('Game Mode');

    // Switch to AI mode
    await user.selectOptions(gameModeSelect, 'pvai');

    // Select "easy" difficulty
    const difficultySelect = screen.getByLabelText('AI Difficulty');
    await user.selectOptions(difficultySelect, 'easy');
    expect(difficultySelect).toHaveValue('easy');

    // Switch to PvP mode
    await user.selectOptions(gameModeSelect, 'pvp');

    // Switch back to AI mode
    await user.selectOptions(gameModeSelect, 'pvai');

    // Verify difficulty is still "easy"
    expect(screen.getByLabelText('AI Difficulty')).toHaveValue('easy');
  });
});