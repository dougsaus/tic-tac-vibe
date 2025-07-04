import React, { useState } from 'react';
import { GameSetupScreen } from './components/GameSetupScreen';
import { GameScreen } from './components/GameScreen';
import { GameSetupData } from './types/game-types';

export const App: React.FC = () => {
  const [gameSetupData, setGameSetupData] = useState<GameSetupData | null>(null);
  const [showSetup, setShowSetup] = useState(true);

  const handleStartGame = (data: GameSetupData) => {
    setGameSetupData(data);
    setShowSetup(false);
  };

  const handleNewGame = () => {
    setShowSetup(true);
    setGameSetupData(null);
  };

  return (
    <>
      {showSetup ? (
        <GameSetupScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen 
          gameSetupData={gameSetupData!} 
          onNewGame={handleNewGame}
        />
      )}
    </>
  );
};