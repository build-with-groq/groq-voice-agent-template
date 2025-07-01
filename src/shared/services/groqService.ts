import { writable, get } from 'svelte/store';
import { apiKeyStore } from '../stores/apiKeyStore';
import Groq from 'groq-sdk';

// Interface for the Groq service
export interface GroqService {
  client: Groq;
  isReady: () => boolean;
  initialize: () => void;
}

// Create a singleton Groq service
function createGroqService(): GroqService {
  // Create the Groq client with an empty API key initially
  const client = new Groq({
    apiKey: '',
    dangerouslyAllowBrowser: true
  });

  // Store to track initialization state
  const initialized = writable(false);
  
  // Subscribe to the apiKeyStore to update the client's API key
  const unsubscribe = apiKeyStore.subscribe(state => {
    if (state.key) {
      client.apiKey = state.key;
      initialized.set(true);
    } else {
      initialized.set(false);
    }
  });

  // Make sure we don't leave dangling subscriptions when the app exits
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      unsubscribe();
    });
  }

  return {
    client,
    isReady: () => get(initialized),
    initialize: () => {
      // No initialization needed - store works in memory only
    }
  };
}

// Export the singleton instance
export const groqService = createGroqService(); 