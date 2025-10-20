# 🌸 Spring 动画系统使用指南

## 概述

全新的 Spring 动画系统基于物理世界的运动规律，为所有 UI 元素提供自然、流畅的动画效果。

## Spring 预设配置

### 🌸 Gentle (温柔优雅)
**适用场景**: 页面入场、卡片展开、大型元素
```typescript
import { SPRING_PRESETS } from '@/utils/animation-engine';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={SPRING_PRESETS.gentle}
/>
```

### 💫 Smooth (流畅平滑)
**适用场景**: 列表项、表单交互、中等元素
```typescript
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={SPRING_PRESETS.smooth}
/>
```

### ⚡ Snappy (敏捷快速)
**适用场景**: 按钮、图标、小元素、快速响应
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={SPRING_PRESETS.snappy}
/>
```

### 🚀 Stiff (强劲有力)
**适用场景**: 模态框、抽屉、重要提示
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={SPRING_PRESETS.stiff}
/>
```

### 🎈 Bouncy (弹性十足)
**适用场景**: 趣味交互、特殊效果、需要回弹的元素
```typescript
<motion.div
  whileHover={{ scale: 1.1 }}
  transition={SPRING_PRESETS.bouncy}
/>
```

### 🍃 Floaty (轻盈飘逸)
**适用场景**: 悬浮元素、提示框、轻量级交互
```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={SPRING_PRESETS.floaty}
/>
```

### 🎯 Precise (精准到位)
**适用场景**: 拖拽、定位、需要精确控制的元素
```typescript
<motion.div
  drag
  dragElastic={0.1}
  transition={SPRING_PRESETS.precise}
/>
```

### 🌊 Slow (缓慢流动)
**适用场景**: 大型元素、背景、需要缓慢移动的内容
```typescript
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={SPRING_PRESETS.slow}
/>
```

## 使用 Animation Engine Hook

### 基础用法

```typescript
import { useAnimationEngine } from '@/utils/animation-engine';

function MyComponent() {
  const { variants, springConfig, hoverProps } = useAnimationEngine();

  return (
    <motion.div
      variants={variants.fadeIn}
      initial="hidden"
      animate="visible"
    >
      <motion.button {...hoverProps}>
        点击我
      </motion.button>
    </motion.div>
  );
}
```

### 可用的 Variants

```typescript
const { variants } = useAnimationEngine();

// 基础动画
variants.fadeIn       // 淡入 + 向上移动
variants.scale        // 缩放 + 淡入
variants.float        // 轻盈浮动

// 滑入动画
variants.slideInLeft
variants.slideInRight
variants.slideInTop
variants.slideInBottom

// 容器和列表
variants.stagger      // 交错容器
variants.listItem     // 列表项
variants.card         // 卡片

// 特殊动画
variants.modal        // 模态框
variants.scrollReveal // 滚动入场
variants.button       // 按钮交互
```

### 列表交错动画

```typescript
function List({ items }) {
  const { variants } = useAnimationEngine();

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={variants.listItem}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 自定义 Spring 参数

```typescript
import { SPRING_PRESETS } from '@/utils/animation-engine';

// 基于预设修改
const customSpring = {
  ...SPRING_PRESETS.smooth,
  stiffness: 200, // 自定义刚度
};

<motion.div
  animate={{ x: 100 }}
  transition={customSpring}
/>

// 完全自定义
const mySpring = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
  mass: 1,
};
```

## Spring 参数详解

### Stiffness (刚度)
- 范围: 50 - 1000
- 值越大，弹簧越硬，动画越快
- 推荐值:
  - 柔和: 80-150
  - 中等: 150-250
  - 快速: 250-400
  - 极快: 400+

### Damping (阻尼)
- 范围: 5 - 50
- 值越大，减速越快，回弹越少
- 推荐值:
  - 明显回弹: 8-15
  - 轻微回弹: 15-25
  - 无回弹: 25-40
  - 极快停止: 40+

### Mass (质量)
- 范围: 0.1 - 5
- 影响动画的惯性
- 推荐值:
  - 轻盈: 0.3-0.6
  - 正常: 0.6-1.2
  - 沉重: 1.2-3

## 性能优化

### 自动性能适配

动画引擎会根据设备性能自动调整动画参数：

```typescript
const { level, metrics, fps } = useAnimationEngine();

