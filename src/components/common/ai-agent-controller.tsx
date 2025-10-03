import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { FiCpu, FiPlay, FiPause, FiSquare, FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Button } from '@/components/ui';
import AITaskMonitor from './ai-task-monitor';
import { aiWritingHelper } from '@/utils/ai-writing-helper';
import { API } from '@/utils/api';

// 样式组件
const ControllerContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin: 1rem 0;
  overflow: hidden;
`;

const ControllerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--bg-hover);
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const StatusIndicator = styled.div<{ status: 'idle' | 'processing' | 'completed' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.status) {
      case 'processing':
        return 'var(--accent-color)';
      case 'completed':
        return '#10b981';
      default:
        return 'var(--border-color)';
    }
  }};
  animation: ${(props) => (props.status === 'processing' ? 'pulse 2s infinite' : 'none')};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const ControllerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControllerContent = styled.div<{ isCollapsed: boolean }>`
  max-height: ${(props) => (props.isCollapsed ? '0' : '600px')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ActionPanel = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ActionCard = styled.div`
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 2px 8px rgba(var(--accent-color-rgb), 0.1);
  }

  .action-title {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .action-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

const OptionsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const OptionGroup = styled.div`
  .option-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }
  }
`;

// 接口定义
interface AITask {
  id: string;
  type: 'polish' | 'improve' | 'expand' | 'summarize' | 'translate' | 'generate_outline' | 'generate_title';
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  result?: string;
  error?: string;
}

interface AIAgentControllerProps {
  content: string;
  onContentUpdate: (content: string) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'completed') => void;
}

// 预定义的AI动作
const AI_ACTIONS = [
  {
    type: 'polish' as const,
    title: '文本润色',
    description: '优化语言表达，使文本更加流畅专业',
  },
  {
    type: 'improve' as const,
    title: '内容改进',
    description: '提升文章质量，增强逻辑性和可读性',
  },
  {
    type: 'expand' as const,
    title: '内容扩展',
    description: '丰富文章内容，增加细节和实例',
  },
  {
    type: 'summarize' as const,
    title: '内容总结',
    description: '提炼核心要点，生成简洁摘要',
  },
  {
    type: 'generate_outline' as const,
    title: '生成大纲',
    description: '为主题生成详细的文章结构大纲',
  },
];

const AIAgentController: React.FC<AIAgentControllerProps> = ({ content, onContentUpdate, onStatusChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState({
    style: 'professional',
    length: 'medium',
    tone: 'friendly',
  });

  // 计算当前状态
  const currentStatus = isProcessing
    ? 'processing'
    : tasks.some((t) => t.status === 'completed')
      ? 'completed'
      : 'idle';

  // 通知状态变化
  useEffect(() => {
    onStatusChange?.(currentStatus);
  }, [currentStatus, onStatusChange]);

  // 生成任务ID
  const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 执行AI动作
  const executeAction = useCallback(
    async (actionType: AITask['type']) => {
      if (!content && ['polish', 'improve', 'expand', 'summarize'].includes(actionType)) {
        window.UI.toast.error('请先输入内容');
        return;
      }

      const taskId = generateTaskId();
      const task: AITask = {
        id: taskId,
        type: actionType,
        title: AI_ACTIONS.find((a) => a.type === actionType)?.title || actionType,
        description: AI_ACTIONS.find((a) => a.type === actionType)?.description || '',
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
      };

      // 添加任务到列表
      setTasks((prev) => [...prev, task]);
      setIsProcessing(true);

      try {
        // 更新任务状态为处理中
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'processing' as const, progress: 10 } : t)),
        );

        let result: string;

        // 根据动作类型执行对应操作
        switch (actionType) {
          case 'generate_outline':
            result = await aiWritingHelper.generateOutline(content, []);
            break;
          case 'polish':
          case 'improve':
          case 'expand':
          case 'summarize':
            // 这些使用异步任务处理
            const taskPromise = await getAsyncTaskPromise(actionType, content, options);
            result = await new Promise<string>((resolve, reject) => {
              taskPromise.onComplete((taskResult: string) => {
                resolve(taskResult);
              });

              // 模拟进度更新
              const progressInterval = setInterval(() => {
                setTasks((prev) =>
                  prev.map((t) => {
                    if (t.id === taskId && t.status === 'processing') {
                      const newProgress = Math.min(t.progress + 10, 90);
                      return { ...t, progress: newProgress };
                    }
                    return t;
                  }),
                );
              }, 500);

              setTimeout(() => clearInterval(progressInterval), 5000);
            });
            break;
          default:
            throw new Error(`不支持的动作类型: ${actionType}`);
        }

        // 任务完成
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed' as const,
                  progress: 100,
                  result,
                  endTime: Date.now(),
                }
              : t,
          ),
        );

        // 更新内容
        onContentUpdate(result);
        window.UI.toast.success(`${task.title}完成`);
      } catch (error: any) {
        // 任务失败
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'failed' as const,
                  error: error.message,
                  endTime: Date.now(),
                }
              : t,
          ),
        );

        window.UI.toast.error(`${task.title}失败: ${error.message}`);
      } finally {
        setIsProcessing(false);
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
        return await aiWritingHelper.expandText(content, options.length);
      case 'summarize':
        return await aiWritingHelper.summarizeText(content, options.length);
      default:
        throw new Error(`不支持的异步任务类型: ${actionType}`);
    }
  };

  // 清除所有任务
  const clearTasks = () => {
    setTasks([]);
  };

  // 任务完成回调
  const handleTaskComplete = useCallback(
    (taskId: string, result: string) => {
      onContentUpdate(result);
    },
    [onContentUpdate],
  );

  return (
    <ControllerContainer>
      <ControllerHeader onClick={() => setIsCollapsed(!isCollapsed)}>
        <HeaderTitle>
          <FiCpu />
          AI 智能代理
          <StatusIndicator status={currentStatus} />
        </HeaderTitle>

        <ControllerActions>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                clearTasks();
              }}
            >
              清除
            </Button>
          )}
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </ControllerActions>
      </ControllerHeader>

      <ControllerContent isCollapsed={isCollapsed}>
        <ActionPanel>
          <OptionsPanel>
            <OptionGroup>
              <div className="option-label">处理风格</div>
              <select
                value={options.style}
                onChange={(e) => setOptions((prev) => ({ ...prev, style: e.target.value }))}
              >
                <option value="professional">专业</option>
                <option value="casual">轻松</option>
                <option value="academic">学术</option>
                <option value="creative">创意</option>
              </select>
            </OptionGroup>

            <OptionGroup>
              <div className="option-label">内容长度</div>
              <select
                value={options.length}
                onChange={(e) => setOptions((prev) => ({ ...prev, length: e.target.value }))}
              >
                <option value="short">简短</option>
                <option value="medium">中等</option>
                <option value="long">详细</option>
              </select>
            </OptionGroup>
          </OptionsPanel>

          <ActionGrid>
            {AI_ACTIONS.map((action) => (
              <ActionCard key={action.type} onClick={() => executeAction(action.type)}>
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </ActionCard>
            ))}
          </ActionGrid>
        </ActionPanel>

        <AITaskMonitor tasks={tasks} isVisible={tasks.length > 0} onTaskComplete={handleTaskComplete} />
      </ControllerContent>
    </ControllerContainer>
  );
};

export default AIAgentController;
