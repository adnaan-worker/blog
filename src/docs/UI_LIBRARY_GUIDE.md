# UI 组件库使用指南

## 🚀 快速开始

### 安装和初始化

```typescript
// 在 main.tsx 中初始化
import UI from '@/ui';

// 安装UI组件库到全局
UI.install(); // 或 UI.init()
```

初始化后，您就可以通过多种方式使用 UI 组件了。

## 📚 使用方式

### 方式 1：具名导入（推荐）

```typescript
import { toast, alert, confirm, tooltip } from '@/ui';

// 使用
toast.success('操作成功！');
alert.error('出现错误！');
const result = await confirm({ title: '确认删除', message: '此操作不可撤销' });
tooltip.show(element, '提示信息');
```

**适用场景**：React 组件内部，明确知道要使用哪些 UI 组件

### 方式 2：默认导入

```typescript
import UI from '@/ui';

// 使用
UI.toast.success('操作成功！');
UI.alert.error('出现错误！');
const result = await UI.confirm({ title: '确认删除', message: '此操作不可撤销' });
UI.tooltip.show(element, '提示信息');
```

**适用场景**：需要使用多个 UI 组件，保持代码整洁

### 方式 3：全局使用（无需导入）

```typescript
// 直接使用全局对象
adnaan.toast.success('操作成功！');
adnaan.alert.error('出现错误！');
const result = await adnaan.confirm({ title: '确认删除', message: '此操作不可撤销' });
adnaan.tooltip.show(element, '提示信息');
```

**适用场景**：非 React 代码中使用，如普通 JavaScript 函数、工具函数等

### 方式 4：全局简写

```typescript
// 更简洁的全局使用方式
Toast.success('操作成功！');
Alert.error('出现错误！');
const result = await Confirm({ title: '确认删除', message: '此操作不可撤销' });
Tooltip.show(element, '提示信息');
```

**适用场景**：频繁使用 UI 组件的场景

## 🍞 Toast 轻提示

轻量级的消息提示，会自动消失。

### 基本用法

```typescript
// 四种类型
toast.success('成功消息');
toast.error('错误消息');
toast.info('信息消息');
toast.warning('警告消息');

// 自定义标题和持续时间
toast.success('操作完成', '成功', 5000);

// 完全自定义
toast.show({
  type: 'success',
  message: '自定义消息',
  title: '自定义标题',
  duration: 3000,
});
```

### 全局使用

```typescript
// 在任何地方使用
adnaan.toast.success('全局提示');
Toast.error('简写提示');
```

## 🚨 Alert 警告提示

更醒目的提示框，可以手动关闭。

### 基本用法

```typescript
// 四种类型
const id1 = alert.success('成功消息', '成功');
const id2 = alert.error('错误消息', '错误');
const id3 = alert.info('信息消息', '信息');
const id4 = alert.warning('警告消息', '警告');

// 手动关闭
alert.close(id1);

// 完全自定义
const id = alert.show({
  type: 'info',
  message: '自定义消息',
  title: '自定义标题',
  duration: 5000,
  closable: true,
});
```

### 全局使用

```typescript
adnaan.alert.success('全局Alert');
Alert.error('简写Alert');
```

## ❓ Confirm 确认对话框

模态确认对话框，返回 Promise<boolean>。

### 基本用法

```typescript
// 基本确认
const result = await confirm({
  title: '确认操作',
  message: '您确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  confirmVariant: 'primary', // 'primary' | 'danger'
});

if (result) {
  console.log('用户选择了确定');
} else {
  console.log('用户选择了取消');
}
```

### 快捷方法

```typescript
// 删除确认
const deleteResult = await confirmDialog.delete('此操作将永久删除该数据，是否继续？', '确认删除');

// 保存确认
const saveResult = await confirmDialog.save('确认保存更改？', '保存确认');

// 通用确认
const confirmResult = await confirmDialog.confirm('确认操作', '您确定要执行此操作吗？', '确定', '取消');
```

### 全局使用

```typescript
const result = await adnaan.confirm({
  title: '全局确认',
  message: '这是全局确认对话框',
});

// 简写方式
const deleteResult = await Confirm.delete();
const saveResult = await Confirm.save();
```

## 💡 Tooltip 工具提示

元素悬停或点击时显示的提示信息。

### 基本用法

```typescript
// 基本显示
const closeTooltip = tooltip.show(targetElement, '这是提示内容', {
  placement: 'top', // 'top' | 'bottom' | 'left' | 'right'
  maxWidth: '200px',
  duration: 3000, // 0 表示不自动关闭
});

// 手动关闭
closeTooltip();

// 关闭所有提示
tooltip.hide();
```

### React 事件中使用

```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  tooltip.show(event.currentTarget, '点击后显示的提示', { placement: 'bottom' });
};

<button onClick={handleClick}>点击显示提示</button>;
```

### 全局使用

```typescript
adnaan.tooltip.show(element, '全局提示');
Tooltip.show(element, '简写提示');
```

