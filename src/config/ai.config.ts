export const AI_CONFIG = {
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    models: {
      chat: "gpt-4-turbo-preview",
      completion: "gpt-3.5-turbo-instruct"
    },
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 150000
    }
  }
};

export const validateAIConfig = () => {
  if (!AI_CONFIG.openai.apiKey) {
    console.warn(
      "OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY environment variable."
    );
    return false;
  }
  return true;
};

export const handleRateLimit = async (fn: Function, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.response?.status === 429 && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}; 