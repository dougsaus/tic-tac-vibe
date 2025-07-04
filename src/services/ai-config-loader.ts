import { AIConfig } from '../types/ai-config';

// Extend the global Window interface to include potential API keys
declare global {
  interface Window {
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
  }
}

export class AIConfigLoader {
  private static instance: AIConfigLoader;
  private config: AIConfig | null = null;
  private configUrl = './ai-config.json';

  private constructor() {}

  public static getInstance(): AIConfigLoader {
    if (!AIConfigLoader.instance) {
      AIConfigLoader.instance = new AIConfigLoader();
    }
    return AIConfigLoader.instance;
  }

  public async loadConfig(): Promise<AIConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch(this.configUrl);
      if (!response.ok) {
        throw new Error(`Failed to load AI config: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.config = this.validateConfig(data);
      return this.config;
    } catch (error) {
      console.error('Error loading AI configuration:', error);
      throw new Error('Failed to load AI configuration. AI player will not be available.');
    }
  }

  private validateConfig(data: unknown): AIConfig {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid AI config: not an object');
    }
    
    const config = data as Record<string, unknown>;
    
    // Validate providers
    if (!config.providers || typeof config.providers !== 'object' || config.providers === null) {
      throw new Error('Invalid AI config: missing or invalid providers');
    }
    
    // Validate defaultProvider
    if (typeof config.defaultProvider !== 'string') {
      throw new Error('Invalid AI config: defaultProvider must be a string');
    }
    
    // Validate fallbackProviders
    if (!Array.isArray(config.fallbackProviders)) {
      throw new Error('Invalid AI config: fallbackProviders must be an array');
    }
    
    // Validate difficulties
    if (!config.difficulties || typeof config.difficulties !== 'object' || config.difficulties === null) {
      throw new Error('Invalid AI config: missing or invalid difficulties');
    }
    
    const difficulties = config.difficulties as Record<string, unknown>;
    const requiredDifficulties = ['easy', 'medium', 'hard'];
    for (const difficulty of requiredDifficulties) {
      if (!difficulties[difficulty] || typeof difficulties[difficulty] !== 'object') {
        throw new Error(`Invalid AI config: missing or invalid difficulty level: ${difficulty}`);
      }
    }
    
    // Validate that defaultProvider exists in providers
    const providers = config.providers as Record<string, unknown>;
    if (!providers[config.defaultProvider]) {
      throw new Error('Invalid AI config: default provider not found in providers');
    }
    
    // Validate moveDelay
    if (!config.moveDelay || typeof config.moveDelay !== 'object') {
      throw new Error('Invalid AI config: missing or invalid moveDelay');
    }
    
    // Validate errorMessages
    if (!config.errorMessages || typeof config.errorMessages !== 'object') {
      throw new Error('Invalid AI config: missing or invalid errorMessages');
    }
    
    // Now we can safely return the validated config
    return {
      providers: config.providers as AIConfig['providers'],
      defaultProvider: config.defaultProvider as string,
      fallbackProviders: config.fallbackProviders as string[],
      difficulties: config.difficulties as AIConfig['difficulties'],
      defaultDifficulty: config.defaultDifficulty as AIConfig['defaultDifficulty'],
      moveDelay: config.moveDelay as AIConfig['moveDelay'],
      errorMessages: config.errorMessages as AIConfig['errorMessages']
    };
  }

  public getConfig(): AIConfig {
    if (!this.config) {
      throw new Error('AI configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  public getApiKey(provider: string): string | undefined {
    const config = this.getConfig();
    const providerConfig = config.providers[provider];
    
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not found in configuration`);
    }

    // First, try to use API key from config file
    if (providerConfig.apiKey) {
      return providerConfig.apiKey;
    }

    // Fallback to environment variables (via window object for browser)
    // In a browser environment, environment variables might be injected as global properties
    try {
      const envVarName = providerConfig.apiKeyEnvVar as keyof Window;
      const value = window[envVarName];
      return typeof value === 'string' ? value : undefined;
    } catch {
      return undefined;
    }
  }

  public isProviderAvailable(provider: string): boolean {
    try {
      const config = this.getConfig();
      const providerConfig = config.providers[provider];
      return providerConfig && providerConfig.enabled && !!this.getApiKey(provider);
    } catch {
      return false;
    }
  }

  public getAvailableProvider(): string | null {
    const config = this.getConfig();
    
    // Try default provider first
    if (this.isProviderAvailable(config.defaultProvider)) {
      return config.defaultProvider;
    }

    // Try fallback providers
    for (const provider of config.fallbackProviders) {
      if (this.isProviderAvailable(provider)) {
        return provider;
      }
    }

    return null;
  }
}