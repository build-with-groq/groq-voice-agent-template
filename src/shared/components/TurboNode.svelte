<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';
  import { Settings, Send } from '@lucide/svelte';
  import type { SvelteComponent } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // Create event dispatcher
  const dispatch = createEventDispatcher();
 
  type $$Props = NodeProps;
  export let data: $$Props['data'] & {
    icon?: typeof SvelteComponent;
    cornerIcon?: typeof SvelteComponent;
    subtitle?: string;
    sourcePosition?: Position;
    targetPosition?: Position;
    isActive?: boolean;
    isProcessing?: boolean;
    isCompleted?: boolean;
    onClick?: () => void;
    color?: string;
    shadow?: string;
    showInput?: boolean;
    showResponse?: boolean;
    onInputChange?: (value: string) => void;
    onInputSubmit?: (value: string) => void;
    inputValue?: string;
    responseValue?: string;
    style?: Record<string, string>;
  };

  // Default positions if not specified
  const sourcePosition = data.sourcePosition || Position.Right;
  const targetPosition = data.targetPosition || Position.Left;
  
  // Handle click event
  function handleClick() {
    // Get node information
    const nodeId = data.id || 'unknown'; 
    
    // Determine if this is a stop button based on the label
    const isStop = data.label === 'Stop';
    
    // Dispatch a custom event that can be captured by parent components
    dispatch('nodeClick', { 
      nodeId, 
      label: data.label,
      isStop,
      data
    });
    
    // Create a synthetic event that bubbles through the DOM
    const customEvent = new CustomEvent('flow:nodeClick', {
      bubbles: true,
      composed: true,
      detail: { 
        nodeId, 
        label: data.label,
        isStop,
        data 
      }
    });
    
    // Dispatch the event on the DOM element
    if (typeof document !== 'undefined') {
      document.dispatchEvent(customEvent);
    }
    
    // Also call the original onClick handler if it exists
    if (data.onClick) {
      data.onClick();
    }
  }

  // Derive CSS classes based on state
  $: nodeClass = `node-container ${data.isActive ? 'active' : ''} ${data.isProcessing ? 'processing' : ''} ${data.isCompleted ? 'completed' : ''}`;
  
  // Custom style for the gradient
  $: customStyle = data.color ? `--node-color: ${data.color}; --node-shadow: ${data.shadow || 'rgba(255, 92, 0, 0.3)'}` : '';

  // Get node style if provided
  $: nodeStyle = data.style || {};
  
  // Handle input change
  function handleInputChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value;
    data.inputValue = newValue;
    data.onInputChange?.(newValue);
  }

  // Handle input submission
  function handleInputSubmit(e: Event) {
    e.preventDefault();
    if (data.inputValue) {
      data.onInputSubmit?.(data.inputValue);
    }
  }
</script>
 
<div 
  class={nodeClass}
  on:click={handleClick}
  style={customStyle}
