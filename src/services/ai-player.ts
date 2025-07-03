import { AIConfigLoader } from './ai-config-loader';
import { AIMove, DifficultyLevel, AIProvider, AIDifficulty } from '../types/ai-config';

export class AIPlayer {
  private configLoader: AIConfigLoader;
  private difficulty: DifficultyLevel = 'medium'; // Default to medium difficulty

  constructor() {
    this.configLoader = AIConfigLoader.getInstance();
  }

  public async initialize(): Promise<void> {
    await this.configLoader.loadConfig();
  }

  public async getMove(board: (string | null)[][], playerSymbol: string, opponentSymbol: string): Promise<AIMove> {
    const provider = this.configLoader.getAvailableProvider();
    
    if (!provider) {
      console.warn('No AI provider available, using fallback move');
      return this.getFallbackMove(board);
    }

    try {
      const config = this.configLoader.getConfig();
      const providerConfig = config.providers[provider];
      const difficultyConfig = config.difficulties[this.difficulty];
      
      // Format board state for AI
      const boardState = this.formatBoardState(board, playerSymbol, opponentSymbol);
      
      // Create the prompt
      const userPrompt = `Current Tic-Tac-Toe board state (0-indexed, top-left is 0,0):
${boardState}
You are playing as '${playerSymbol}' against '${opponentSymbol}'.
Empty cells are shown as '.'.
What is your next move? Play as optimally as possible.`;

      // Make API call based on provider
      let move: AIMove;
      
      switch (provider) {
        case 'chatgpt':
          move = await this.callChatGPT(providerConfig, difficultyConfig, userPrompt);
          break;
        case 'gemini':
          move = await this.callGemini(providerConfig, difficultyConfig, userPrompt);
          break;
        case 'claude':
          move = await this.callClaude(providerConfig, difficultyConfig, userPrompt);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      // Validate move
      if (this.isValidMove(board, move)) {
        return move;
      } else {
        console.warn('AI returned invalid move, using fallback');
        return this.getFallbackMove(board);
      }
    } catch (error) {
      console.error('Error getting AI move:', error);
      return this.getFallbackMove(board);
    }
  }

  private async callChatGPT(providerConfig: AIProvider, difficultyConfig: AIDifficulty, userPrompt: string): Promise<AIMove> {
    const apiKey = this.configLoader.getApiKey('chatgpt');
    
    if (!apiKey) {
      throw new Error('ChatGPT API key not configured');
    }

    const response = await fetch(providerConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          {
            role: 'system',
            content: difficultyConfig.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: difficultyConfig.temperature,
        max_tokens: difficultyConfig.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.statusText}`);
    }

    const data = await response.json();
    const moveText = data.choices[0].message.content.trim();
    
    return this.parseMoveText(moveText);
  }

  private async callGemini(_providerConfig: AIProvider, _difficultyConfig: AIDifficulty, _userPrompt: string): Promise<AIMove> {
    // Placeholder for Gemini implementation
    throw new Error('Gemini integration not yet implemented');
  }

  private async callClaude(_providerConfig: AIProvider, _difficultyConfig: AIDifficulty, _userPrompt: string): Promise<AIMove> {
    // Placeholder for Claude implementation
    throw new Error('Claude integration not yet implemented');
  }

  private formatBoardState(board: (string | null)[][], playerSymbol: string, opponentSymbol: string): string {
    let result = '';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = board[row][col];
        if (cell === null) {
          result += '.';
        } else if (cell === playerSymbol) {
          result += 'X'; // AI is always X in the representation
        } else if (cell === opponentSymbol) {
          result += 'O'; // Opponent is always O
        }
        if (col < 2) result += ' ';
      }
      result += '\n';
    }
    return result;
  }

  private parseMoveText(moveText: string): AIMove {
    // Expected format: "row,col" e.g., "1,2"
    const match = moveText.match(/(\d),\s*(\d)/);
    if (!match) {
      throw new Error(`Invalid move format: ${moveText}`);
    }
    
    return {
      row: parseInt(match[1], 10),
      col: parseInt(match[2], 10)
    };
  }

  private isValidMove(board: (string | null)[][], move: AIMove): boolean {
    return (
      move.row >= 0 && move.row < 3 &&
      move.col >= 0 && move.col < 3 &&
      board[move.row][move.col] === null
    );
  }

  private getFallbackMove(board: (string | null)[][]): AIMove {
    // Simple fallback: try center, then corners, then edges
    const moveOrder = [
      { row: 1, col: 1 }, // Center
      { row: 0, col: 0 }, // Top-left
      { row: 0, col: 2 }, // Top-right
      { row: 2, col: 0 }, // Bottom-left
      { row: 2, col: 2 }, // Bottom-right
      { row: 0, col: 1 }, // Top-middle
      { row: 1, col: 0 }, // Middle-left
      { row: 1, col: 2 }, // Middle-right
      { row: 2, col: 1 }  // Bottom-middle
    ];

    for (const move of moveOrder) {
      if (board[move.row][move.col] === null) {
        return move;
      }
    }

    // Should never reach here in a valid game
    throw new Error('No valid moves available');
  }

  public async simulateThinkingDelay(): Promise<void> {
    const config = this.configLoader.getConfig();
    const delay = Math.random() * (config.moveDelay.max - config.moveDelay.min) + config.moveDelay.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}