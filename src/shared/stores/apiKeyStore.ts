import { writable } from 'svelte/store';
import { z } from 'zod';

// Define validation schema for API key
const apiKeySchema = z.string()
  .min(1, "API key is required")
  .regex(/^gsk_[A-Za-z0-9]{1,60}$/, "API key must start with gsk_ followed by alphanumeric characters");

// Interface for the store value
interface ApiKeyState {
  key: string;
  isValid: boolean;
  error?: string;
}

// Function to validate API key
function validateApiKey(key: string): { isValid: boolean; error?: string } {
  const result = apiKeySchema.safeParse(key);
  if (result.success) {
    return { isValid: true };
  } else {
    const errorMessage = result.error.errors[0]?.message || "Invalid API key";
    return { isValid: false, error: errorMessage };
  }
}

// Create writable store with default empty state
const createApiKeyStore = () => {
  // Initial state with empty key
  const initialState: ApiKeyState = {
    key: '',
    isValid: false
  };

  const { subscribe, set, update } = writable<ApiKeyState>(initialState);

  return {
    subscribe,

    // Set a new API key and validate it (memory only)
    setApiKey: (newKey: string) => {
      const validation = validateApiKey(newKey);
      
      // Update the store
      update(state => ({ 
        key: newKey,
        isValid: validation.isValid,
        error: validation.error
      }));
      
      return { 
        success: validation.isValid, 
        error: validation.error 
      };
    },

    // Clear the API key
    clearApiKey: () => {
      set(initialState);
      return { success: true };
    },

    // Get the current API key for use in requests
    getApiKey: () => {
      let currentState: ApiKeyState | undefined;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      return currentState?.key || '';
    },

    // Validate the current key
    validateCurrentKey: () => {
      let currentState: ApiKeyState | undefined;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      return currentState?.isValid || false;
    },

    // Check if API key exists
    hasApiKey: () => {
      let currentState: ApiKeyState | undefined;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      return !!(currentState?.key && currentState.isValid);
    }
  };
};

// Export the store instance
export const apiKeyStore = createApiKeyStore(); 