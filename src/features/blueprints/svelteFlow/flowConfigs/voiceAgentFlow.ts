import { 
  Mic, 
  Volume2, 
  Bot, 
  Play,
} from '@lucide/svelte';
import GroqIcon from '@shared/components/icons/GroqIcon.svelte';
import { Position, type Node, type Edge } from '@xyflow/svelte';
import { defaultTheme } from '../themes/defaultTheme';

// Function to get the Voice Agent Flow configuration
export function getDefaultVoiceAgentFlow() {
  const theme = defaultTheme;

  // Helper function for node click events
  const createNodeClickHandler = (id: string) => {
    return () => {
      // Dispatch a custom event on the document that can be captured by listeners
      if (typeof document !== 'undefined') {
        const event = new CustomEvent('flow:nodeClick', {
          bubbles: true,
          composed: true,
          detail: { nodeId: id }
        });
        document.dispatchEvent(event);
      }
    };
  };

  // Define nodes
  const nodes: Node[] = [
    // Start node
    { 
      id: 'start', 
      type: 'turbo', 
      data: { 
        label: 'Start',
        icon: Play,
        subtitle: 'Control',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('start'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 50, y: 150 },
    },
    
    // Mic On? Decision
    { 
      id: 'mic-on', 
      type: 'turbo', 
      data: { 
        label: 'Mic On?',
        icon: Mic,
        subtitle: 'Input',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('mic-on'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 250, y: 150 },
    },
    
    // VAD Decision
    { 
      id: 'vad', 
      type: 'turbo', 
      data: { 
        label: 'VAD',
        icon: Mic,
        subtitle: 'Voice Activity',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('vad'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 450, y: 150 },
    },
    
    // STT Process
    { 
      id: 'stt', 
      type: 'turbo', 
      data: { 
        label: 'STT',
        icon: Mic,
        cornerIcon: GroqIcon,
        subtitle: 'Speech to Text',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('stt'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 250, y: 350 },
    },
    
    // LLM Process
    { 
      id: 'llm', 
      type: 'turbo', 
      data: { 
        label: 'LLM',
        icon: Bot,
        cornerIcon: GroqIcon,
        subtitle: 'Inference',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('llm'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 450, y: 350 },
    },
    
    // TTS Process
    { 
      id: 'tts', 
      type: 'turbo', 
      data: { 
        label: 'TTS',
        icon: Volume2,
        cornerIcon: GroqIcon,
        subtitle: 'Text to Speech',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('tts'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 650, y: 350 },
    },
    
    // Audio Response Process
    { 
      id: 'audio-response', 
      type: 'turbo', 
      data: { 
        label: 'Audio Response',
        icon: Volume2,
        subtitle: 'Output',
        sourcePosition: Position.Left,
        targetPosition: Position.Left,
        onClick: createNodeClickHandler('audio-response'),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      }, 
      position: { x: 850, y: 350 },
    },
  ];
  
  // Define edges
  const edges: Edge[] = [
    // Start to Mic On
    { 
      id: 'e-start-mic', 
      source: 'start', 
      target: 'mic-on', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
    },
    
    // Mic On to VAD (Yes path)
    { 
      id: 'e-mic-vad', 
      source: 'mic-on', 
      target: 'vad', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
      label: 'Yes',
      labelStyle: 'fill: white; font-weight: 500',
    },
    
    // VAD to STT (Voice Detected)
    { 
      id: 'e-vad-stt', 
      source: 'vad', 
      target: 'stt', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
      label: 'Voice Detected',
      labelStyle: 'fill: white; font-weight: 500',
    },
    
    // STT to LLM
    { 
      id: 'e-stt-llm', 
      source: 'stt', 
      target: 'llm', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
    },
    
    // LLM to TTS
    { 
      id: 'e-llm-tts', 
      source: 'llm', 
      target: 'tts', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
    },
    
    // TTS to Audio Response
    { 
      id: 'e-tts-audio', 
      source: 'tts', 
      target: 'audio-response', 
      animated: true, 
      style: `stroke: ${theme.stages.init.color}; stroke-width: 2;`,
      type: 'smoothstep',
    },
  ];

  return {
    nodes,
    edges,
    theme
  };
} 