console.log('性能等级:', level); // ultra | high | medium | low | minimal
console.log('当前 FPS:', fps);
console.log('设备信息:', metrics);
```

### 减少动画（Reduced Motion）

系统会自动检测用户的 `prefers-reduced-motion` 设置：

```typescript
const { shouldReduceMotion } = useAnimationEngine();

if (shouldReduceMotion) {
  // 使用简单动画或禁用动画
}
```

### 动画调度

对于复杂场景，使用动画调度器：

```typescript
const { scheduleAnimation } = useAnimationEngine();

scheduleAnimation(() => {
  // 执行动画
}, 'high'); // 优先级: critical | high | normal | low
```

## 最佳实践

### ✅ 推荐做法

1. **使用预设**: 优先使用 SPRING_PRESETS，保持一致性
2. **性能优先**: 让系统自动适配性能
3. **语义化**: 根据元素类型选择合适的 variants
4. **适度动画**: 不要过度使用动画

```typescript
// ✅ 好的做法
<motion.div
  variants={variants.card}
  initial="hidden"
  animate="visible"
/>

// ✅ 自定义时基于预设
const customSpring = { ...SPRING_PRESETS.smooth, stiffness: 200 };
```

### ❌ 避免的做法

```typescript
// ❌ 避免硬编码
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>

// ❌ 避免过度复杂的动画
<motion.div
  animate={{
    x: [0, 100, 50, 100],
    y: [0, 50, 25, 0],
    rotate: [0, 180, 90, 360],
  }}
/>
```

## 迁移指南

### 从旧的动画系统迁移

```typescript
// 旧版本 (cubic-bezier)
<motion.div
  animate={{ y: 0 }}
  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
/>

// 新版本 (Spring)
<motion.div
  animate={{ y: 0 }}
  transition={SPRING_PRESETS.gentle}
/>
```

### 从硬编码迁移到 Hook

```typescript
// 之前
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 现在
const { variants } = useAnimationEngine();
// 直接使用 variants.fadeIn
```

## 调试技巧

### 查看性能指标

```typescript
const { metrics, fps, level } = useAnimationEngine();

useEffect(() => {
  console.table({
    '性能等级': level,
    'FPS': fps.toFixed(2),
    'CPU 核心': metrics.cores,
    '内存 (GB)': metrics.memory,
    'WebGL': metrics.hasWebGL ? '支持' : '不支持',
    '设备像素比': metrics.devicePixelRatio,
  });
}, [metrics, fps, level]);
```

### 临时禁用性能优化

```typescript
// 在开发环境中强制使用最佳动画
const { variants } = useAnimationEngine();
const cardVariants = AnimationVariants.card('ultra'); // 强制使用 ultra 级别
```

## 示例场景

### 页面入场动画

```typescript
function HomePage() {
  const { variants } = useAnimationEngine();

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={variants.fadeIn}>
        欢迎
      </motion.h1>
      <motion.p variants={variants.fadeIn}>
        描述文字
      </motion.p>
      <motion.div variants={variants.card}>
        卡片内容
      </motion.div>
    </motion.div>
  );
}
```

### 模态框动画

```typescript
function Modal({ isOpen, onClose, children }) {
  const { variants } = useAnimationEngine();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={variants.modal}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 按钮交互

```typescript
function Button({ children, onClick }) {
  const { hoverProps } = useAnimationEngine();

  return (
    <motion.button
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </motion.button>
  );
}
```

## 总结

Spring 动画系统提供了：
- 🌸 8 种精心调校的预设配置
- 🎯 自动性能适配
- 📦 开箱即用的 variants
- 🚀 更自然的物理运动
- ✨ 更好的用户体验

立即开始使用，让你的界面动起来！

