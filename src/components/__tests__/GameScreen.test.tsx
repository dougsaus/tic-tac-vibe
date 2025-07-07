import React from 'react';
import { render } from '@testing-library/react';
import { GameScreen } from '../GameScreen';
import { GameSetupData } from '../../types/game-types';

// Mock Phaser module before it's imported
jest.mock('phaser', () => ({
  AUTO: 'AUTO',
  Game: jest.fn()
}));

// Mock the GameScene module
jest.mock('../../phaser/game', () => ({
  GameScene: class MockGameScene {}
}));

// Define minimal types for our mock
interface MockPhaserGame {
  scene: {
    start: jest.Mock;
  };
  destroy: jest.Mock;
}

interface MockPhaser {
  AUTO: string;
  Game: jest.MockedClass<any> & {
    mockImplementation(fn: () => MockPhaserGame): void;
  };
}

describe('GameScreen', () => {
  let mockSceneStart: jest.Mock;
  let mockGameDestroy: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock functions
    mockSceneStart = jest.fn();
    mockGameDestroy = jest.fn();

    // Setup Phaser.Game mock implementation with minimal typing
    const PhaserMock = jest.requireMock('phaser') as MockPhaser;
    PhaserMock.Game.mockImplementation(() => ({
      scene: {
        start: mockSceneStart
      },
      destroy: mockGameDestroy
    }));
    
    // Make Phaser available globally for the component
    // Using 'any' here is acceptable since we're mocking a global
    (window as any).Phaser = PhaserMock;
  });

  test('should pass AI difficulty to Phaser game scene when starting an AI game', () => {
    // Arrange - Create game setup data with AI player and difficulty set to 'hard'
    const gameSetupData: GameSetupData = {
      player1: {
        name: 'Human Player',
        symbol: '😀',
        color: '#DC3545',
        soundKey: 'happy',
        isAI: false
      },
      player2: {
        name: 'AI Player',
        symbol: '🤖',
        color: '#007BFF',
        soundKey: 'robot',
        isAI: true,
        aiDifficulty: 'hard'
      }
    };

    // Act - Render the GameScreen with AI setup data
    render(<GameScreen gameSetupData={gameSetupData} onNewGame={jest.fn()} />);

    // Assert - Verify scene.start was called with the correct scene name and data
    expect(mockSceneStart).toHaveBeenCalledTimes(1);
    expect(mockSceneStart).toHaveBeenCalledWith('GameScene', gameSetupData);
    
    // Verify the complete gameSetupData was passed, including the aiDifficulty
    const passedData = mockSceneStart.mock.calls[0][1];
    expect(passedData.player2.aiDifficulty).toBe('hard');
  });
});