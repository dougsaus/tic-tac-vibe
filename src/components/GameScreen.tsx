import React, { useEffect, useRef } from 'react';
import 'phaser';
import { GameScene } from '../phaser/game';
import { GameSetupData } from '../types/game-types';

interface GameScreenProps {
  gameSetupData: GameSetupData;
  onNewGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameSetupData, onNewGame }) => {
  const phaserContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!phaserContainerRef.current || gameRef.current) {
      return;
    }

    // Create Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      parent: phaserContainerRef.current,
      scene: [GameScene]
    };

    // Create the game
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Start the game scene directly with setup data
    game.scene.start('GameScene', gameSetupData);

    // Listen for new game event
    const handleNewGameEvent = () => {
      onNewGame();
    };
    
    window.addEventListener('newGameRequested', handleNewGameEvent);

    // Store game reference on window for testing
    const globalWindow = window as Window & { phaserGame?: Phaser.Game };
    globalWindow.phaserGame = game;

    // Cleanup
    return () => {
      window.removeEventListener('newGameRequested', handleNewGameEvent);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameSetupData, onNewGame]);

  return (
    <div 
      ref={phaserContainerRef} 
      id="phaser-game-container"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    />
  );
};