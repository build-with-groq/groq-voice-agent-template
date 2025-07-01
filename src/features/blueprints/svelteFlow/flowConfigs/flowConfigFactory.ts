import { Position, type Node, type Edge } from '@xyflow/svelte';
import { defaultTheme } from '../themes/defaultTheme';

// Node configuration interface
export interface NodeConfig {
  id: string;
  label: string;
  icon: any; // Allow any component type including Lucide icons
  cornerIcon?: any;
  subtitle?: string;
  position: { x: number, y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
  type?: string;
  // New properties for interactive nodes
  showInput?: boolean;
  showResponse?: boolean;
  inputValue?: string;
  responseValue?: string;
  onInputChange?: (value: string) => void;
  onInputSubmit?: (value: string) => void;
  // Style properties
  style?: {
    width?: number;
    height?: number;
    [key: string]: any;
  };
}

// Edge configuration interface
export interface EdgeConfig {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  targetHandle?: string;
  sourceHandle?: string;
}

// Flow configuration interface
export interface FlowConfig {
  nodes: Node[];
  edges: Edge[];
  theme: any;
}

/**
 * Flow configuration factory for creating customized flow diagrams
 */
export class FlowConfigFactory {
  private theme: any;
  private nodeConfigs: NodeConfig[] = [];
  private edgeConfigs: EdgeConfig[] = [];
  
  constructor(customTheme?: any) {
    this.theme = customTheme || defaultTheme;
  }
  
  /**
   * Add a node to the flow configuration
   */
  addNode(config: NodeConfig): FlowConfigFactory {
    this.nodeConfigs.push(config);
    return this;
  }
  
  /**
   * Add an edge between nodes
   */
  addEdge(config: EdgeConfig): FlowConfigFactory {
    this.edgeConfigs.push(config);
    return this;
  }
  
  /**
   * Set custom theme
   */
  setTheme(theme: any): FlowConfigFactory {
    this.theme = theme;
    return this;
  }
  
  /**
   * Helper function to create a path between nodes
   */
  connectNodes(sourceId: string, targetId: string, options?: {
    label?: string;
    type?: string;
    style?: string;
    sourceHandle?: string;
    targetHandle?: string;
  }): FlowConfigFactory {
    const edgeId = `e-${sourceId}-${targetId}`;
    const defaultType = 'smoothstep';
    const defaultStyle = `stroke: ${this.theme.stages.process.color}; stroke-width: 2;`;
    
    this.addEdge({
      id: edgeId,
      source: sourceId,
      target: targetId,
      label: options?.label,
      type: options?.type || defaultType,
      targetHandle: options?.targetHandle,
      sourceHandle: options?.sourceHandle
    });
    
    return this;
  }
  
  /**
   * Create node click handler
   */
  private createNodeClickHandler(id: string) {
    return () => {
    };
  }
  
  /**
   * Build the flow configuration
   */
  build(): FlowConfig {
    // Transform node configs to actual nodes
    const nodes: Node[] = this.nodeConfigs.map(config => ({
      id: config.id,
      type: config.type || 'turbo',
      data: {
        label: config.label,
        icon: config.icon,
        cornerIcon: config.cornerIcon,
        subtitle: config.subtitle,
        sourcePosition: config.sourcePosition || Position.Right,
        targetPosition: config.targetPosition || Position.Left,
        onClick: this.createNodeClickHandler(config.id),
        isActive: false,
        isProcessing: false,
        isCompleted: false
      },
      position: config.position
    }));
    
    // Transform edge configs to actual edges
    const edges: Edge[] = this.edgeConfigs.map(config => ({
      id: config.id,
      source: config.source,
      target: config.target,
      label: config.label,
      animated: true,
      style: `stroke: ${this.theme.stages.process.color}; stroke-width: 2;`,
      type: config.type || 'smoothstep',
      targetHandle: config.targetHandle,
      sourceHandle: config.sourceHandle,
      labelStyle: config.label ? 'fill: white; font-weight: 500' : undefined
    }));
    
    return {
      nodes,
      edges,
      theme: this.theme
    };
  }
} 