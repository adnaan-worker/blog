# 🚀 Adnaan Animation Engine - 使用指南

## 📖 概述

这是一个**超级智能的动画引擎**，提供：

- ✅ **实时性能监控**：动态FPS检测，自动调整动画质量
- ✅ **智能调度系统**：优先级队列，避免动画阻塞
- ✅ **自适应变体**：根据设备性能自动选择最佳动画
- ✅ **GPU加速优化**：所有动画默认硬件加速
- ✅ **零配置使用**：开箱即用，自动优化

## 🎯 核心特性

### 1. 智能性能检测

引擎会实时监控：
- **FPS（帧率）**：每100帧计算一次平均值
- **设备内存**：自动检测可用内存
- **CPU核心数**：优化并发动画数量
- **WebGL支持**：硬件加速能力检测
- **网络连接**：判断是否需要降低资源消耗
- **用户偏好**：自动检测`prefers-reduced-motion`

### 2. 五级性能模式

| 级别 | FPS | 特性 | 适用场景 |
|------|-----|------|----------|
| **Ultra** | ≥55 | 完整动画 + 高质量过渡 | 高端设备 |
| **High** | 45-55 | 标准动画 + 优化过渡 | 中高端设备 |
| **Medium** | 30-45 | 简化动画 + 快速过渡 | 普通设备 |
| **Low** | 20-30 | 极简动画 + 最短时长 | 低端设备 |
| **Minimal** | <20 | 仅淡入淡出 | 极低端设备 |

### 3. 动画调度器

智能调度系统，按优先级执行动画：
- **Critical**：关键交互动画（优先级 4）
- **High**：重要内容动画（优先级 3）
- **Normal**：常规动画（优先级 2）
- **Low**：装饰性动画（优先级 1）

## 📚 使用方法

### 基础使用

```typescript
import { useAnimationEngine } from '@/utils/animation-engine';
import { motion } from 'framer-motion';

const MyComponent = () => {
  const { variants, metrics, level } = useAnimationEngine();

  return (
    <motion.div
      variants={variants.fadeIn}
      initial="hidden"
      animate="visible"
    >
      内容
    </motion.div>
  );
};
```

### 完整示例

```typescript
import { useAnimationEngine } from '@/utils/animation-engine';
import { motion } from 'framer-motion';

const ArticleList = () => {
  const {
    variants,        // 动画变体
    metrics,         // 性能指标
    level,           // 性能等级
    fps,             // 当前FPS
    config,          // 动画配置
    scheduleAnimation, // 调度动画
    hoverProps,      // 悬停动画
  } = useAnimationEngine();

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
    >
      {articles.map((article) => (
        <motion.article
          key={article.id}
          variants={variants.card}
          {...hoverProps}
        >
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
        </motion.article>
      ))}
    </motion.div>
  );
};
```

### 调度关键动画

```typescript
const handleImportantAction = () => {
  // 将关键动画添加到高优先级队列
  scheduleAnimation(() => {
    // 执行动画逻辑
    setShowModal(true);
  }, 'critical');
};
```

## 🎨 可用动画变体

### 1. 淡入动画

```typescript
<motion.div variants={variants.fadeIn}>
  内容
</motion.div>
```

**效果**：
- Ultra/High: 向上淡入 (y: 20 → 0)
- Medium/Low: 向上淡入 (y: 20 → 0, 较快)
- Minimal: 纯淡入 (无位移)

### 2. 滑入动画

```typescript
// 从左滑入
<motion.div variants={variants.slideInLeft}>内容</motion.div>

// 从右滑入
<motion.div variants={variants.slideInRight}>内容</motion.div>

// 从上滑入
<motion.div variants={variants.slideInTop}>内容</motion.div>

// 从下滑入
<motion.div variants={variants.slideInBottom}>内容</motion.div>
```

### 3. 缩放动画

```typescript
<motion.div variants={variants.scale}>
  内容
</motion.div>
```

**效果**：
- Ultra/High: scale: 0.9 → 1.0
- Minimal: 无缩放

### 4. 交错动画（列表）

```typescript
<motion.ul variants={variants.stagger}>
  {items.map((item) => (
    <motion.li key={item.id} variants={variants.listItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**交错延迟**：
- Ultra: 0.08s
- High: 0.05s
- Medium: 0.03s
- Low: 0.02s
- Minimal: 0s

### 5. 卡片动画

```typescript
<motion.div variants={variants.card}>
  卡片内容
</motion.div>
```

**效果**：
- Ultra/High: y: 15 → 0, scale: 0.95 → 1.0
- Medium/Low: y: 15 → 0, scale: 0.95 → 1.0 (较快)
- Minimal: 仅淡入

### 6. 模态框动画

```typescript
<motion.div
  variants={variants.modal}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  模态框内容
</motion.div>
```

## 🔧 高级用法

### 1. 获取性能指标

```typescript
const { metrics, fps } = useAnimationEngine();

