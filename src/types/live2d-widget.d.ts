declare module 'live2d-widget' {
  interface Live2DModelConfig {
    jsonPath: string;
    scale?: number;
  }

  interface Live2DDisplayConfig {
    position: 'left' | 'right';
    width: number;
    height: number;
    hOffset: number;
    vOffset: number;
  }

  interface Live2DMobileConfig {
    show: boolean;
    scale: number;
  }

  interface Live2DReactConfig {
    opacityDefault: number;
    opacityOnHover: number;
  }

  interface Live2DConfig {
    model: Live2DModelConfig;
    display: Live2DDisplayConfig;
    mobile: Live2DMobileConfig;
    react: Live2DReactConfig;
  }

  const L2Dwidget: {
    init: (config: Live2DConfig) => void;
  };

  export default L2Dwidget;
} 