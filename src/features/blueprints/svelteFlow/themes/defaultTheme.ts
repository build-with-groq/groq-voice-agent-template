// Default theme colors for the flow diagram
const orangeColor = '#FF5C00';
const orangeShadow = 'rgba(255, 92, 0, 0.3)';
const greenColor = '#00C853';
const greenShadow = 'rgba(0, 200, 83, 0.3)';
const yellowColor = '#FFC107';
const yellowShadow = 'rgba(255, 193, 7, 0.3)';
const redColor = '#F44336';
const redShadow = 'rgba(244, 67, 54, 0.3)';

// Theme configuration for different node states
export const defaultTheme = {
  colors: {
    primary: orangeColor,
    primaryShadow: orangeShadow,
    success: greenColor,
    successShadow: greenShadow,
    warning: yellowColor,
    warningShadow: yellowShadow,
    error: redColor,
    errorShadow: redShadow,
    background: '#0C0D10',
    text: '#ffffff',
    subtitleText: '#FF7E38'
  },
  stages: {
    init: { color: orangeColor, shadow: orangeShadow },
    decision: { color: orangeColor, shadow: orangeShadow },
    process: { color: orangeColor, shadow: orangeShadow },
    idle: { color: orangeColor, shadow: orangeShadow },
    active: { color: greenColor, shadow: greenShadow },
    processing: { color: yellowColor, shadow: yellowShadow },
    stop: { color: redColor, shadow: redShadow }
  },
  borderRadius: '10px',
  nodeHeight: '70px',
  nodeMinWidth: '150px'
}; 