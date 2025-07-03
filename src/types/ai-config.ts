export interface AIProvider {
  name: string;
  enabled: boolean;
  apiEndpoint: string;
  model?: string;
  apiKey?: string;
  apiKeyEnvVar: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit?: {
    maxRequests: number;
    perMinutes: number;
  };
}

export interface AIDifficulty {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface AIConfig {
  providers: {
    [key: string]: AIProvider;
  };
  defaultProvider: string;
  fallbackProviders: string[];
  difficulties: {
    easy: AIDifficulty;
    medium: AIDifficulty;
    hard: AIDifficulty;
  };
  defaultDifficulty: keyof AIConfig['difficulties'];
  moveDelay: {
    min: number;
    max: number;
  };
  errorMessages: {
    apiKeyMissing: string;
    networkError: string;
    invalidResponse: string;
    timeout: string;
    rateLimited: string;
  };
}

export type DifficultyLevel = keyof AIConfig['difficulties'];

export interface AIMove {
  row: number;
  col: number;
}