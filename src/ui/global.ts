import toast from './toast';
import alert from './alert';
import confirmDialog, { confirm } from './confirm';
import tooltip from './tooltip';

/**
 * 全局UI初始化器
 * 将UI组件挂载到全局对象，实现像第三方UI库的使用体验
 */
export const initGlobalUI = () => {
  // 挂载到window对象
  if (typeof window !== 'undefined') {
    window.UI = {
      toast: {
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
        show: toast.show,
      },
      alert: {
        success: alert.success,
        error: alert.error,
        info: alert.info,
        warning: alert.warning,
        show: alert.show,
        close: alert.close,
      },
      confirm: Object.assign(confirm, confirmDialog),
      tooltip: {
        show: tooltip.show,
        hide: tooltip.hide,
      },
    };

    // 同时挂载到全局命名空间（可选）
    (window as any).Toast = window.UI.toast;
    (window as any).Alert = window.UI.alert;
    (window as any).Confirm = window.UI.confirm;
    (window as any).Tooltip = window.UI.tooltip;
  }
};

/**
 * UI组件库入口
 * 提供多种导入方式
 */
export const UI = {
  toast,
  alert,
  confirm: confirmDialog,
  confirmDialog,
  tooltip,

  // 初始化方法
  init: initGlobalUI,
};

// 默认导出
export default UI;

// 单独导出各组件（保持向后兼容）
export { toast, alert, confirm, confirmDialog, tooltip };
