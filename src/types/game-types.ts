export const EMOJI_SOUND_KEY_MAP: Record<string, string> = {
    '😀': 'happy',
    '🚀': 'rocket',
    '🌟': 'star',
    '❤️': 'heart',
    '🎉': 'tada',
    '🐱': 'meow',
    '🍕': 'eat_slice',
    '⚽': 'kick_ball'
};

export interface PlayerConfig {
    name: string;
    symbol: string;
    color: string;
    soundKey: string;
    isAI?: boolean;
}

export interface GameSetupData {
    player1: PlayerConfig;
    player2: PlayerConfig;
}