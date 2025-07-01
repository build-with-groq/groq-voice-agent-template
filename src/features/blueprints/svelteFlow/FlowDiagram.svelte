<script lang="ts">
  import { writable } from 'svelte/store';
  import { SvelteFlow, Background, Controls, MiniMap, type ColorMode, type Node, type Edge, Position } from '@xyflow/svelte';
  import { onMount } from 'svelte';
  import '@xyflow/svelte/dist/style.css';
  import TurboNode from '@shared/components/TurboNode.svelte';
  import GroqLabsLogo from '../../../assets/groqlabs_logo-white-orange.png';
  import { 
    Play,
    Square
  } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';
  import { getDefaultVoiceAgentFlow } from './flowConfigs/voiceAgentFlow';
  import { defaultTheme } from './themes/defaultTheme';
  import type { FlowConfig } from './flowConfigs/flowConfigFactory';

  // Create event dispatcher for node clicks
  const dispatch = createEventDispatcher();

  // Export props to enable diagram interaction
  export let currentState = 'idle';
  export let activeNode = '';
  export let processingNode = '';
  export let completedNodes: string[] = [];
  export let interactive = true;
  export let isActive = false; // Is the diagram in an active (non-idle) state
  export let isRunning = false; // New prop to track if the system is running
  export let height = "400px";
  export let showWatermark = true;
  export let flowConfig: FlowConfig | undefined = undefined; // Custom flow configuration
  export let nodes = writable<Node[]>([]);

  // Theme configuration with defaults
  let theme = defaultTheme;
  
  // Custom node types
  const nodeTypes = {
    turbo: TurboNode
  };

  // Use the provided flow config or default to voice agent flow
  const currentFlowConfig = flowConfig || getDefaultVoiceAgentFlow();
  
  // Initialize nodes and edges from config if nodes store is empty
  $: {
    if ($nodes.length === 0 && currentFlowConfig.nodes.length > 0) {
      nodes.set(currentFlowConfig.nodes);
    }
  }
  
  const edges = writable<Edge[]>(currentFlowConfig.edges);

  const colorMode: ColorMode = 'dark';
  
  // Store reference to the flow instance
  let flowInstance: any;

  // Add event listener for flow:nodeClick events
  onMount(() => {
    // Simple fitView on mount if nodes exist
    setTimeout(() => {
      if (flowInstance && typeof flowInstance.fitView === 'function' && $nodes.length > 0) {
        flowInstance.fitView({
          padding: 0.1,
          includeHiddenNodes: true,
          duration: 300
        });
      }
    }, 200);
    
    // Listen for custom node click events
    const nodeClickHandler = (event: any) => {
      const nodeId = event.detail?.nodeId;
      
      if (nodeId === 'start') {
        // Check if the button is in "Stop" state from the event data
        const isStop = event.detail?.isStop || false;
        const label = event.detail?.label || '';
        
        if (isRunning || isStop) {
          dispatch('stop', {
            force: true, 
            resetDiagram: true, 
            reason: 'diagram_stop_button_document_event'
          });
        } else {
          dispatch('start');
        }
      } else if (nodeId) {
        // For other nodes, pass through to the handler
        handleNodeClick(nodeId);
      }
    };
    
    // Add event listener
    document.addEventListener('flow:nodeClick', nodeClickHandler);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('flow:nodeClick', nodeClickHandler);
    };
  });
  
  // Handle instance binding - function for the on:nodesDragged event 
  function handleInit(event: CustomEvent) {
    flowInstance = event.detail;
  }

  // Handle node click events from SvelteFlow
  function handleSvelteFlowNodeClick(event: CustomEvent) {
    if (!interactive) return;
    
    // Extract the node and its ID
    const node = event.detail.node;
    const nodeId = node?.id;
    
    if (!nodeId) return;
    
    const label = node?.data?.label || '';
    const isStop = label === 'Stop';
    
    // Special handling for start/stop node
    if (nodeId === 'start') {
      if (isRunning || isStop) {
        // If running or the button shows "Stop", dispatch stop event
        dispatch('stop', {
          force: true, 
          resetDiagram: true, 
          reason: 'diagram_stop_button'
        });
      } else {
        // Otherwise dispatch start event
        dispatch('start');
      }
      
      // Clear any selection that might be causing the animation
      if (flowInstance && typeof flowInstance.unselectAll === 'function') {
        setTimeout(() => {
          // Unselect all nodes to prevent spinning animation
          flowInstance.unselectAll();
        }, 10);
      }
    }
    
    // Always dispatch nodeClick for parent components
    dispatch('nodeClick', { 
      nodeId, 
      node: event.detail.node,
      label,
      isStop
    });
  }

  // Handle node clicks
  function handleNodeClick(nodeId: string) {
    if (!interactive) return;
    
    // Check if this node is in "Stop" state by examining the current nodes state
    let label = '';
    let isStop = false;
    
    $nodes.forEach(node => {
      if (node.id === nodeId) {
        label = node.data?.label?.toString() || '';
        isStop = label === 'Stop';
      }
    });
    
    // Dispatch event to parent component
    dispatch('nodeClick', { nodeId, label, isStop });
    
    // For the start node, also dispatch a special 'start' event or 'stop' event depending on current status
    if (nodeId === 'start') {
      if (isRunning || isStop) {
        // If currently running or button shows Stop, dispatch stop event
        dispatch('stop', {
          force: true, 
          resetDiagram: true, 
          reason: 'stop_button_from_handleNodeClick'
        });
      } else {
        // Otherwise dispatch start event
        dispatch('start');
      }
      
      // Clear any selection that might be causing the animation
      if (flowInstance && typeof flowInstance.unselectAll === 'function') {
        setTimeout(() => {
          // Unselect all nodes to prevent spinning animation
          flowInstance.unselectAll();
        }, 10);
      }
    }
  }
  
  // Force reset all diagram state
  export function forceReset() {
    // Reset all state variables
    isRunning = false;
    isActive = false;
    activeNode = '';
    processingNode = '';
    completedNodes = [];
    
    // Force node updates - special handling for start node to ensure it reverts to Start
    nodes.update(currentNodes => {
      return currentNodes.map(node => {
        // Special case for start node - make sure it reverts to Start
        if (node.id === 'start') {
          return {
            ...node,
            data: {
              ...node.data,
              label: 'Start',
              icon: Play, // Play icon for start
              isActive: false,
              isProcessing: false,
              isCompleted: false,
              color: theme.stages.init.color,
              shadow: theme.stages.init.shadow
            },
            className: '' // Clear any special styling
          };
        }
        
        // Reset all other nodes to default state
        return {
          ...node,
          data: {
            ...node.data,
            isActive: false,
            isProcessing: false,
            isCompleted: false
          },
          className: ''
        };
      });
    });
    
    // Reset edges - keep them animated with orange color
    edges.update(currentEdges => {
      return currentEdges.map(edge => {
        return {
          ...edge,
          animated: true, // Keep animated
          style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
        };
      });
    });
    
    // Make sure we re-render
    setTimeout(() => {
      nodes.update(n => [...n]);
      edges.update(e => [...e]);
    }, 50);
  }
  
  // Update nodes based on state
  $: {
    if (activeNode || processingNode || completedNodes.length > 0 || currentState !== 'idle' || isRunning) {
      nodes.update(currentNodes => {
        return currentNodes.map(node => {
          // Set node visualization states
          const isActive = node.id === activeNode;
          const isProcessing = node.id === processingNode;
          const isCompleted = completedNodes.includes(node.id);
          
          // Special case for start node - changes between Start/Stop based on isRunning state
          if (node.id === 'start') {
            // Update the node based on the running state
            return {
              ...node,
              data: {
                ...node.data,
                label: isRunning ? 'Stop' : 'Start',
                icon: isRunning ? Square : Play, // Square icon for stop, play for start
                isActive: isRunning, // Highlight when running
                isProcessing: false,
                isCompleted: false,
                color: isRunning ? theme.stages.stop.color : theme.stages.init.color,
                shadow: isRunning ? theme.stages.stop.shadow : theme.stages.init.shadow
              },
              // Add a class to apply special styling for stop button when running
              className: isRunning ? 'stop-button' : '',
              // Apply style properties if defined in the node config
              ...(node.style ? { style: node.style } : {})
            };
          }
          
          // Apply visualization states to other node data properties
          return {
            ...node,
            data: {
              ...node.data,
              isActive,
              isProcessing,
              isCompleted
            },
            // Apply style properties if defined in the node config
            ...(node.style ? { style: node.style } : {})
          };
        });
      });

      // Update edges based on active and completed nodes
      edges.update(currentEdges => {
        return currentEdges.map(edge => {
          // Edge is active if source node is active/completed and target node is active/processing
          const sourceActive = edge.source === activeNode || completedNodes.includes(edge.source);
          const targetActive = edge.target === activeNode || edge.target === processingNode || completedNodes.includes(edge.target);
          const isActiveEdge = sourceActive && targetActive;
          
          // Set edge style based on state
          const edgeColor = isActiveEdge ? 'var(--node-green, #00C853)' : 'var(--node-color, #FF5C00)';
          
          // Always keep edges animated, but use different colors based on state
          return {
            ...edge,
            animated: true, // Always animated
            style: `stroke: ${edgeColor}; stroke-width: 2;`,
            className: isActiveEdge ? 'active-edge' : '',
          };
        });
      });
    } else {
      // If everything is idle, make sure Start/Stop button is in Start state
      nodes.update(currentNodes => {
        return currentNodes.map(node => {
          if (node.id === 'start') {
            return {
              ...node,
              data: {
                ...node.data,
                label: 'Start',
                icon: Play,
                isActive: false,
                isProcessing: false,
                isCompleted: false,
                color: theme.stages.init.color,
                shadow: theme.stages.init.shadow
              },
              className: ''
            };
          }
          return node;
        });
      });
      
      // When idle, set all edges to animated with default orange color
      edges.update(currentEdges => {
        return currentEdges.map(edge => {
          return {
            ...edge,
            animated: true, // Keep animated in idle state
            style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
          };
        });
      });
    }
  }