console.log('当前FPS:', fps);
console.log('性能等级:', metrics.level);
console.log('WebGL支持:', metrics.hasWebGL);
console.log('CPU核心:', metrics.cores);
console.log('设备内存:', metrics.memory, 'GB');
```

### 2. 自定义动画配置

```typescript
const { config, easing } = useAnimationEngine();

const customVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: config.duration, // 自动适配
      ease: config.ease,
    },
  },
};
```

### 3. 使用悬停动画

```typescript
const { hoverProps } = useAnimationEngine();

return (
  <motion.button {...hoverProps}>
    点击我
  </motion.button>
);
```

**效果**：
- 悬停时：scale: 1.02, y: -2
- 点击时：scale: 0.98
- Minimal模式：无动画

### 4. 条件渲染动画

```typescript
const { level, shouldReduceMotion } = useAnimationEngine();

return (
  <div>
    {level === 'ultra' && <AdvancedAnimation />}
    {!shouldReduceMotion && <ParticleEffect />}
  </div>
);
```

## 📊 性能优化建议

### 1. 关键动画优先

```typescript
// ❌ 错误 - 所有动画同时执行
useEffect(() => {
  setShowModal(true);
  setShowToast(true);
  setShowSidebar(true);
}, []);

// ✅ 正确 - 按优先级调度
useEffect(() => {
  scheduleAnimation(() => setShowModal(true), 'critical');
  scheduleAnimation(() => setShowToast(true), 'normal');
  scheduleAnimation(() => setShowSidebar(true), 'low');
}, [scheduleAnimation]);
```

### 2. 避免重复渲染

```typescript
// ❌ 错误 - 每次渲染都创建新对象
const MyComponent = () => {
  const { variants } = useAnimationEngine();
  const customVariants = { ...variants.fadeIn }; // 每次都创建
  
  return <motion.div variants={customVariants}>内容</motion.div>;
};

// ✅ 正确 - 使用 useMemo
const MyComponent = () => {
  const { variants } = useAnimationEngine();
  const customVariants = useMemo(() => ({
    ...variants.fadeIn,
  }), [variants.fadeIn]);
  
  return <motion.div variants={customVariants}>内容</motion.div>;
};
```

### 3. 懒加载重动画

```typescript
// 只在高性能设备上加载复杂动画
const { level } = useAnimationEngine();

const ComplexAnimation = lazy(() => import('./ComplexAnimation'));

return (
  <div>
    {level === 'ultra' && (
      <Suspense fallback={null}>
        <ComplexAnimation />
      </Suspense>
    )}
  </div>
);
```

## 🎯 最佳实践

### 1. 页面入场动画

```typescript
const HomePage = () => {
  const { variants } = useAnimationEngine();
  
  return (
    <motion.main
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.section variants={variants.fadeIn}>
        <h1>标题</h1>
      </motion.section>
      
      <motion.section variants={variants.card}>
        <ArticleList />
      </motion.section>
    </motion.main>
  );
};
```

### 2. 列表动画

```typescript
const TodoList = () => {
  const { variants } = useAnimationEngine();
  
  return (
    <motion.ul variants={variants.stagger}>
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.li
            key={todo.id}
            variants={variants.listItem}
            exit={{ opacity: 0, x: -20 }}
          >
            {todo.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
};
```

### 3. 模态框动画

```typescript
const Modal = ({ isOpen, onClose, children }) => {
  const { variants } = useAnimationEngine();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 模态框内容 */}
          <motion.div
            variants={variants.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

## 📈 性能监控

### 查看实时性能

```typescript
const PerformanceDebug = () => {
  const { metrics, fps, level } = useAnimationEngine();
  
  return (
    <div style={{ position: 'fixed', top: 10, right: 10 }}>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Level: {level}</div>
      <div>WebGL: {metrics.hasWebGL ? '✅' : '❌'}</div>
      <div>Cores: {metrics.cores}</div>
      <div>Memory: {metrics.memory}GB</div>
    </div>
  );
};
```

## 🔄 从旧API迁移

### 旧版（animation-utils.ts）

```typescript
import { useAnimationOptimization } from '@/utils/animation-utils';

const { fadeInUp, staggerContainer } = useAnimationOptimization();
```

### 新版（animation-engine.ts）

```typescript
import { useAnimationEngine } from '@/utils/animation-engine';

const { variants } = useAnimationEngine();
// variants.fadeIn 替代 fadeInUp
// variants.stagger 替代 staggerContainer
```

## 🎉 总结

**Adnaan Animation Engine** 提供：

1. **零配置**：开箱即用，自动优化
2. **智能调度**：自动检测性能，动态调整
3. **实时监控**：FPS实时监控，性能等级动态变化
4. **优先级队列**：关键动画优先执行
5. **完全类型安全**：TypeScript完整支持

**现在你的动画系统是业界领先水平！** 🚀

