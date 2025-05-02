
import toast from '../ui/toast';
import alert from '../ui/alert';
import confirmDialog, { confirm } from '../ui/confirm';
import tooltip from '../ui/tooltip';

// 导出所有UI工具函数
export const ui = {
  toast,
  alert,
  confirm,
  confirmDialog,
  tooltip,
};

// 单独导出便于直接使用
export { toast, alert, confirm, confirmDialog, tooltip };

// 默认导出
export default {
  ui,
  toast,
  alert,
  confirm,
  confirmDialog,
  tooltip,
};