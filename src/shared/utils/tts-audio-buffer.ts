import { WavStreamPlayer } from "./wav-stream-player";

interface TTSAudioBufferProps {
  onAudioEnded: (() => void) | null;
  onAudioData?: ((audioData: Float32Array) => void) | null;
}

const BUFFER_SIZE_THRESHOLD_TO_START_PLAYING = 64000;

export class TTSAudioBuffer {
  public bufferedData: number[] = [];
  private lastOffset = 0;
  private onAudioEnded: (() => void) | null = null;
  private onAudioData: ((audioData: Float32Array) => void) | null = null;
  private startedPlayingAudio = false;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private dataArray: Float32Array | null = null;
  private animationFrameId: number | null = null;
  
  // Public property to track if audio is currently playing
  public isPlaying = false;

  private wavStreamPlayer: WavStreamPlayer | null = null;

  private initializeWavStreamPlayer() {
    this.wavStreamPlayer = new WavStreamPlayer({ sampleRate: 48000 });
    this.wavStreamPlayer.setOnEndedCallback(() => {
      this.isPlaying = false; // Set isPlaying to false when audio ends
      this.reset();
    });
  }

  constructor({ onAudioEnded, onAudioData }: TTSAudioBufferProps) {
    this.onAudioEnded = () => {
      this.isPlaying = false; // Set isPlaying to false when audio ends
      if (onAudioEnded) onAudioEnded();
    };
    this.onAudioData = onAudioData || null;
    this.initializeWavStreamPlayer();
  }

  // this must be called after user interaction with the app
  public async connectAudioContext() {
    await this.wavStreamPlayer?.connect();
    
    // Set up audio analyzer for visualization if callback is provided
    if (this.onAudioData && this.wavStreamPlayer?.context) {
      this.audioContext = this.wavStreamPlayer.context;
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Create a dummy source and connect to analyzer
      // This will be used to visualize the audio data
      const destination = this.audioContext.destination;
      this.wavStreamPlayer.stream?.connect(this.analyser);
      this.analyser.connect(destination);
      
      // Initialize the data array for frequency data
      this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
      
      // Start the visualization loop
      this.startVisualizationLoop();
    }
  }

