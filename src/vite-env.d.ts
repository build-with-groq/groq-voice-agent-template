/// <reference types="svelte" />
/// <reference types="vite/client" />

// Add VAD type declarations to window
interface Window {
  vad: {
    MicVAD: {
      new: (options: any) => Promise<any>;
    };
  };
  ortConfig?: {
    wasm: {
      wasmPaths: Record<string, string>;
    };
  };
}
