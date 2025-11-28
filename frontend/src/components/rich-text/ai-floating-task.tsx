import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, useDragControls } from 'framer-motion';
import { FiX, FiChevronDown, FiChevronUp, FiCheck, FiLoader, FiAlertCircle, FiEye } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { AITask } from '@/hooks/useAITasks';

// 悬浮任务条容器（紧凑模式）
const FloatingContainer = styled(motion.div)<{ isExpanded: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: ${(props) => (props.isExpanded ? '420px' : '320px')};
  max-width: calc(100vw - 48px);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
    bottom: 16px;
    width: auto;
    max-width: none;
  }

  @media (max-width: 480px) {
    left: 12px;
    right: 12px;
    bottom: 12px;
  }
`;

// 拖动手柄
const DragHandle = styled.div`
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);

  &:active {
    cursor: grabbing;
  }
`;

// 标题
const Title = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 操作按钮
const IconButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

// 任务项（紧凑模式）
const CompactTask = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
  }
`;

// 任务头部
const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

// 任务标题
const TaskTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 状态标签
const StatusBadge = styled.span<{ status: string }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return 'rgba(16, 185, 129, 0.1)';
      case 'failed':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(99, 102, 241, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#6366f1';
    }
  }};
`;

// 进度条
const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled(motion.div)<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
`;

// 结果预览（紧凑）
const ResultPreview = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

// 展开内容
const ExpandedContent = styled(motion.div)`
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
`;

// 结果选项
const ResultOption = styled(motion.button)`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-word;

  &:hover {
    border-color: var(--accent-color);
    background: var(--bg-tertiary);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    min-height: 44px;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }
`;

// 操作按钮组
const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

interface AIFloatingTaskProps {
  tasks: AITask[];
  onApply: (taskId: string, result: any) => void;
  onClose: (taskId: string) => void;
  onCloseAll: () => void;
}

export const AIFloatingTask: React.FC<AIFloatingTaskProps> = ({ tasks, onApply, onClose, onCloseAll }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // 获取任务标题
  const getTaskTitle = (type: string): string => {
    return type === 'generate_title' ? '生成标题' : '生成摘要';
  };

  // 获取状态文本
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'processing':
        return '生成中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '等待中';
    }
  };

  // 处理应用单个选项
  const handleApplyOption = (taskId: string, option: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.type === 'generate_title') {
      onApply(taskId, { titles: [option] });
    } else {
      onApply(taskId, { summary: option });
    }
    setExpandedTaskId(null);
  };

  if (tasks.length === 0) return null;

  return (
    <FloatingContainer
      ref={constraintsRef}
      isExpanded={expandedTaskId !== null}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        top: -window.innerHeight + 200,
        left: -window.innerWidth + 200,
        right: 0,
        bottom: 0,
      }}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* 拖动手柄 */}
      <DragHandle onPointerDown={(e) => dragControls.start(e)}>
        <Title>
          <FiLoader
            style={{
              animation: tasks.some((t) => t.status === 'processing') ? 'spin 1s linear infinite' : 'none',
            }}
          />
          AI 任务 ({tasks.length})
        </Title>
        <IconButton onClick={onCloseAll} title="关闭全部">
          <FiX />
        </IconButton>
      </DragHandle>

      {/* 任务列表 */}
      {tasks.map((task) => (
        <CompactTask key={task.id}>
          <TaskHeader>
            <TaskTitle>
              {task.status === 'completed' && <FiCheck style={{ color: '#10b981' }} />}
              {task.status === 'processing' && <FiLoader style={{ animation: 'spin 1s linear infinite' }} />}
              {task.status === 'failed' && <FiAlertCircle style={{ color: '#ef4444' }} />}
              {getTaskTitle(task.type)}
            </TaskTitle>
            <StatusBadge status={task.status}>{getStatusText(task.status)}</StatusBadge>
          </TaskHeader>

          {/* 进度条 */}
          {task.status === 'processing' && (
            <>
              <ProgressBar>
                <ProgressFill
                  progress={task.progress}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </ProgressBar>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{task.progress}% 完成</div>
            </>
          )}

          {/* 完成状态 */}
          {task.status === 'completed' && task.result && (
            <>
              {expandedTaskId !== task.id ? (
                <>
                  {/* 紧凑预览 */}
                  <ResultPreview>
                    {task.type === 'generate_title' && task.result.titles?.[0]}
                    {task.type === 'generate_summary' && task.result.summary}
                  </ResultPreview>
                  <ActionButtons>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setExpandedTaskId(task.id)}
                      leftIcon={<FiEye />}
                    >
                      查看结果
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => onClose(task.id)}>
                      关闭
                    </Button>
                  </ActionButtons>
                </>
              ) : (
                <>
                  {/* 展开显示所有选项 */}
                  <ExpandedContent
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {task.type === 'generate_title' &&
                      task.result.titles?.map((title: string, index: number) => (
                        <ResultOption
                          key={index}
                          onClick={() => handleApplyOption(task.id, title)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {title}
                        </ResultOption>
                      ))}
                    {task.type === 'generate_summary' && (
                      <ResultOption
                        onClick={() => handleApplyOption(task.id, task.result.summary)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {task.result.summary}
                      </ResultOption>
                    )}
                  </ExpandedContent>
                  <ActionButtons>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setExpandedTaskId(null)}
                      leftIcon={<FiChevronUp />}
                    >
                      收起
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => onClose(task.id)}>
                      关闭
                    </Button>
                  </ActionButtons>
                </>
              )}
            </>
          )}

          {/* 失败状态 */}
          {task.status === 'failed' && (
            <>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem' }}>
                {task.error || '生成失败'}
              </div>
              <ActionButtons>
                <Button variant="ghost" size="small" onClick={() => onClose(task.id)}>
                  关闭
                </Button>
              </ActionButtons>
            </>
          )}
        </CompactTask>
      ))}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </FloatingContainer>
  );
};

export default AIFloatingTask;
