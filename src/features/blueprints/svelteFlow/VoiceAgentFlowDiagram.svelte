<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FlowDiagram from './FlowDiagram.svelte';
  import { getDefaultVoiceAgentFlow } from './flowConfigs/voiceAgentFlow';
  
  // Event dispatcher for node clicks and state changes
  const dispatch = createEventDispatcher();
  
  // Input props
  export let currentState = 'idle';  // Current processing state (idle, listening, recording, processing, responding)
  export let stateMap: Record<string, { active: string, processing: string, completed: string[] }> = {}; // Map state names to diagram node states
  export let height = "400px";
  export let showWatermark = true;
  export let interactive = true;
  
  // Component reference
  let flowDiagramComponent: FlowDiagram;
  
  // Internal state
  let activeNode = '';
  let processingNode = '';
  let completedNodes: string[] = [];
  let isRunning = false;  // Track if the system is running or idle
  
  // Get the voice agent flow configuration
  const flowConfig = getDefaultVoiceAgentFlow();
  
  // Default state map if none provided
  $: {
    if (!stateMap || Object.keys(stateMap).length === 0) {
      stateMap = {
        'idle': { active: '', processing: '', completed: [] },
        'listening': { active: 'start', processing: 'mic-on', completed: [] },
        'recording': { active: '', processing: 'vad', completed: ['start', 'mic-on'] },
        'processing': { active: '', processing: 'stt', completed: ['start', 'mic-on', 'vad'] },
        'responding': { 
          active: '', 
          processing: 'audio-response', 
          completed: ['start', 'mic-on', 'vad', 'stt', 'llm', 'tts'] 
        }
      };
    }
  }
  
  // Map the current state to diagram states and update isRunning
  $: {
    // Force explicit isRunning reset when currentState is reset to idle/Idle
    if (currentState === 'idle' || currentState === 'Idle') {
      isRunning = false;
    }
    
    if (currentState && stateMap[currentState.toLowerCase()]) {
      const mapping = stateMap[currentState.toLowerCase()];
      activeNode = mapping.active;
      processingNode = mapping.processing;
      completedNodes = mapping.completed;
      
      // Set isRunning based on the state (true for anything other than idle)
      isRunning = currentState.toLowerCase() !== 'idle';
      
      // Explicitly reset flowDiagram when state is idle
      if (currentState.toLowerCase() === 'idle' && flowDiagramComponent) {
        if (typeof flowDiagramComponent.forceReset === 'function') {
          flowDiagramComponent.forceReset();
        }
      }
    } else {
      // Default to idle if state not found
      activeNode = '';
      processingNode = '';
      completedNodes = [];
      isRunning = false;
    }
  }
  
  // Reset all UI state to idle
  function resetUIState() {
    currentState = 'idle';
    activeNode = '';
    processingNode = '';
    completedNodes = [];
    isRunning = false;
    
    // Also reset the internal FlowDiagram component if available
    if (flowDiagramComponent && typeof flowDiagramComponent.forceReset === 'function') {
      flowDiagramComponent.forceReset();
    }
  }
  
  // Handle events from the flow diagram component
  function handleNodeClick(event: CustomEvent) {
    const nodeId = event.detail.nodeId;
    
    // Special handling for start/stop node
    if (nodeId === 'start') {
      if (isRunning) {
        // If system is running, reset all UI state first
        resetUIState();
        
        // Then dispatch stop event with force flag
        dispatch('stop', { 
          force: true,
          resetDiagram: true,
          reason: 'diagram_stop_button'
        });
      } else {
        // Otherwise dispatch start event
        dispatch('start');
      }
    } else {
      // Forward other node clicks to parent component
      dispatch('nodeClick', event.detail);
    }
  }
  
  // Handle stop event explicitly from FlowDiagram
  function handleDiagramStop(event: CustomEvent) {
    // Reset UI first
    resetUIState();
    
    // Propagate the stop event to parent
    dispatch('stop', {
      force: true,
      resetDiagram: true,
      reason: 'diagram_stop_button',
      ...event.detail
    });
  }
  
  // Handle start event (play button)
  function handleStart() {
    if (!isRunning) {
      dispatch('start');
    }
  }
  
  // Public method to force reset state from outside
  export function forceReset() {
    resetUIState();
    
    // Also reset the FlowDiagram component
    if (flowDiagramComponent && typeof flowDiagramComponent.forceReset === 'function') {
      flowDiagramComponent.forceReset();
    }
  }
</script>

<FlowDiagram
  bind:this={flowDiagramComponent}
  {height}
  {showWatermark}
  currentState={currentState.toLowerCase()}
  {activeNode}
  {processingNode}
  {completedNodes}
  {interactive}
  {isRunning}
  {flowConfig}
  on:nodeClick={handleNodeClick}
  on:start={handleStart}
  on:stop={handleDiagramStop}
/>