## 🔧 高级配置

### 自定义样式

UI 组件使用 CSS 变量，您可以通过覆盖这些变量来自定义样式：

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-color: #007bff;
  --accent-color-hover: #0056b3;
  --border-color: #dee2e6;
  --radius-small: 4px;
  --radius-medium: 8px;
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

### TypeScript 支持

所有 UI 组件都有完整的 TypeScript 类型定义：

```typescript
import type { ToastOptions, AlertOptions, ConfirmOptions, TooltipOptions } from '@/ui/common-types';

// 类型安全的使用
const options: ToastOptions = {
  type: 'success',
  message: '类型安全的消息',
  title: '标题',
  duration: 3000,
};

toast.show(options);
```

## 🌟 最佳实践

### 1. 在 React 组件中

```typescript
import { toast, confirm } from '@/ui';

const MyComponent = () => {
  const handleSave = async () => {
    try {
      const shouldSave = await confirm({
        title: '保存确认',
        message: '确认保存更改？',
      });

      if (shouldSave) {
        // 执行保存逻辑
        await saveData();
        toast.success('保存成功！');
      }
    } catch (error) {
      toast.error('保存失败！');
    }
  };

  return <button onClick={handleSave}>保存</button>;
};
```

### 2. 在工具函数中

```typescript
// utils/api.ts
const handleApiError = (error: any) => {
  // 使用全局UI，无需导入
  adnaan.toast.error(error.message || '请求失败');
};

const deleteItem = async (id: string) => {
  const shouldDelete = await adnaan.confirm.delete();
  if (shouldDelete) {
    try {
      await api.delete(`/items/${id}`);
      Toast.success('删除成功！'); // 简写方式
    } catch (error) {
      handleApiError(error);
    }
  }
};
```

### 3. 在 Redux 中间件中

```typescript
// store/middleware.ts
const errorMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (action.type.endsWith('/rejected')) {
    adnaan.toast.error('操作失败，请重试');
  }

  return result;
};
```

## 📖 API 参考

### Toast API

| 方法                                  | 参数                     | 返回值 | 描述           |
| ------------------------------------- | ------------------------ | ------ | -------------- |
| `success(message, title?, duration?)` | string, string?, number? | void   | 显示成功提示   |
| `error(message, title?, duration?)`   | string, string?, number? | void   | 显示错误提示   |
| `info(message, title?, duration?)`    | string, string?, number? | void   | 显示信息提示   |
| `warning(message, title?, duration?)` | string, string?, number? | void   | 显示警告提示   |
| `show(options)`                       | ToastOptions             | void   | 显示自定义提示 |

### Alert API

| 方法                                  | 参数                     | 返回值 | 描述                      |
| ------------------------------------- | ------------------------ | ------ | ------------------------- |
| `success(message, title?, duration?)` | string, string?, number? | string | 显示成功 Alert，返回 ID   |
| `error(message, title?, duration?)`   | string, string?, number? | string | 显示错误 Alert，返回 ID   |
| `info(message, title?, duration?)`    | string, string?, number? | string | 显示信息 Alert，返回 ID   |
| `warning(message, title?, duration?)` | string, string?, number? | string | 显示警告 Alert，返回 ID   |
| `show(options)`                       | AlertOptions             | string | 显示自定义 Alert，返回 ID |
| `close(id)`                           | string                   | void   | 关闭指定 Alert            |

### Confirm API

| 方法                                                               | 参数                                | 返回值           | 描述           |
| ------------------------------------------------------------------ | ----------------------------------- | ---------------- | -------------- |
| `confirm(options)`                                                 | ConfirmOptions                      | Promise<boolean> | 显示确认对话框 |
| `confirmDialog.confirm(title, message, confirmText?, cancelText?)` | string, ReactNode, string?, string? | Promise<boolean> | 通用确认       |
| `confirmDialog.delete(message?, title?)`                           | ReactNode?, string?                 | Promise<boolean> | 删除确认       |
| `confirmDialog.save(message?, title?)`                             | ReactNode?, string?                 | Promise<boolean> | 保存确认       |

### Tooltip API

| 方法                               | 参数                                    | 返回值     | 描述                   |
| ---------------------------------- | --------------------------------------- | ---------- | ---------------------- |
| `show(element, content, options?)` | HTMLElement, ReactNode, TooltipOptions? | () => void | 显示提示，返回关闭函数 |
| `hide()`                           | -                                       | void       | 关闭所有提示           |

## 🎯 总结

现在您的 UI 组件库已经像第三方库一样易用了！您可以：

1. **灵活导入**：支持具名导入、默认导入、全局使用等多种方式
2. **全局可用**：初始化后可在任何地方使用，无需重复导入
3. **类型安全**：完整的 TypeScript 支持
4. **简洁 API**：提供简写方式，使用更便捷
5. **一致体验**：API 设计与知名 UI 库保持一致

访问 `/ui-library-demo` 页面查看完整的交互式示例！