>
  {#if data.cornerIcon}
  <div class="cloud gradient">
    <div>
      <svelte:component this={data.cornerIcon} size="16" color="#ffffff" />
    </div>
  </div>
  {/if}
  <div class="wrapper gradient" style={`width: ${nodeStyle.width || 'auto'}; height: ${nodeStyle.height || 'auto'};`}>
    <div class="inner">
      <div class="body">
        {#if data.icon}
          <div class="icon">
            <svelte:component this={data.icon} size="16" />
          </div>
        {/if}
        <div>
          <div class="title">{data.label}</div>
          
          <!-- Only show subtitle when not showing input/response -->
          {#if data.subtitle && !data.showInput && !data.showResponse}
            <div class="subtitle" style={data.color ? `color: ${data.color}` : ''}>{data.subtitle}</div>
          {/if}
          
          {#if data.showInput}
            <div class="input-container">
              <form on:submit={handleInputSubmit}>
                <input 
                  type="text" 
                  value={data.inputValue || ''}
                  on:input={handleInputChange}
                  placeholder="Type your message..." 
                  class="node-input"
                />
                <button type="submit" class="input-submit" style={`background: ${data.color};`}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          {/if}
          
          {#if data.showResponse}
            <div class="response-container" style={nodeStyle.width ? `width: calc(${nodeStyle.width}px - 40px);` : ''}>
              <div class="response-text">{data.responseValue}</div>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Handle all positions -->
      {#if targetPosition === Position.Left}
        <Handle type="target" position={Position.Left} />
      {/if}
      
      {#if targetPosition === Position.Right}
        <Handle type="target" position={Position.Right} />
      {/if}
      
      {#if targetPosition === Position.Top}
        <Handle type="target" position={Position.Top} />
      {/if}
      
      {#if targetPosition === Position.Bottom}
        <Handle type="target" position={Position.Bottom} />
      {/if}
      
      {#if sourcePosition === Position.Left}
        <Handle type="source" position={Position.Left} />
      {/if}
      
      {#if sourcePosition === Position.Right}
        <Handle type="source" position={Position.Right} />
      {/if}
      
      {#if sourcePosition === Position.Top}
        <Handle type="source" position={Position.Top} />
      {/if}
      
      {#if sourcePosition === Position.Bottom}
        <Handle type="source" position={Position.Bottom} />
      {/if}
    </div>
  </div>
</div>

<style>
  .node-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* Base styles for the gradient wrapper */
  .wrapper {
    overflow: hidden;
    display: flex;
    padding: 2px;
    position: relative;
    border-radius: 10px;
    flex-grow: 1;
    /* Ensure this wrapper has the box-shadow */
    box-shadow: 0 0 25px var(--node-shadow, rgba(255, 92, 0, 0.5));
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .gradient:before {
    content: '';
    position: absolute;
    /* Adjusted size to better fit the container */
    padding-bottom: calc(100% * 1.25);
    width: calc(100% * 1.25);
    background: conic-gradient(
      from -160deg at 50% 50%,
      var(--node-color, #FF5C00) 0deg,
      color-mix(in srgb, var(--node-color, #FF5C00), white 20%) 120deg,
      var(--node-color, #FF5C00) 240deg,
      color-mix(in srgb, var(--node-color, #FF5C00), white 20%) 360deg
    );
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    z-index: -1;
    transition: background 0.3s ease;
  }

  .inner {
    background: #0C0D10;
    padding: 12px 16px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    position: relative;
  }

  .body {
    display: flex;
  }

  .icon {
    margin-right: 8px;
  }

  .title {
    font-size: 16px;
    margin-bottom: 2px;
    line-height: 1;
  }

  .subtitle {
    font-size: 12px;
    color: var(--node-color);
  }

  .cloud {
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
    box-shadow: 0 0 20px var(--node-shadow, rgba(255, 92, 0, 0.5));
    transition: box-shadow 0.3s ease;
    z-index: 1;
  }

  .cloud div {
    background-color: #0C0D10;
    flex-grow: 1;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  /* Active state */
  :global(.active .wrapper) {
    --node-color: var(--node-green, #00C853);
    --node-color-rgb: var(--node-green-rgb, 0, 200, 83);
    --node-shadow: rgba(var(--node-green-rgb, 0, 200, 83), 0.5);
    box-shadow: 0 0 25px var(--node-shadow);
  }
  
  /* Processing state */
  :global(.processing .wrapper) {
    --node-color: var(--node-yellow, #FFC107);
    --node-color-rgb: var(--node-yellow-rgb, 255, 193, 7);
    --node-shadow: rgba(var(--node-yellow-rgb, 255, 193, 7), 0.5); 
    box-shadow: 0 0 25px var(--node-shadow);
  }
  
  /* Completed state */
  :global(.completed .wrapper) {
    --node-color: var(--node-green, #00C853);
    --node-color-rgb: var(--node-green-rgb, 0, 200, 83);
    --node-shadow: rgba(var(--node-green-rgb, 0, 200, 83), 0.5);
    box-shadow: 0 0 25px var(--node-shadow);
  }
  
  /* Remove the old state-specific :global rules and keep just the subtitle colors */
  :global(.active .subtitle),
  :global(.completed .subtitle) {
    color: #00E676 !important;
  }
  
  :global(.processing .subtitle) {
    color: #FFD54F !important;
  }
  
  @keyframes spinner {
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }

  .input-container {
    margin-top: 8px;
    width: 100%;
  }
  
  .input-container form {
    display: flex;
    position: relative;
  }
  
  .node-input {
    width: 100%;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 12px;
    outline: none;
    transition: all 0.2s;
  }
  
  .node-input:focus {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
  
  .input-submit {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--node-color);
    border: none;
    border-radius: 3px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  
  .input-submit:hover {
    opacity: 1;
  }
  
  .response-container {
    margin-top: 8px;
    max-height: 160px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.3);
  }
  
  .response-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .response-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  .response-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  .response-text {
    font-size: 12px;
    line-height: 1.5;
    color: white;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style> 