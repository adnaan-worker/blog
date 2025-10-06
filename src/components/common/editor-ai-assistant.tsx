import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { FiCpu, FiX, FiChevronDown, FiChevronUp, FiCheck, FiLoader } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { aiWritingHelper } from '@/utils/ai-writing-helper';

// 样式组件
const AssistantContainer = styled.div<{ isVisible: boolean }>`
  display: ${(props) => (props.isVisible ? 'flex' : 'none')};
  flex-direction: column;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;

  svg {
    color: var(--accent-color);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AssistantContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const ActionSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
`;

const ActionCard = styled.button<{ isProcessing?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: ${(props) => (props.isProcessing ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  opacity: ${(props) => (props.isProcessing ? 0.6 : 1)};

  &:hover:not(:disabled) {
    border-color: var(--accent-color);
    box-shadow: 0 2px 8px rgba(var(--accent-color-rgb, 99, 102, 241), 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ActionIcon = styled.div<{ isProcessing?: boolean }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 6px;
  color: var(--accent-color);

  svg {
    ${(props) =>
      props.isProcessing &&
      `
      animation: spin 1s linear infinite;
    `}
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionTitle = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const ActionDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const OptionGroup = styled.div`
  .option-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }
  }
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(var(--accent-color-rgb, 99, 102, 241), 0.1);
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--accent-color);

  svg {
    animation: spin 1s linear infinite;
  }
`;

// 接口定义
interface EditorAIAssistantProps {
  content: string;
  onContentUpdate: (content: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

// AI动作列表
const AI_ACTIONS = [
  {
    type: 'polish' as const,
    title: '文本润色',
    description: '优化语言表达，使文本更加流畅专业',
    icon: '✨',
  },
  {
    type: 'improve' as const,
    title: '内容改进',
    description: '提升文章质量，增强逻辑性和可读性',
    icon: '🎯',
  },
  {
    type: 'expand' as const,
    title: '内容扩展',
    description: '丰富文章内容，增加细节和实例',
    icon: '📝',
  },
  {
    type: 'summarize' as const,
    title: '内容总结',
    description: '提炼核心要点，生成简洁摘要',
    icon: '📋',
  },
  {
    type: 'generate_outline' as const,
    title: '生成大纲',
    description: '为主题生成详细的文章结构大纲',
    icon: '📚',
  },
];

// 处理AI返回内容，转换为TipTap编辑器兼容格式
const processAIContentForEditor = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '<p></p>';
  }

  let processedContent = content.trim();

  // 移除外层的 rich-text-content 包装（如果存在）
  processedContent = processedContent.replace(/<div[^>]*class="rich-text-content"[^>]*>([\s\S]*)<\/div>$/i, '$1');

  // 移除所有 rich-text-* 类名，但保留 language-* 类名
  processedContent = processedContent.replace(/class="rich-text-[^"]*"/gi, '');

  // 清理空的class属性，但保留有内容的class属性
  processedContent = processedContent.replace(/\s*class="\s*"\s*/gi, ' ');

  // 确保代码块格式正确，保留语言标识符
  processedContent = processedContent.replace(
    /<pre>\s*<code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, language, code) => {
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    },
  );

  // 处理没有语言标识符的代码块，尝试从内容推断语言
  processedContent = processedContent.replace(/<pre>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (match, code) => {
    // 尝试从代码内容推断语言
    const trimmedCode = code.trim();
    let language = 'text';

    // 简单的语言推断逻辑
    if (trimmedCode.includes('function') || trimmedCode.includes('const ') || trimmedCode.includes('let ')) {
      language = 'javascript';
    } else if (trimmedCode.includes('import ') || trimmedCode.includes('from ')) {
      language = 'python';
    } else if (trimmedCode.includes('SELECT ') || trimmedCode.includes('FROM ')) {
      language = 'sql';
    } else if (trimmedCode.includes('<') && trimmedCode.includes('>')) {
      language = 'html';
    } else if (trimmedCode.includes('{') && trimmedCode.includes('}')) {
      language = 'json';
    }

    return `<pre><code class="language-${language}">${code}</code></pre>`;
  });

  // 如果内容为空，返回空段落
  if (!processedContent.trim()) {
    return '<p></p>';
  }

  return processedContent;
};

const EditorAIAssistant: React.FC<EditorAIAssistantProps> = ({ content, onContentUpdate, isVisible, onToggle }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [options, setOptions] = useState({
    style: 'professional',
    length: 'medium',
  });

  // 执行AI动作
  const executeAction = useCallback(
    async (actionType: (typeof AI_ACTIONS)[number]['type']) => {
      if (!content && ['polish', 'improve', 'expand', 'summarize'].includes(actionType)) {
        adnaan.toast.error('请先输入内容');
        return;
      }

      setIsProcessing(true);
      setProcessingAction(actionType);

      try {
        let result: string;

        switch (actionType) {
          case 'generate_outline':
            result = await aiWritingHelper.generateOutline(content || '请为这个主题生成大纲', []);
            break;

          case 'polish':
          case 'improve':
          case 'expand':
          case 'summarize': {
            // 使用异步任务处理
            const taskPromise = await getAsyncTaskPromise(actionType, content, options);
            result = await new Promise<string>((resolve, reject) => {
              taskPromise.onComplete((taskResult: string) => {
                resolve(taskResult);
              });

              // 超时处理
              setTimeout(() => {
                reject(new Error('处理超时，请重试'));
              }, 60000); // 60秒超时
            });
            break;
          }

          default:
            throw new Error(`不支持的动作类型: ${actionType}`);
        }

        // 处理AI返回的内容，转换为编辑器兼容格式
        const editorContent = processAIContentForEditor(result);

        // 更新编辑器内容
        onContentUpdate(editorContent);
        adnaan.toast.success(`${AI_ACTIONS.find((a) => a.type === actionType)?.title || '操作'}完成`);
      } catch (error: any) {
        adnaan.toast.error(`操作失败: ${error.message}`);
        console.error('AI操作失败:', error);
      } finally {
        setIsProcessing(false);
        setProcessingAction(null);
      }
    },
    [content, options, onContentUpdate],
  );

  // 获取异步任务Promise
  const getAsyncTaskPromise = async (actionType: string, content: string, options: any) => {
    switch (actionType) {
      case 'polish':
        return await aiWritingHelper.polishText(content, options.style);
      case 'improve':
        return await aiWritingHelper.improveText(content, '提高可读性和逻辑性');
      case 'expand':
        return await aiWritingHelper.expandContent(content, options.length);
      case 'summarize':
        return await aiWritingHelper.summarizeContent(content, options.length);
      default:
        throw new Error(`不支持的异步任务类型: ${actionType}`);
    }
  };

  return (
    <AssistantContainer isVisible={isVisible}>
      <AssistantHeader>
        <HeaderTitle>
          <FiCpu size={16} />
          AI 写作助手
        </HeaderTitle>
        <HeaderActions>
          <Button variant="ghost" size="small" onClick={onToggle}>
            <FiX size={16} />
          </Button>
        </HeaderActions>
      </AssistantHeader>

      <AssistantContent>
        {/* 选项配置 */}
        <OptionsSection>
          <OptionGroup>
            <div className="option-label">写作风格</div>
            <select value={options.style} onChange={(e) => setOptions((prev) => ({ ...prev, style: e.target.value }))}>
              <option value="professional">专业正式</option>
              <option value="casual">轻松易读</option>
              <option value="academic">学术严谨</option>
              <option value="creative">创意生动</option>
            </select>
          </OptionGroup>

          <OptionGroup>
            <div className="option-label">内容长度</div>
            <select
              value={options.length}
              onChange={(e) => setOptions((prev) => ({ ...prev, length: e.target.value }))}
            >
              <option value="short">简短精炼</option>
              <option value="medium">适中详实</option>
              <option value="long">详细深入</option>
            </select>
          </OptionGroup>
        </OptionsSection>

        {/* AI动作列表 */}
        <ActionSection>
          <SectionTitle>智能操作</SectionTitle>
          <ActionGrid>
            {AI_ACTIONS.map((action) => (
              <ActionCard
                key={action.type}
                onClick={() => executeAction(action.type)}
                disabled={isProcessing}
                isProcessing={isProcessing && processingAction === action.type}
              >
                <ActionIcon isProcessing={isProcessing && processingAction === action.type}>
                  {isProcessing && processingAction === action.type ? (
                    <FiLoader size={16} />
                  ) : (
                    <span>{action.icon}</span>
                  )}
                </ActionIcon>
                <ActionContent>
                  <ActionTitle>{action.title}</ActionTitle>
                  <ActionDescription>{action.description}</ActionDescription>
                </ActionContent>
              </ActionCard>
            ))}
          </ActionGrid>
        </ActionSection>

        {/* 处理中指示器 */}
        {isProcessing && (
          <ProcessingIndicator>
            <FiLoader size={16} />
            <span>AI正在处理中，请稍候...</span>
          </ProcessingIndicator>
        )}
      </AssistantContent>
    </AssistantContainer>
  );
};

export default EditorAIAssistant;
