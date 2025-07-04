import React, { useState, useEffect } from 'react';
import { EMOJI_SOUND_KEY_MAP, GameSetupData } from '../types/game-types';

interface GameSetupScreenProps {
  onStartGame: (data: GameSetupData) => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState('pvp');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player1Symbol, setPlayer1Symbol] = useState('😀');
  const [player1Color, setPlayer1Color] = useState('#DC3545');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [player2Symbol, setPlayer2Symbol] = useState('🌟');
  const [player2Color, setPlayer2Color] = useState('#007BFF');

  const symbolOptions = ['😀', '🚀', '🌟', '❤️', '🎉', '🐱', '🍕', '⚽'];

  useEffect(() => {
    if (gameMode === 'pvai') {
      setPlayer2Name('AI Player');
    } else {
      setPlayer2Name('Player 2');
    }
  }, [gameMode]);

  const handleStartGame = () => {
    if (player1Symbol === player2Symbol) {
      alert('Players cannot choose the same symbol. Please select different symbols.');
      return;
    }

    if (!player1Color || !player2Color) {
      alert('Please select a line color for both players.');
      return;
    }

    const gameSetupData: GameSetupData = {
      player1: { 
        name: player1Name.trim() || 'Player 1', 
        symbol: player1Symbol, 
        color: player1Color, 
        soundKey: EMOJI_SOUND_KEY_MAP[player1Symbol] || 'default_click',
        isAI: false 
      },
      player2: { 
        name: player2Name.trim() || 'Player 2', 
        symbol: player2Symbol, 
        color: player2Color, 
        soundKey: EMOJI_SOUND_KEY_MAP[player2Symbol] || 'default_click',
        isAI: gameMode === 'pvai' 
      }
    };

    onStartGame(gameSetupData);
  };

  const getSymbolOptionText = (symbol: string, takenBy: string | null) => {
    if (takenBy) {
      return `${symbol} - Taken by ${takenBy}`;
    }
    return symbol;
  };

  const isSymbolDisabled = (symbol: string, currentPlayer: 'player1' | 'player2') => {
    if (currentPlayer === 'player1') {
      return symbol === player2Symbol;
    } else {
      return symbol === player1Symbol;
    }
  };

  const getTakenBy = (symbol: string, currentPlayer: 'player1' | 'player2') => {
    if (currentPlayer === 'player1' && symbol === player2Symbol) {
      return player2Name;
    } else if (currentPlayer === 'player2' && symbol === player1Symbol) {
      return player1Name;
    }
    return null;
  };

  return (
    <div className="setup-form">
      <h2>Game Setup</h2>
      <div className="form-group">
        <label htmlFor="gameMode">Game Mode</label>
        <select 
          id="gameMode" 
          value={gameMode} 
          onChange={(e) => setGameMode(e.target.value)}
        >
          <option value="pvp">Player vs Player</option>
          <option value="pvai">Player vs AI</option>
        </select>
      </div>
      <div className="player-inputs">
        <div className="player-column">
          <div className="form-group">
            <label htmlFor="player1Name">Player 1</label>
            <input 
              type="text" 
              id="player1Name" 
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="player1Symbol">Symbol</label>
            <select 
              id="player1Symbol" 
              value={player1Symbol}
              onChange={(e) => setPlayer1Symbol(e.target.value)}
            >
              {symbolOptions.map(symbol => (
                <option 
                  key={symbol} 
                  value={symbol} 
                  disabled={isSymbolDisabled(symbol, 'player1')}
                  style={{ color: isSymbolDisabled(symbol, 'player1') ? '#999999' : '' }}
                >
                  {getSymbolOptionText(symbol, getTakenBy(symbol, 'player1'))}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="player1Color">Line Color</label>
            <input 
              type="color" 
              id="player1Color" 
              value={player1Color}
              onChange={(e) => setPlayer1Color(e.target.value)}
            />
          </div>
        </div>
        <div className="player-column">
          <div className="form-group">
            <label htmlFor="player2Name">Player 2</label>
            <input 
              type="text" 
              id="player2Name" 
              value={player2Name}
              readOnly={gameMode === 'pvai'}
              onChange={(e) => setPlayer2Name(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="player2Symbol">Symbol</label>
            <select 
              id="player2Symbol" 
              value={player2Symbol}
              onChange={(e) => setPlayer2Symbol(e.target.value)}
            >
              {symbolOptions.map(symbol => (
                <option 
                  key={symbol} 
                  value={symbol} 
                  disabled={isSymbolDisabled(symbol, 'player2')}
                  style={{ color: isSymbolDisabled(symbol, 'player2') ? '#999999' : '' }}
                >
                  {getSymbolOptionText(symbol, getTakenBy(symbol, 'player2'))}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="player2Color">Line Color</label>
            <input 
              type="color" 
              id="player2Color" 
              value={player2Color}
              onChange={(e) => setPlayer2Color(e.target.value)}
            />
          </div>
        </div>
      </div>
      <button onClick={handleStartGame}>Start Game</button>
    </div>
  );
};