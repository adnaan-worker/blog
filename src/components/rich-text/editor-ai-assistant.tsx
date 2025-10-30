import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCpu, FiX, FiChevronDown, FiChevronUp, FiCheck, FiLoader } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { aiWritingHelper } from '@/utils/ai-writing-helper';
import { processAIContentForEditor } from '@/utils/editor-helpers';

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
    box-shadow: 0 2px 8px rgba(var(--accent-rgb, 99, 102, 241), 0.1);
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

// AI思考指示器 - 增强版
const ThinkingIndicator = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 99, 102, 241), 0.08) 0%,
    rgba(var(--accent-rgb, 99, 102, 241), 0.02) 100%
  );
  border-radius: 12px;
  margin-top: 1rem;
  border: 1px solid rgba(var(--accent-rgb, 99, 102, 241), 0.2);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 99, 102, 241), 0.08);
`;

const ThinkingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-color);

  svg {
    animation: spin 1s linear infinite;
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

const ThinkingDots = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: center;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-color);
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) {
      animation-delay: -0.32s;
    }

    &:nth-of-type(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ThinkingStatus = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.1);
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

// AI动作列表 - 增强版
const AI_ACTIONS = [
  {
    type: 'polish' as const,
    title: '文本润色',
    description: '优化语言表达，使文本更加流畅专业',
    icon: '✨',
    category: 'enhance',
    requiresContent: true,
  },
  {
    type: 'improve' as const,
    title: '内容改进',
    description: '提升文章质量，增强逻辑性和可读性',
    icon: '🎯',
    category: 'enhance',
    requiresContent: true,
  },
  {
    type: 'expand' as const,
    title: '内容扩展',
    description: '丰富文章内容，增加细节和实例',
    icon: '📝',
    category: 'enhance',
    requiresContent: true,
  },
  {
    type: 'continue' as const,
    title: '智能续写',
    description: '基于现有内容，AI智能续写后续内容',
    icon: '✍️',
    category: 'generate',
    requiresContent: true,
  },
  {
    type: 'rewrite' as const,
    title: '改写风格',
    description: '用不同风格重写内容，保持核心观点',
    icon: '🎨',
    category: 'enhance',
    requiresContent: true,
  },
  {
    type: 'summarize' as const,
    title: '内容总结',
    description: '提炼核心要点，生成简洁摘要',
    icon: '📋',
    category: 'enhance',
    requiresContent: true,
  },
  {
    type: 'translate' as const,
    title: '智能翻译',
    description: '将内容翻译成其他语言',
    icon: '🌐',
    category: 'transform',
    requiresContent: true,
  },
  {
    type: 'generate_outline' as const,
    title: '生成大纲',
    description: '为主题生成详细的文章结构大纲',
    icon: '📚',
    category: 'generate',
    requiresContent: false,
  },
];

const EditorAIAssistant: React.FC<EditorAIAssistantProps> = ({ content, onContentUpdate, isVisible, onToggle }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [thinkingStatus, setThinkingStatus] = useState<string>('');
  const [options, setOptions] = useState({
    style: 'professional',
    length: 'medium',
    targetLang: '英文',
  });

  // 执行AI动作
  const executeAction = useCallback(
    async (actionType: (typeof AI_ACTIONS)[number]['type']) => {
      const action = AI_ACTIONS.find((a) => a.type === actionType);

      // 检查是否需要内容
      if (!content && action?.requiresContent) {
        adnaan.toast.error('请先输入内容');
        return;
      }

      setIsProcessing(true);
      setProcessingAction(actionType);
      setThinkingStatus('🤔 AI正在思考...');

      try {
        let result: string;

        switch (actionType) {
          case 'generate_outline':
            setThinkingStatus('📝 正在生成大纲...');
            result = await aiWritingHelper.generateOutline(content || '请为这个主题生成大纲', []);
            break;

          case 'polish':
          case 'improve':
          case 'expand':
          case 'summarize':
          case 'continue':
          case 'rewrite':
          case 'translate': {
            // 更新思考状态
            const statusMap: Record<string, string> = {
              polish: '✨ 正在润色文本...',
              improve: '🎯 正在改进内容...',
              expand: '📝 正在扩展内容...',
              summarize: '📋 正在生成摘要...',
              continue: '✍️ 正在智能续写...',
              rewrite: '🎨 正在改写风格...',
              translate: '🌐 正在翻译内容...',
            };
            setThinkingStatus(statusMap[actionType] || '🤖 AI正在处理...');

            // 使用异步任务处理
            const taskPromise = await getAsyncTaskPromise(actionType, content, options);

            // 模拟进度状态变化
            const progressInterval = setInterval(() => {
              const statuses = [
                '🔍 分析内容结构...',
                '🧠 理解语义...',
                '✍️ 生成内容...',
                '🎨 优化格式...',
                '✅ 即将完成...',
              ];
              setThinkingStatus((prev) => {
                const currentIndex = statuses.findIndex((s) => s === prev);
                return statuses[(currentIndex + 1) % statuses.length];
              });
            }, 3000);

            result = await new Promise<string>((resolve, reject) => {
              taskPromise.onComplete((taskResult: string) => {
                clearInterval(progressInterval);
                resolve(taskResult);
              });

              // 超时处理
              setTimeout(() => {
                clearInterval(progressInterval);
                reject(new Error('处理超时，请重试'));
              }, 90000); // 90秒超时
            });
            break;
          }

          default:
            throw new Error(`不支持的动作类型: ${actionType}`);
        }

        // 处理AI返回的内容，转换为编辑器兼容格式
        const editorContent = processAIContentForEditor(result);

        // 根据操作类型决定如何更新内容
        if (actionType === 'continue') {
          // 续写：追加到现有内容后面
          onContentUpdate(content + '\n' + editorContent);
        } else {
          // 其他操作：替换现有内容
          onContentUpdate(editorContent);
        }

        adnaan.toast.success(`${action?.title || '操作'}完成`);
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
      case 'continue':
        return await aiWritingHelper.continueContent(content, options.length);
      case 'rewrite':
        return await aiWritingHelper.rewriteStyle(content, options.style);
      case 'translate':
        return await aiWritingHelper.translateContent(content, options.targetLang || '英文');
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
              <option value="storytelling">故事叙述</option>
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

          <OptionGroup>
            <div className="option-label">翻译语言</div>
            <select
              value={options.targetLang}
              onChange={(e) => setOptions((prev) => ({ ...prev, targetLang: e.target.value }))}
            >
              <option value="英文">英文</option>
              <option value="日文">日文</option>
              <option value="韩文">韩文</option>
              <option value="法文">法文</option>
              <option value="德文">德文</option>
              <option value="西班牙文">西班牙文</option>
            </select>
          </OptionGroup>
        </OptionsSection>

        {/* AI动作列表 - 按类别分组 */}
        <ActionSection>
          <SectionTitle>🎨 内容优化</SectionTitle>
          <ActionGrid>
            {AI_ACTIONS.filter((a) => a.category === 'enhance').map((action) => (
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

        <ActionSection>
          <SectionTitle>✍️ 内容生成</SectionTitle>
          <ActionGrid>
            {AI_ACTIONS.filter((a) => a.category === 'generate').map((action) => (
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

        <ActionSection>
          <SectionTitle>🌐 内容转换</SectionTitle>
          <ActionGrid>
            {AI_ACTIONS.filter((a) => a.category === 'transform').map((action) => (
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

        {/* AI思考指示器 - 增强版 */}
        {isProcessing && (
          <ThinkingIndicator
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ThinkingHeader>
              <FiCpu size={18} />
              <span>AI 助手正在工作</span>
            </ThinkingHeader>
            <ThinkingStatus>
              {thinkingStatus}
              <ThinkingDots>
                <span></span>
                <span></span>
                <span></span>
              </ThinkingDots>
            </ThinkingStatus>
          </ThinkingIndicator>
        )}
      </AssistantContent>
    </AssistantContainer>
  );
};

export default EditorAIAssistant;
