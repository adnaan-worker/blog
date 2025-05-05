import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import CodeBlock from '@/components/blog/code-block';

const PageContainer = styled.div`
  padding: 2rem 0;
  max-width: 900px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`;

const Subtitle = styled(motion.h2)`
  font-size: 1.75rem;
  margin: 2rem 0 1rem;
  color: var(--text-primary);
`;

const Paragraph = styled(motion.p)`
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
`;

const FontInfo = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
`;

const FontName = styled.div`
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border-radius: 6px;
  color: var(--accent-color);
  font-size: 0.9rem;
  font-family: var(--font-code);
  border: 1px solid var(--border-color);
`;

const animationProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const javaScriptSample = `// JavaScript 示例代码
function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let prevPrev = 0;
  let prev = 1;
  let current = 0;
  
  for (let i = 2; i <= n; i++) {
    current = prev + prevPrev;
    prevPrev = prev;
    prev = current;
  }
  
  return current;
}

// 测试函数
const result = calculateFibonacci(10);
console.log(\`第10个斐波那契数是: \${result}\`); // 输出: 55`;

const typescriptSample = `// TypeScript 示例代码
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

type AdminUser = User & {
  role: 'admin';
  permissions: string[];
};

function greetUser<T extends User>(user: T): string {
  return \`你好，\${user.name}！欢迎回来。\`;
}

const admin: AdminUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
};

console.log(greetUser(admin));`;

const reactSample = `import React, { useState, useEffect } from 'react';

// 函数组件示例
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [isEven, setIsEven] = useState<boolean>(true);
  
  useEffect(() => {
    setIsEven(count % 2 === 0);
    document.title = \`计数: \${count}\`;
  }, [count]);
  
  return (
    <div className="counter">
      <h2>当前计数: {count}</h2>
      <p>这个数字是: {isEven ? '偶数' : '奇数'}</p>
      
      <button onClick={() => setCount(prev => prev - 1)}>
        减少
      </button>
      
      <button onClick={() => setCount(prev => prev + 1)}>
        增加
      </button>
    </div>
  );
};

export default Counter;`;

const cssCode = `/* CSS 示例代码 */
.container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 暗色主题变量 */
:root {
  --bg-color: #f8f9fa;
  --text-color: #212529;
  --accent-color: #5183f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #121212;
    --text-color: #e9ecef;
    --accent-color: #90b3ff;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .column {
    flex: 0 0 100%;
  }
}`;

const pythonCode = `# Python 示例代码
def bubble_sort(arr):
    """
    冒泡排序实现
    时间复杂度: O(n²)
    空间复杂度: O(1)
    """
    n = len(arr)
    
    # 遍历所有数组元素
    for i in range(n):
        # 最后i个元素已经就位
        for j in range(0, n-i-1):
            # 从头到尾遍历数组
            # 如果元素大于下一个元素，则交换
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    
    return arr

# 测试排序算法
test_array = [64, 34, 25, 12, 22, 11, 90]
sorted_array = bubble_sort(test_array.copy())
print(f"排序后的数组: {sorted_array}")`;

const Code = () => {
  return (
    <PageContainer>
      <Section>
        <Title {...animationProps}>开发者字体展示</Title>
        <Paragraph {...animationProps}>
          这个页面展示了使用多种编程语言编写的代码示例，它们都使用了高质量的开发者字体系列。
          这些字体经过精心设计，特别适合代码阅读和编写，提供了更好的可读性和编程体验。
        </Paragraph>

        <Subtitle {...animationProps}>字体家族</Subtitle>
        <Paragraph {...animationProps}>我们使用了以下字体组合，它们会按优先级从高到低依次应用：</Paragraph>

        <FontInfo {...animationProps}>
          <FontName>OperatorMonoSSmLig Nerd Font</FontName>
          <FontName>Cascadia Code PL</FontName>
          <FontName>FantasqueSansMono Nerd Font</FontName>
          <FontName>operator mono</FontName>
          <FontName>JetBrainsMono</FontName>
          <FontName>Fira code Retina</FontName>
          <FontName>Fira code</FontName>
          <FontName>Consolas</FontName>
          <FontName>Monaco</FontName>
          <FontName>Hannotate SC</FontName>
        </FontInfo>

        <Subtitle {...animationProps}>JavaScript 示例</Subtitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeBlock code={javaScriptSample} language="javascript" showLineNumbers={true} />
        </motion.div>

        <Subtitle {...animationProps}>TypeScript 示例</Subtitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeBlock code={typescriptSample} language="typescript" showLineNumbers={true} />
        </motion.div>

        <Subtitle {...animationProps}>React 组件示例</Subtitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeBlock code={reactSample} language="tsx" showLineNumbers={true} />
        </motion.div>

        <Subtitle {...animationProps}>CSS 示例</Subtitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeBlock code={cssCode} language="css" showLineNumbers={true} />
        </motion.div>

        <Subtitle {...animationProps}>Python 示例</Subtitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeBlock code={pythonCode} language="python" showLineNumbers={true} />
        </motion.div>
      </Section>
    </PageContainer>
  );
};

export default Code;
