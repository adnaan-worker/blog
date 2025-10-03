// 定义共享类型，避免循环依赖
import React from 'react';

// 通用的消息类型定义
export type MessageType = 'success' | 'info' | 'warning' | 'error';

// Toast相关类型
export interface ToastOptions {
  type: MessageType;
  message: string;
  title?: string;
  duration?: number;
}

// Alert相关类型
export interface AlertOptions {
  type: MessageType;
  message: string;
  title?: string;
  duration?: number;
  closable?: boolean;
}

// Confirm相关类型
export interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

// Tooltip相关类型
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipOptions {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  maxWidth?: string;
  duration?: number;
}
