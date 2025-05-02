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
    pointerEvents?: string;
  }

  interface Live2DMobileConfig {
    show: boolean;
    scale: number;
  }

  interface Live2DReactConfig {
    opacityDefault: number;
    opacityOnHover: number;
    hover?: boolean;
    click?: boolean;
    tap?: boolean;
    tapRandom?: boolean;
    tapRandomInterval?: number;
    tapRandomMessages?: Array<{ message: string; weight: number }>;
  }

  interface Live2DDialogConfig {
    enable: boolean;
    hitokoto: boolean;
    messages: string[];
    delay: number;
    duration: number;
    width: number;
    height: number;
    opacity: number;
    fontSize: number;
    fontColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    padding: number;
    margin: number;
    position: string;
    offset: number;
    style: {
      display: string;
      visibility: string;
      opacity: number;
      zIndex: number;
    };
  }

  interface Live2DDevConfig {
    border: boolean;
    log: boolean;
  }

  interface Live2DToolConfig {
    enable: boolean;
    position: string;
    size: number;
  }

  interface Live2DConfig {
    model: Live2DModelConfig;
    display: Live2DDisplayConfig;
    mobile: Live2DMobileConfig;
    react: Live2DReactConfig;
    dialog?: Live2DDialogConfig;
    dev?: Live2DDevConfig;
    tool?: Live2DToolConfig;
    [key: string]: any; // 允许其他属性
  }

  interface L2DWidgetInterface {
    init: (config: Live2DConfig) => void;
  }

  // 同时支持两种导出方式
  const L2Dwidget: L2DWidgetInterface;
  export { L2Dwidget };
  export default L2Dwidget;
} 