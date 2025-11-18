import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiZap,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiEdit3,
  FiMaximize2,
  FiMessageSquare,
  FiLoader,
  FiCpu,
  FiFeather,
  FiFileText,
  FiGlobe,
} from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { useAI } from '@/hooks/useSocket';
import { Editor } from '@tiptap/react';
import { AIWritingDialog } from './ai-writing-dialog';
import { AITypingIndicator } from './ai-typing-indicator';
import { RichTextParser } from '@/utils/editor/parser';

// 浮动AI工具栏 - 更紧凑优雅
const FloatingToolbar = styled(motion.div)<{ position: { top: number; left: number } }>`
  position: fixed;
  top: ${(props) => props.position.top}px;
  left: ${(props) => props.position.left}px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--border-color);
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    left: 50% !important;
    transform: translateX(-50%);
    max-width: calc(100vw - 2rem);
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ToolbarButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: var(--bg-secondary);
    color: var(--accent-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    min-height: 44px; /* 触摸友好 */

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// 内联预览卡片 - 紧贴选中文本下方
const InlinePreviewCard = styled(motion.div)<{ position: { top: number; left: number } }>`
  position: fixed;
  top: ${(props) => props.position.top}px;
  left: ${(props) => props.position.left}px;
  width: 600px;
  max-width: 90vw;
  max-height: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 999;
  display: flex;
  flex-direction: column;

  /* 移动端优化 */
  @media (max-width: 768px) {
    position: fixed;
    top: auto !important;
    left: 1rem !important;
    right: 1rem;
    bottom: 1rem;
    width: auto;
    max-width: none;
    max-height: 70vh;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
`;

const PreviewTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);

  svg {
    width: 16px;
    height: 16px;
    color: var(--accent-color);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
`;

const DiffView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DiffBlock = styled.div<{ type: 'original' | 'new' }>`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid
    ${(props) => (props.type === 'original' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--accent-rgb, 99, 102, 241), 0.2)')};
  background: ${(props) =>
    props.type === 'original' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(var(--accent-rgb, 99, 102, 241), 0.05)'};
  position: relative;

  &::before {
    content: '${(props) => (props.type === 'original' ? '原文' : 'AI 生成')}';
    position: absolute;
    top: -8px;
    left: 8px;
    padding: 0 0.5rem;
    background: var(--bg-primary);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${(props) => (props.type === 'original' ? '#ef4444' : 'var(--accent-color)')};
  }

  .content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-primary);

    ${(props) =>
      props.type === 'original' &&
      `
      text-decoration: line-through;
      opacity: 0.7;
    `}

    /* HTML样式 */
    p {
      margin: 0.5rem 0;
      &:first-of-type {
        margin-top: 0;
      }
      &:last-of-type {
        margin-bottom: 0;
      }
    }
    ul,
    ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    strong {
      font-weight: 600;
    }
    em {
      font-style: italic;
    }
    code {
      background: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.25rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85em;
    }
  }
`;

const StreamingIndicator = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;

  span {
    width: 4px;
    height: 4px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;

    &:nth-of-type(2) {
      animation-delay: 0.2s;
    }
    &:nth-of-type(3) {
      animation-delay: 0.4s;
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

const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
`;

const ActionButton = styled(Button)`
  font-size: 0.8125rem;
  padding: 0.5rem 1rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const KeyboardHint = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: auto;
  font-size: 0.75rem;
  color: var(--text-secondary);

  kbd {
    padding: 0.125rem 0.375rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.6875rem;
  }
`;

// 空内容提示 - 类似placeholder的样式
const EmptyStateTrigger = styled.div`
  position: absolute;
  top: 6rem;
  left: 3rem;
  text-align: left;
  color: var(--text-tertiary);
  font-size: 0.9375rem;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  padding: 0;

  a {
    color: var(--accent-color);
    text-decoration: none;
    pointer-events: all;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-block;
    margin-left: 0.5rem;
    font-weight: 500;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }

  @media (max-width: 768px) {
    top: 4rem;
    left: 1.5rem;
    right: 1.5rem;
    font-size: 0.875rem;

    a {
      display: block;
      margin-left: 0;
      margin-top: 0.75rem;
      padding: 0.625rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      text-align: center;
    }
  }
`;

// AI操作配置
const AI_ACTIONS = [
  { id: 'polish', label: '润色', icon: <FiEdit3 />, hotkey: '⌘1', color: '#6366f1' },
  { id: 'improve', label: '改进', icon: <FiZap />, hotkey: '⌘2', color: '#8b5cf6' },
  { id: 'expand', label: '扩写', icon: <FiMaximize2 />, hotkey: '⌘3', color: '#ec4899' },
  { id: 'summarize', label: '总结', icon: <FiFileText />, hotkey: '⌘4', color: '#f59e0b' },
  {
    id: 'translate',
    label: '翻译',
    icon: <FiGlobe />,
    hotkey: '⌘5',
    color: '#10b981',
    submenu: ['英文', '日文', '韩文', '法文', '德文', '西班牙文'],
  },
];

interface AIAssistantProps {
  editor: Editor | null;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ editor, editorRef }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showWritingDialog, setShowWritingDialog] = useState(false);
  const [showEmptyTrigger, setShowEmptyTrigger] = useState(false);
  const [isGeneratingFromEmpty, setIsGeneratingFromEmpty] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedHTML, setSelectedHTML] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null);
  const [currentAction, setCurrentAction] = useState('');

  const ai = useAI();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const taskIdRef = useRef<string | null>(null);

  // 监听 AI 事件
  useEffect(() => {
    const unsubChunk = ai.onChunk((data) => {
      if (data.taskId === taskIdRef.current) {
        setStreamContent((prev) => prev + data.chunk);
      }
    });

    const unsubDone = ai.onDone((data) => {
      if (data.taskId === taskIdRef.current) {
        setIsStreaming(false);
      }
    });

    const unsubError = ai.onError((data) => {
      if (data.taskId === taskIdRef.current) {
        setIsStreaming(false);
        adnaan.toast.error(data.error);
      }
    });

    return () => {
      unsubChunk();
      unsubDone();
      unsubError();
    };
  }, [ai]);

  // 辅助函数
  const reset = useCallback(() => {
    setStreamContent('');
    setIsStreaming(false);
    taskIdRef.current = null;
  }, []);

  const startStream = useCallback(
    (action: string, text: string, options?: any) => {
      const taskId = `task_${Date.now()}`;
      taskIdRef.current = taskId;
      setIsStreaming(true);
      setStreamContent('');

      switch (action) {
        case 'polish':
          ai.polish(text, taskId, options?.style);
          break;
        case 'improve':
          ai.improve(text, taskId, options?.improvements);
          break;
        case 'expand':
          ai.expand(text, taskId, options?.length);
          break;
        case 'summarize':
          ai.summarize(text, taskId, options?.length);
          break;
        case 'translate':
          ai.translate(text, taskId, options?.targetLang);
          break;
      }
    },
    [ai],
  );

  const cancelTask = useCallback(() => {
    if (taskIdRef.current) {
      ai.cancel(taskIdRef.current);
      reset();
    }
  }, [ai, reset]);

  const isConnected = ai.isConnected;
  // 简化的辅助函数，自动生成 taskId
  const streamPolish = (text: string, style?: string) => startStream('polish', text, { style });
  const streamImprove = (text: string, improvements?: string) => startStream('improve', text, { improvements });
  const streamExpand = (text: string, length?: string) => startStream('expand', text, { length });
  const streamSummarize = (text: string, length?: string) => startStream('summarize', text, { length });
  const streamTranslate = (text: string, targetLang: string) => startStream('translate', text, { targetLang });
  const streamChat = (message: string) => {
    // Chat 功能暂不支持
    adnaan.toast.info('聊天功能开发中');
  };

  // 检测编辑器是否为空
  useEffect(() => {
    if (!editor) return;

    const checkEmpty = () => {
      // 获取纯文本内容
      const text = editor.getText().trim();
      // 获取 HTML 内容
      const html = editor.getHTML();

      // 更严格的判断：检查是否只有空段落或完全为空
      const isEmptyHTML = html === '<p></p>' || html === '' || html === '<p><br></p>';
      const isEmptyText = text.length === 0 || text === '';
      const isEmpty = isEmptyHTML && isEmptyText;

      // 只有真正为空时才显示，且不在其他状态中
      setShowEmptyTrigger(isEmpty && !showToolbar && !showPreview && !showWritingDialog);
    };

    // 初始检查
    checkEmpty();

    // 监听编辑器更新
    editor.on('update', checkEmpty);

    // 监听编辑器内容变化（包括 setContent）
    editor.on('transaction', checkEmpty);

    return () => {
      editor.off('update', checkEmpty);
      editor.off('transaction', checkEmpty);
    };
  }, [editor, showToolbar, showPreview, showWritingDialog]);

  // 监听文本选择
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // 检查选区是否在编辑器内
      const anchorNode = selection?.anchorNode;
      const focusNode = selection?.focusNode;
      const isInEditor =
        editorRef.current &&
        anchorNode &&
        focusNode &&
        editorRef.current.contains(anchorNode) &&
        editorRef.current.contains(focusNode);

      if (text && text.length > 0 && isInEditor) {
        setSelectedText(text);
        setShowEmptyTrigger(false);

        // 获取选中的HTML
        if (editor) {
          const { from, to } = editor.state.selection;
          const selectedHTML = editor.state.doc.textBetween(from, to, ' ');
          setSelectedHTML(selectedHTML);
        }

        // 计算工具栏位置
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          const toolbarWidth = 300;
          const toolbarHeight = 50;
          const padding = 10;

          let top = rect.bottom + padding;
          let left = rect.left + rect.width / 2 - toolbarWidth / 2;

          // 边界检测
          if (left < padding) left = padding;
          if (left + toolbarWidth > window.innerWidth - padding) {
            left = window.innerWidth - toolbarWidth - padding;
          }
          if (top + toolbarHeight > window.innerHeight - padding) {
            top = rect.top - toolbarHeight - padding;
          }

          setToolbarPosition({ top, left });
          setShowToolbar(true);
          setShowPreview(false);
        }
      } else {
        setShowToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [editor, editorRef]);

  // 处理AI操作
  const handleAIAction = useCallback(
    (actionId: string) => {
      if (!selectedText || !editor) return;

      // 保存当前选区范围
      const { from, to } = editor.state.selection;
      setSelectedRange({ from, to });

      setCurrentAction(actionId);
      setShowToolbar(false);

      // 计算预览卡片位置（在选中文本下方）
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPreviewPosition({
          top: rect.bottom + 10,
          left: Math.max(10, rect.left),
        });
      }

      setShowPreview(true);
      reset();

      try {
        switch (actionId) {
          case 'polish':
            streamPolish(selectedText, '更加流畅和专业');
            break;
          case 'improve':
            streamImprove(selectedText, '提高可读性和逻辑性');
            break;
          case 'expand':
            streamExpand(selectedText, 'medium');
            break;
          case 'summarize':
            streamSummarize(selectedText, 'medium');
            break;
          case 'translate':
            // 默认翻译为英文，后续可以添加语言选择
            streamTranslate(selectedText, '英文');
            break;
          default:
            adnaan.toast.error('暂不支持该功能');
            setShowPreview(false);
        }
      } catch (error: any) {
        adnaan.toast.error(error.message || 'AI操作失败');
        setShowPreview(false);
      }
    },
    [selectedText, streamPolish, streamImprove, streamExpand, streamSummarize, streamTranslate, reset],
  );

  // 接受AI建议
  const handleAccept = useCallback(() => {
    if (!editor || !streamContent || !selectedRange) return;

    // 将Markdown转换为HTML
    const htmlContent = RichTextParser.streamMarkdownToHtml(streamContent);

    // 使用保存的选区范围
    editor
      .chain()
      .focus()
      .deleteRange({ from: selectedRange.from, to: selectedRange.to })
      .insertContent(htmlContent)
      .run();

    adnaan.toast.success('已应用AI建议');
    setShowPreview(false);
    setSelectedRange(null);
    reset();
  }, [editor, streamContent, selectedRange, reset]);

  // 关闭预览
  const handleClose = useCallback(() => {
    setShowPreview(false);
    cancelTask();
    reset();
  }, [cancelTask, reset]);

  // 将流式Markdown内容转换为HTML用于预览
  const previewHtml = useMemo(() => {
    if (!streamContent) return '<span style="color: var(--text-secondary);">正在生成中...</span>';
    return RichTextParser.streamMarkdownToHtml(streamContent);
  }, [streamContent]);

  // 处理AI生成的内容（从空内容开始）
  const handleGenerate = useCallback(
    (prompt: string) => {
      if (!editor) return;

      // 先重置状态
      reset();

      // 清空编辑器
      editor.commands.setContent('');

      // 开始流式生成
      streamChat(prompt);

      // 标记开始从空内容生成（在streamChat之后）
      setIsGeneratingFromEmpty(true);
    },
    [editor, reset, streamChat],
  );

  // 监听流式内容并实时更新编辑器（使用requestAnimationFrame优化性能）
  useEffect(() => {
    if (!isGeneratingFromEmpty || !streamContent || !editor) return;

    // 使用requestAnimationFrame避免阻塞渲染
    const rafId = requestAnimationFrame(() => {
      try {
        // 使用streamMarkdownToHtml专门处理流式输出
        // 它会自动检测未闭合的代码块并保护代码块内容不被误解析
        const htmlContent = RichTextParser.streamMarkdownToHtml(streamContent);
        editor.commands.setContent(htmlContent);
        editor.commands.focus('end');
      } catch (error) {
        console.error('❌ 更新编辑器失败:', error);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [isGeneratingFromEmpty, streamContent, editor]);

  // 监听生成完成
  useEffect(() => {
    if (isGeneratingFromEmpty && !isStreaming && streamContent) {
      // 生成完成
      setIsGeneratingFromEmpty(false);
      adnaan.toast.success('内容已生成');
    }
  }, [isGeneratingFromEmpty, isStreaming, streamContent]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showToolbar || !selectedText) return;

      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const actionIndex = parseInt(e.key) - 1;
        if (AI_ACTIONS[actionIndex]) {
          handleAIAction(AI_ACTIONS[actionIndex].id);
        }
      }

      if (e.key === 'Escape') {
        setShowToolbar(false);
        setShowPreview(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showToolbar, selectedText, handleAIAction]);

  return (
    <>
      {/* 空内容提示 - 类似placeholder */}
      <AnimatePresence>
        {showEmptyTrigger && isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyStateTrigger>
              输入 / 唤起命令菜单，或直接开始输入...{' '}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setShowWritingDialog(true);
                }}
              >
                使用 AI 创作
              </a>
            </EmptyStateTrigger>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动工具栏 */}
      <AnimatePresence>
        {showToolbar && isConnected && (
          <FloatingToolbar
            position={toolbarPosition}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {AI_ACTIONS.map((action) => (
              <ToolbarButton
                key={action.id}
                onClick={() => handleAIAction(action.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action.icon}
                <span>{action.label}</span>
              </ToolbarButton>
            ))}
          </FloatingToolbar>
        )}
      </AnimatePresence>

      {/* 内联预览卡片 */}
      <AnimatePresence>
        {showPreview && (
          <InlinePreviewCard
            position={previewPosition}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <PreviewHeader>
              <PreviewTitle>
                {isStreaming ? <FiLoader /> : <FiZap />}
                AI {AI_ACTIONS.find((a) => a.id === currentAction)?.label}
                {isStreaming && (
                  <StreamingIndicator>
                    <span />
                    <span />
                    <span />
                  </StreamingIndicator>
                )}
              </PreviewTitle>
              <Button variant="secondary" size="small" onClick={handleClose}>
                <FiX />
              </Button>
            </PreviewHeader>

            <PreviewContent>
              <DiffView>
                <DiffBlock type="original">
                  <div className="content">{selectedText}</div>
                </DiffBlock>

                <DiffBlock type="new">
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html: previewHtml,
                    }}
                  />
                </DiffBlock>
              </DiffView>
            </PreviewContent>

            <PreviewActions>
              <KeyboardHint>
                <kbd>⌘</kbd> + <kbd>Enter</kbd> 接受
              </KeyboardHint>
              <ActionButton
                variant="secondary"
                size="small"
                onClick={() => handleAIAction(currentAction)}
                disabled={isStreaming}
              >
                <FiRefreshCw /> 重新生成
              </ActionButton>
              <ActionButton
                variant="primary"
                size="small"
                onClick={handleAccept}
                disabled={isStreaming || !streamContent}
              >
                <FiCheck /> 接受
              </ActionButton>
            </PreviewActions>
          </InlinePreviewCard>
        )}
      </AnimatePresence>

      {/* AI写作对话框 */}
      <AIWritingDialog
        isOpen={showWritingDialog}
        onClose={() => setShowWritingDialog(false)}
        onGenerate={handleGenerate}
      />

      {/* AI打字指示器 */}
      <AnimatePresence>
        {isGeneratingFromEmpty && (
          <AITypingIndicator
            isVisible={true}
            charCount={streamContent?.replace(/<[^>]*>/g, '').length || 0}
            editorRef={editorRef}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