</script>

<div class="flow-chart-container rounded-lg relative" style="height: {height}">
  <SvelteFlow 
    {nodes} 
    {edges}
    {colorMode}
    {nodeTypes}
    preventScrolling={true}
    on:init={handleInit}
    on:nodeClick={handleSvelteFlowNodeClick}
    fitViewOptions={{ 
      padding: 0.1,
      includeHiddenNodes: true,
      minZoom: 0.3,
      maxZoom: 1.2,
    }}
    defaultEdgeOptions={{ 
      animated: true
    }}
    nodesDraggable={false}
    panOnScroll={true}
  >
    <Controls showLock={false} />
  </SvelteFlow>
  
  <!-- GroqLabs Watermark -->
  {#if showWatermark}
    <div class="watermark">
      <img src={GroqLabsLogo} alt="GroqLabs Logo" class="watermark-icon" />
    </div>
  {/if}
</div>

<style>
  .flow-chart-container {
    position: relative;
  }
  
  /* Watermark styling */
  .watermark {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 50;
    opacity: 0.6;
    pointer-events: none;
  }
  
  .watermark-icon {
    width: 120px;
    height: auto;
  }
  
  /* Hide SvelteFlow attribution */
  :global(.svelte-flow__attribution) {
    position: absolute;
    top: 0;
    right: 0;
    height: fit-content;
    background-color: transparent;
  }

  /* Custom Node Styling */
  :global(.svelte-flow) {
    --bg-color: #0C0D10;
    --text-color: #ffffff;
    --node-border-radius: 10px;
    --node-color: #FF5C00;
    --node-color-rgb: 255, 92, 0;
    --node-shadow: rgba(255, 92, 0, 0.5);
    --node-box-shadow: 0 0 25px var(--node-shadow);
    --node-green: #00C853;
    --node-green-rgb: 0, 200, 83;
    --node-yellow: #FFC107;
    --node-yellow-rgb: 255, 193, 7; 
    background-color: var(--bg-color) !important;
    color: var(--text-color);
  }
  
  :global(.svelte-flow__node-turbo) {
    border-radius: var(--node-border-radius);
    display: flex;
    height: 70px;
    min-width: 150px;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 500;
    letter-spacing: -0.2px;
    box-shadow: none; /* Remove box-shadow here to prevent double shadows */
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  :global(.svelte-flow__node-turbo .wrapper) {
    overflow: hidden;
    display: flex;
    padding: 2px;
    position: relative;
    border-radius: var(--node-border-radius);
    flex-grow: 1;
  }
  
  :global(.svelte-flow__node-turbo.selected .wrapper.gradient:before),
  :global(.processing .wrapper.gradient:before) {
    content: '';
    background: conic-gradient(
      from -160deg at 50% 50%,
      var(--node-color) 0deg,
      var(--node-color) 120deg,
      var(--node-color) 240deg,
      rgba(var(--node-color-rgb, 255, 92, 0), 0) 360deg
    );
    animation: spinner 4s linear infinite;
    transform: translate(-50%, -50%) rotate(0deg);
    z-index: -1;
  }
  
  /* Ensure the Start/Stop button doesn't have spinner animation when clicked/selected */
  :global(.svelte-flow__node-turbo.stop-button .wrapper.gradient:before),
  :global(.svelte-flow__node-turbo.stop-button.selected .wrapper.gradient:before) {
    animation: none !important;
    background: conic-gradient(
      from -160deg at 50% 50%,
      var(--node-color) 0deg,
      color-mix(in srgb, var(--node-color), white 20%) 120deg,
      var(--node-color) 240deg,
      color-mix(in srgb, var(--node-color), white 20%) 360deg
    );
  }
  
  @keyframes spinner {
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }
  
  :global(.svelte-flow__node-turbo .inner) {
    background: var(--bg-color);
    padding: 12px 16px;
    border-radius: var(--node-border-radius);
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    position: relative;
  }
  
  :global(.svelte-flow__node-turbo .icon) {
    margin-right: 8px;
  }
  
  :global(.svelte-flow__node-turbo .body) {
    display: flex;
  }
  
  :global(.svelte-flow__node-turbo .title) {
    font-size: 16px;
    margin-bottom: 2px;
    line-height: 1;
  }
  
  :global(.svelte-flow__node-turbo .subtitle) {
    font-size: 12px;
    color: #FF7E38;
  }
  
  :global(.svelte-flow__node-turbo .cloud) {
    border-radius: 100%;
    width: 30px;
    height: 30px;
    right: 0;
    position: absolute;
    top: 0;
    transform: translate(50%, -50%);
    display: flex;
    transform-origin: center center;
    padding: 2px;
    overflow: hidden;
    box-shadow: var(--node-box-shadow);
    z-index: 1;
  }
  
  :global(.svelte-flow__node-turbo .cloud div) {
    background-color: var(--bg-color);
    flex-grow: 1;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  

  
  :global(.svelte-flow__node:focus) {
    outline: none;
  }
  
  /* Update edge styling to use CSS variables */
  :global(.svelte-flow__edge .svelte-flow__edge-path) {
    stroke-width: 3;
    filter: drop-shadow(0 0 10px var(--node-shadow));
    transition: stroke 0.3s, filter 0.3s;
  }
  
  :global(.svelte-flow__edge.active-edge .svelte-flow__edge-path) {
    filter: drop-shadow(0 0 10px rgba(var(--node-green-rgb), 0.6));
  }
  
  :global(.svelte-flow__edge.animated .svelte-flow__edge-path) {
    animation: flow 1s linear infinite;
  }
  
  @keyframes flow {
    0% {
      stroke-dasharray: 5, 5;
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dasharray: 5, 5;
      stroke-dashoffset: -10;
    }
  }
  
  :global(.svelte-flow__edge-text) {
    fill: white !important;
    font-size: 12px !important;
    filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.7)) !important;
    font-weight: 500 !important;
    pointer-events: none !important;
  }
  
  :global(.svelte-flow__edge-textbg) {
    fill: rgba(0, 0, 0, 0.7) !important;
    rx: 4 !important;
    ry: 4 !important;
  }
  
  /* Controls Styling */
  :global(.svelte-flow__controls button) {
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid #FF5C00;
    border-bottom: none;
  }
  
  :global(.svelte-flow__controls button:hover) {
    background-color: #1a1a1a;
  }
  
  :global(.svelte-flow__controls button:first-child) {
    border-radius: 5px 5px 0 0;
  }
  
  :global(.svelte-flow__controls button:last-child) {
    border-bottom: 1px solid #FF5C00;
    border-radius: 0 0 5px 5px;
  }
  
  :global(.svelte-flow__controls button path) {
    fill: var(--text-color);
  }

  /* Stop Button Styling */
  :global(.svelte-flow__node-turbo.stop-button) {
    /* Remove box-shadow here - will be handled by the wrapper */
  }

  :global(.svelte-flow__node-turbo.stop-button .wrapper) {
    --node-color: #F44336;
    --node-color-rgb: 244, 67, 54;
    --node-shadow: rgba(244, 67, 54, 0.5);
  }
</style> 