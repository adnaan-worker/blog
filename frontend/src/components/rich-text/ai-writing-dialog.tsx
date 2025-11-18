import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiZap,
  FiFileText,
  FiList,
  FiMessageSquare,
  FiBook,
  FiTrendingUp,
  FiCode,
  FiMail,
  FiSend,
} from 'react-icons/fi';
import { Button, Textarea } from 'adnaan-ui';
import { useAIStream } from '@/hooks/useSocket';

// 对话框遮罩
const DialogOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

// 对话框容器
const DialogContainer = styled(motion.div)`
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* 移动端优化 */
  @media (max-width: 768px) {
    max-height: 90vh;
    border-radius: 12px;
    margin: 0.5rem;
  }
`;

// 对话框头部
const DialogHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-color);
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

// 对话框内容
const DialogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;

    &:hover {
      background: var(--text-secondary);
    }
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 快捷模板网格
const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  /* 移动端优化 */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const TemplateCard = styled(motion.button)`
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 0.875rem;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--accent-rgb, 99, 102, 241), 0.1);
    border-radius: 8px;
    color: var(--accent-color);
    margin-bottom: 0.75rem;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .desc {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

// 分隔线
const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 1.5rem 0;
  position: relative;

  &::after {
    content: '或';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 0.75rem;
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`;

// 自定义输入区
const CustomInputSection = styled.div`
  .label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 16px;
      height: 16px;
      color: var(--accent-color);
    }
  }

  .hint {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    line-height: 1.5;
  }
`;

// 示例提示
const ExamplePrompts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ExampleChip = styled.button`
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
  }
`;

// 对话框底部
const DialogFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-secondary);
`;

const FooterHint = styled.div`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

// 写作模板
const WRITING_TEMPLATES = [
  {
    id: 'blog',
    icon: <FiFileText />,
    title: '博客文章',
    desc: '撰写一篇有深度的博客文章',
    prompt: '请帮我写一篇关于【主题】的博客文章，要求内容有深度、逻辑清晰、适合技术博客发布。',
  },
  {
    id: 'tutorial',
    icon: <FiBook />,
    title: '教程指南',
    desc: '创建详细的教程或指南',
    prompt: '请帮我写一篇关于【主题】的教程，要求步骤清晰、易于理解、包含实例说明。',
  },
  {
    id: 'list',
    icon: <FiList />,
    title: '列表文章',
    desc: '整理要点或清单类内容',
    prompt: '请帮我写一篇关于【主题】的列表文章，列出关键要点，每个要点都有详细说明。',
  },
  {
    id: 'review',
    icon: <FiMessageSquare />,
    title: '评测分析',
    desc: '深入评测或分析某个主题',
    prompt: '请帮我写一篇关于【主题】的评测分析文章，包含优缺点分析和使用建议。',
  },
  {
    id: 'case',
    icon: <FiTrendingUp />,
    title: '案例研究',
    desc: '分享实践经验和案例',
    prompt: '请帮我写一篇关于【主题】的案例研究，包含背景、实施过程和经验总结。',
  },
  {
    id: 'tech',
    icon: <FiCode />,
    title: '技术文档',
    desc: '编写技术文档或API说明',
    prompt: '请帮我写一篇关于【主题】的技术文档，要求准确、专业、包含代码示例。',
  },
];

// 示例提示词
const EXAMPLE_PROMPTS = [
  '写一篇关于React Hooks最佳实践的文章',
  '介绍TypeScript高级类型的使用',
  '分享前端性能优化的经验',
  '讲解微服务架构的设计思路',
];

interface AIWritingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

export const AIWritingDialog: React.FC<AIWritingDialogProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { isConnected, isStreaming, content, stop, reset } = useAIStream();

  // 选择模板
  const handleSelectTemplate = useCallback((template: (typeof WRITING_TEMPLATES)[0]) => {
    setPrompt(template.prompt);
  }, []);

  // 选择示例
  const handleSelectExample = useCallback((example: string) => {
    setPrompt(example);
  }, []);

  // 开始生成
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !isConnected) return;

    try {
      // 通知父组件开始生成（父组件会调用streamChat）
      onGenerate(prompt);
      // 立即关闭对话框，在编辑器中显示生成过程
      onClose();
      setPrompt('');
    } catch (err: any) {
      adnaan.toast.error(err.message || '生成失败');
    }
  }, [prompt, isConnected, onClose, onGenerate]);

  // 关闭对话框
  const handleClose = useCallback(() => {
    if (isGenerating) {
      stop();
    }
    onClose();
    setPrompt('');
    setIsGenerating(false);
  }, [isGenerating, stop, onClose]);

  // 键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && !isGenerating) {
        handleClose();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim()) {
        e.preventDefault();
        handleGenerate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGenerating, prompt, handleClose, handleGenerate]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <DialogOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose}>
        <DialogContainer
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <HeaderTitle>
              <FiZap />
              <div>
                <h2>AI 写作助手</h2>
                <p>告诉我你想写什么，我来帮你创作</p>
              </div>
            </HeaderTitle>
            <Button variant="secondary" size="small" onClick={handleClose}>
              <FiX />
            </Button>
          </DialogHeader>

          <DialogContent>
            {/* 快捷模板 */}
            <div>
              <div className="label" style={{ marginBottom: '1rem', fontSize: '0.9375rem', fontWeight: 600 }}>
                选择写作模板
              </div>
              <TemplateGrid>
                {WRITING_TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="icon">{template.icon}</div>
                    <div className="title">{template.title}</div>
                    <div className="desc">{template.desc}</div>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            </div>

            <Divider />

            {/* 自定义输入 */}
            <CustomInputSection>
              <div className="label">
                <FiMessageSquare />
                描述你的写作需求
              </div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：写一篇关于React性能优化的技术文章，包含实际案例和代码示例..."
                rows={6}
                disabled={isGenerating}
              />
              <div className="hint">
                💡 提示：描述越详细，生成的内容越符合你的需求。可以包含主题、风格、长度等要求。
              </div>

              {/* 示例提示 */}
              <ExamplePrompts>
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <ExampleChip key={index} onClick={() => handleSelectExample(example)} disabled={isGenerating}>
                    {example}
                  </ExampleChip>
                ))}
              </ExamplePrompts>
            </CustomInputSection>
          </DialogContent>

          <DialogFooter>
            <FooterHint>
              <FiZap />
              {isGenerating ? '正在生成中...' : '按 ⌘Enter 快速生成'}
            </FooterHint>
            <FooterActions>
              <Button variant="secondary" size="medium" onClick={handleClose} disabled={isGenerating}>
                取消
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={handleGenerate}
                disabled={!prompt.trim() || !isConnected || isGenerating}
                leftIcon={isGenerating ? undefined : <FiSend />}
              >
                {isGenerating ? '生成中...' : '开始生成'}
              </Button>
            </FooterActions>
          </DialogFooter>
        </DialogContainer>
      </DialogOverlay>
    </AnimatePresence>
  );
};

export default AIWritingDialog;
