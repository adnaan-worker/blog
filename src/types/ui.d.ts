import { ToastOptions, AlertOptions, ConfirmOptions, TooltipOptions } from '@/ui/common-types';

// 全局UI类型声明
declare global {
  interface Window {
    // 全局UI实例
    UI: {
      toast: {
        success: (message: string, title?: string, duration?: number) => void;
        error: (message: string, title?: string, duration?: number) => void;
        info: (message: string, title?: string, duration?: number) => void;
        warning: (message: string, title?: string, duration?: number) => void;
        show: (options: ToastOptions) => void;
      };
      alert: {
        success: (message: string, title?: string, duration?: number) => string;
        error: (message: string, title?: string, duration?: number) => string;
        info: (message: string, title?: string, duration?: number) => string;
        warning: (message: string, title?: string, duration?: number) => string;
        show: (options: AlertOptions) => string;
        close: (id: string) => void;
      };
      confirm: {
        (options: ConfirmOptions): Promise<boolean>;
        confirm: (
          title: string,
          message: React.ReactNode,
          confirmText?: string,
          cancelText?: string,
        ) => Promise<boolean>;
        delete: (message?: React.ReactNode, title?: string) => Promise<boolean>;
        save: (message?: React.ReactNode, title?: string) => Promise<boolean>;
        custom: (options: ConfirmOptions) => Promise<boolean>;
      };
      tooltip: {
        show: (
          element: HTMLElement,
          content: React.ReactNode,
          options?: {
            placement?: 'top' | 'bottom' | 'left' | 'right';
            maxWidth?: string;
            duration?: number;
          },
        ) => () => void;
        hide: () => void;
      };
    };
  }
}

// UI命名空间
declare namespace UI {
  // Toast相关
  namespace Toast {
    function success(message: string, title?: string, duration?: number): void;
    function error(message: string, title?: string, duration?: number): void;
    function info(message: string, title?: string, duration?: number): void;
    function warning(message: string, title?: string, duration?: number): void;
    function show(options: ToastOptions): void;
  }

  // Alert相关
  namespace Alert {
    function success(message: string, title?: string, duration?: number): string;
    function error(message: string, title?: string, duration?: number): string;
    function info(message: string, title?: string, duration?: number): string;
    function warning(message: string, title?: string, duration?: number): string;
    function show(options: AlertOptions): string;
    function close(id: string): void;
  }

  // Confirm相关 - 使用interface避免function语法问题
  interface Confirm {
    confirm(title: string, message: React.ReactNode, confirmText?: string, cancelText?: string): Promise<boolean>;
    delete(message?: React.ReactNode, title?: string): Promise<boolean>;
    save(message?: React.ReactNode, title?: string): Promise<boolean>;
    custom(options: ConfirmOptions): Promise<boolean>;
  }

  // Tooltip相关
  namespace Tooltip {
    function show(
      element: HTMLElement,
      content: React.ReactNode,
      options?: {
        placement?: 'top' | 'bottom' | 'left' | 'right';
        maxWidth?: string;
        duration?: number;
      },
    ): () => void;
    function hide(): void;
  }
}

export {};