  private startVisualizationLoop() {
    if (!this.analyser || !this.dataArray || !this.onAudioData) {
      return;
    }
    
    const updateVisualization = () => {
      if (!this.analyser || !this.dataArray || !this.onAudioData) {
        this.animationFrameId = requestAnimationFrame(updateVisualization);
        return;
      }
      
      // Get frequency data
      this.analyser.getFloatFrequencyData(this.dataArray);
      
      // Process the data to enhance visualization
      // Create a copy to avoid modifying the original data
      const enhancedData = new Float32Array(this.dataArray.length);
      
      // Check if we have audible data
      let hasAudibleData = false;
      for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i] > -70) { // Threshold for "audible" content
          hasAudibleData = true;
          break;
        }
      }
      
      // Process the frequency data to enhance it for visualization
      for (let i = 0; i < this.dataArray.length; i++) {
        // Scale the frequency data to be more responsive
        const val = this.dataArray[i];
        
        if (hasAudibleData) {
          // Dramatically boost the audio signal for better visualization
          // Remap the dB scale for better visibility (-90dB to -30dB → 0 to 1)
          let normalizedValue = (val + 90) / 60;
          
          // Clamp to valid range and apply non-linear scaling for more visual impact
          normalizedValue = Math.min(Math.max(normalizedValue, 0), 1);
          
          // Apply frequency-based boosts
          const frequencyIndex = i / this.dataArray.length; // 0-1 range
          let boost = 1.0;
          
          // Boost voice frequencies more (typically in the first third of the spectrum for speech)
          if (frequencyIndex > 0.02 && frequencyIndex < 0.3) {
            boost = 2.0; // Higher boost for voice frequencies
          }
          
          // Apply exponential scaling to make small values more visible
          const scaledValue = Math.pow(normalizedValue * boost, 0.5);
          
          // Store the enhanced value - convert back to dB scale but boost the range
          enhancedData[i] = -60 + (scaledValue * 60); // Map 0-1 to -60 to 0 dB
        } else {
          // If no significant audio, use much lower values
          enhancedData[i] = -90; // Very quiet
        }
      }
      
      // Log the data periodically for debugging
      if (hasAudibleData && Math.random() < 0.05) { // Log ~5% of frames with audio
        let maxVal = -100;
        for (let i = 0; i < enhancedData.length; i++) {
          if (enhancedData[i] > maxVal) maxVal = enhancedData[i];
        }
      }
      
      // Send the enhanced data to the callback
      this.onAudioData(enhancedData);
      
      // Continue the loop if we're still playing audio
      if (this.startedPlayingAudio) {
        this.animationFrameId = requestAnimationFrame(updateVisualization);
      } else {
        // If we're not playing, send one more frame of silence
        const silenceData = new Float32Array(this.dataArray.length);
        silenceData.fill(-100);
        this.onAudioData(silenceData);
        
        // Then stop the loop
        this.animationFrameId = null;
        return;
      }
    };
    
    // Start the loop
    this.animationFrameId = requestAnimationFrame(updateVisualization);
  }

  private processBufferedDataIntoAudioSamples() {
    // audio samples array for 16 bit PCM audio
    const int16Array = new Int16Array(
      (this.bufferedData.length - this.lastOffset) / 2,
    );
    let j = 0;
    for (let i = this.lastOffset; i < this.bufferedData.length; i += 2) {
      if (i + 1 < this.bufferedData.length) {
        const aBit = this.bufferedData[i];
        const bBit = this.bufferedData[i + 1];
        const sample = (bBit << 8) | aBit;
        int16Array[j++] = sample;
        this.lastOffset = i + 2;
      }
    }

    this.wavStreamPlayer?.add16BitPCM(int16Array);
    this.startedPlayingAudio = true;
    this.isPlaying = true; // Set isPlaying to true when adding audio
    
    // Start visualization if we have audio and it's not already running
    if (this.onAudioData && !this.animationFrameId && this.analyser) {
      this.startVisualizationLoop();
    }
  }

  public addChunk(data: Uint8Array) {
    // Check if this is a WAV file with header
    const stringRep = Array.from(data)
      .slice(0, 12) // Only check first few bytes to detect header
      .map((b) => String.fromCharCode(b))
      .join("");

    const hasAudioFileHeader = stringRep.includes("RIFF");

    // Process the data based on whether it's a WAV file or not
    if (hasAudioFileHeader) {
      // If it has a WAV header, skip the first 44 bytes (standard WAV header size)
      const wavData = data.slice(44);
      // Add all bytes at once instead of spreading, which can cause stack overflow with large arrays
      for (let i = 0; i < wavData.length; i++) {
        this.bufferedData.push(wavData[i]);
      }
    } else {
      // Regular data without header - add bytes directly without spreading
      for (let i = 0; i < data.length; i++) {
        this.bufferedData.push(data[i]);
      }
    }

    // Process the data if we have enough or if playback has already started
    if (
      this.bufferedData.length > this.lastOffset &&
      (this.startedPlayingAudio ||
        this.bufferedData.length > BUFFER_SIZE_THRESHOLD_TO_START_PLAYING)
    ) {
      this.processBufferedDataIntoAudioSamples();
      
      // Start visualization when we have audio data - only if not already started
      if (this.onAudioData && !this.animationFrameId && this.analyser && !this.startedPlayingAudio) {
        this.startVisualizationLoop();
      }
    }
  }

  // Flush method to send all remaining data from the buffer to the wav stream player
  public flushBufferedData() {
    this.processBufferedDataIntoAudioSamples();
  }

  public async reset() {
    // Stop the visualization loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.bufferedData = [];
    this.lastOffset = 0;
    this.startedPlayingAudio = false;
    this.isPlaying = false; // Set isPlaying to false when resetting
    
    // Send one last "silent" frequency data to reset visualization
    if (this.onAudioData && this.dataArray) {
      // Create a silent data array (all values set to -100 dB)
      const silentData = new Float32Array(this.dataArray.length);
      silentData.fill(-100);
      this.onAudioData(silentData);
    }
    
    await this.wavStreamPlayer?.interrupt();
    this.onAudioEnded?.();

    this.initializeWavStreamPlayer();
    await this.wavStreamPlayer?.connect();
    
    // Make sure we set up the analyzer when reconnecting
    if (this.wavStreamPlayer?.context && this.onAudioData) {
      this.audioContext = this.wavStreamPlayer.context;
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect to stream
      this.wavStreamPlayer.stream?.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Initialize the data array for frequency data
      this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
    }
  }

  public updateAudioDataCallback(callback: ((audioData: Float32Array) => void) | null) {
    this.onAudioData = callback;
  }
}