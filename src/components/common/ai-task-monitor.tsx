import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { FiCpu, FiCheck, FiX, FiLoader, FiClock, FiZap, FiEdit3, FiStar, FiType, FiBookOpen } from 'react-icons/fi';

// 动画定义
const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 样式组件
const MonitorContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
`;

const MonitorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProcessList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ProcessItem = styled.div<{ status: 'pending' | 'processing' | 'completed' | 'failed' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border-left: 4px solid
    ${(props) => {
      switch (props.status) {
        case 'processing':
          return 'var(--accent-color)';
        case 'completed':
          return '#10b981';
        case 'failed':
          return '#ef4444';
        default:
          return 'var(--border-color)';
      }
    }};
  animation: ${(props) => (props.status === 'processing' ? pulse : slideIn)}
    ${(props) => (props.status === 'processing' ? '2s infinite' : '0.3s ease-out')};
`;

const ProcessIcon = styled.div<{ status: 'pending' | 'processing' | 'completed' | 'failed' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.status) {
      case 'processing':
        return 'var(--accent-color)';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return 'var(--bg-secondary)';
    }
  }};
  color: white;

  svg {
    animation: ${(props) => (props.status === 'processing' ? 'spin 1s linear infinite' : 'none')};
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

const ProcessContent = styled.div`
  flex: 1;
`;

const ProcessTitle = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ProcessDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const ProcessProgress = styled.div`
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div`
  background: var(--bg-secondary);
  border-radius: 4px;
  height: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: var(--accent-color);
  height: 100%;
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const ProcessTime = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
`;

const ResultPreview = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
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

interface AITaskMonitorProps {
  tasks?: AITask[]; // 改为可选属性
  isVisible: boolean;
  onTaskComplete?: (taskId: string, result: string) => void;
  onTaskFailed?: (taskId: string, error: string) => void;
}

// 任务图标映射
const getTaskIcon = (type: AITask['type'], status: AITask['status']) => {
  const iconMap = {
    polish: FiEdit3,
    improve: FiEdit3,
    expand: FiBookOpen,
    summarize: FiType,
    translate: FiZap,
    generate_outline: FiBookOpen,
    generate_title: FiType,
  };

  if (status === 'processing') return FiLoader;
  if (status === 'completed') return FiCheck;
  if (status === 'failed') return FiX;

  return iconMap[type] || FiCpu;
};

// 任务标题映射
const getTaskTitle = (type: AITask['type']) => {
  const titleMap = {
    polish: '文本润色',
    improve: '内容改进',
    expand: '内容扩展',
    summarize: '内容总结',
    translate: '内容翻译',
    generate_outline: '生成大纲',
    generate_title: '生成标题',
  };

  return titleMap[type] || '未知任务';
};

// 格式化时间
const formatDuration = (startTime?: number, endTime?: number) => {
  if (!startTime) return '';
  const duration = (endTime || Date.now()) - startTime;
  return `${Math.round(duration / 1000)}s`;
};

const AITaskMonitor: React.FC<AITaskMonitorProps> = ({
  tasks = [], // 提供默认值
  isVisible,
  onTaskComplete,
  onTaskFailed,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 使用 useMemo 来避免不必要的重新渲染
  const safeTasks = useMemo(() => {
    return Array.isArray(tasks) ? tasks : [];
  }, [tasks]);

  // 使用 tasks 的长度和最后一个任务的状态作为依赖，而不是整个 tasks 数组
  const tasksSignature = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return 'empty';
    }
    return `${tasks.length}-${tasks.map((t) => `${t.id}-${t.status}-${t.progress}`).join(',')}`;
  }, [tasks]);

  // 自动滚动到最新任务
  useEffect(() => {
    if (scrollRef.current && safeTasks.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tasksSignature]);

  // 监听任务完成状态 - 使用 useCallback 优化
  const handleTaskStatusChange = useCallback(() => {
    if (!Array.isArray(tasks)) return;

    tasks.forEach((task) => {
      if (task.status === 'completed' && task.result && onTaskComplete) {
        onTaskComplete(task.id, task.result);
      }
      if (task.status === 'failed' && task.error && onTaskFailed) {
        onTaskFailed(task.id, task.error);
      }
    });
  }, [tasks, onTaskComplete, onTaskFailed]);

  // 只在任务状态真正变化时触发
  useEffect(() => {
    handleTaskStatusChange();
  }, [tasksSignature, handleTaskStatusChange]);

  // 添加更严格的检查
  if (!isVisible || safeTasks.length === 0) {
    return null;
  }

  return (
    <MonitorContainer ref={scrollRef}>
      <MonitorHeader>
        <FiCpu />
        AI 代理处理中心
        {safeTasks.some((t) => t.status === 'processing') && (
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--accent-color)' }}>正在处理...</div>
        )}
      </MonitorHeader>

      <ProcessList>
        {safeTasks.map((task) => {
          const IconComponent = getTaskIcon(task.type, task.status);

          return (
            <ProcessItem key={task.id} status={task.status}>
              <ProcessIcon status={task.status}>
                <IconComponent size={16} />
              </ProcessIcon>

              <ProcessContent>
                <ProcessTitle>{getTaskTitle(task.type)}</ProcessTitle>
                <ProcessDescription>{task.description}</ProcessDescription>

                {task.status === 'processing' && (
                  <ProcessProgress>
                    <ProgressBar>
                      <ProgressFill progress={task.progress} />
                    </ProgressBar>
                  </ProcessProgress>
                )}

                {(task.startTime || task.endTime) && (
                  <ProcessTime>
                    <FiClock size={12} style={{ marginRight: '0.25rem' }} />
                    {formatDuration(task.startTime, task.endTime)}
                  </ProcessTime>
                )}

                {task.status === 'completed' && task.result && (
                  <ResultPreview>预览: {task.result.substring(0, 100)}...</ResultPreview>
                )}

                {task.status === 'failed' && task.error && (
                  <ResultPreview style={{ color: '#ef4444' }}>错误: {task.error}</ResultPreview>
                )}
              </ProcessContent>
            </ProcessItem>
          );
        })}
      </ProcessList>
    </MonitorContainer>
  );
};

export default AITaskMonitor;
