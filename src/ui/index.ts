import toast from './toast';
import alert from './alert';
import confirmDialog, { confirm } from './confirm';
import tooltip from './tooltip';
import modal from './modal';
import { UI, initGlobalUI } from './global';

// 导出类型
export type * from './common-types';
export type { ModalOptions, ModalSize } from './modal';

// 导出所有UI工具函数
export const ui = {
  toast,
  alert,
  confirm,
  confirmDialog,
  tooltip,
  modal,

  // 全局初始化方法
  init: initGlobalUI,
};

// 单独导出便于直接使用
export { toast, alert, confirm, confirmDialog, tooltip, modal };

// 导出全局UI对象
export { UI, initGlobalUI };

// 默认导出 - 包含所有功能
export default {
  ...UI,
  ui,
  // 便捷方法
  install: initGlobalUI, // 类似Vue插件的install方法
};
