import { ToastOptions } from './common-types';

// 事件发布订阅系统
type ToastEventListener = (payload: ToastOptions) => void;

class ToastEventBus {
  private static instance: ToastEventBus;
  private listeners: ToastEventListener[] = [];

  private constructor() {}

  public static getInstance(): ToastEventBus {
    if (!ToastEventBus.instance) {
      ToastEventBus.instance = new ToastEventBus();
    }
    return ToastEventBus.instance;
  }

  public subscribe(listener: ToastEventListener): () => void {
    this.listeners.push(listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public publish(event: ToastOptions): void {
    this.listeners.forEach(listener => listener(event));
  }
}

// 全局Toast API
const toast = {
  success: (message: string, title?: string, duration?: number) => {
    ToastEventBus.getInstance().publish({
      type: 'success',
      message,
      title,
      duration
    });
  },
  
  error: (message: string, title?: string, duration?: number) => {
    ToastEventBus.getInstance().publish({
      type: 'error',
      message,
      title,
      duration
    });
  },
  
  info: (message: string, title?: string, duration?: number) => {
    ToastEventBus.getInstance().publish({
      type: 'info',
      message,
      title,
      duration
    });
  },
  
  warning: (message: string, title?: string, duration?: number) => {
    ToastEventBus.getInstance().publish({
      type: 'warning',
      message,
      title,
      duration
    });
  },
  
  // 自定义类型通知
  show: (options: ToastOptions) => {
    ToastEventBus.getInstance().publish(options);
  }
};

// 导出事件总线实例，供ToastListener组件使用
export const toastEventBus = ToastEventBus.getInstance();

export default toast; 