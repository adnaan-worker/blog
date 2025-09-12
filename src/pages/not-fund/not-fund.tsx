import React, { useState, useEffect, useMemo, useRef, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiTerminal, FiArrowLeft, FiHome, FiFolder } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #0d1117;
  font-family: var(--font-code);
  position: relative;
  overflow: hidden;

  [data-theme='light'] & {
    background: #f6f8fa;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
    opacity: 0.1;
    pointer-events: none;
  }
`;

const Terminal = styled(motion.div)`
  height: 500px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(1, 4, 9, 0.85);
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: var(--font-code);

  [data-theme='light'] & {
    background: #ffffff;
    border-color: #d0d7de;
    box-shadow: 0 16px 32px rgba(31, 35, 40, 0.15);
  }

  @media (max-width: 768px) {
    margin: 0 1rem;
    max-width: calc(100vw - 2rem);
    height: 400px;
  }
`;

const TerminalHeader = styled.div`
  background: #21262d;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  [data-theme='light'] & {
    background: #f6f8fa;
    border-bottom-color: #d0d7de;
  }
`;

const TrafficLights = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TrafficLight = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  opacity: 0.8;
`;

const TerminalTitle = styled.div`
  color: #f0f6fc;
  font-size: 0.875rem;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  [data-theme='light'] & {
    color: #24292f;
  }
`;

const TerminalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #0d1117;
  color: #e6edf3;
  font-size: 0.875rem;
  line-height: 1.6;
  scroll-behavior: smooth;
  cursor: text;

  [data-theme='light'] & {
    background: #ffffff;
    color: #24292f;
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #21262d;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #484f58;
  }

  [data-theme='light'] &::-webkit-scrollbar-track {
    background: #f6f8fa;
  }

  [data-theme='light'] &::-webkit-scrollbar-thumb {
    background: #d0d7de;
  }

  [data-theme='light'] &::-webkit-scrollbar-thumb:hover {
    background: #afb8c1;
  }

  /* 火狐浏览器滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #30363d #21262d;

  [data-theme='light'] & {
    scrollbar-color: #d0d7de #f6f8fa;
  }
`;

const CommandLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  &::before {
    content: '$ ';
    color: #7c3aed;
    font-weight: 600;
    margin-right: 0.5rem;
  }
`;

const Command = styled.span<{ delay?: number }>`
  color: #58a6ff;

  [data-theme='light'] & {
    color: #0969da;
  }
`;

const Output = styled.div<{ delay?: number }>`
  margin: 1rem 0;
  padding-left: 1rem;
`;

const ErrorText = styled.div`
  color: #f85149;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 1rem 0;

  [data-theme='light'] & {
    color: #cf222e;
  }
`;

const CodeBlock = styled.pre`
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.8rem;

  [data-theme='light'] & {
    background: #f6f8fa;
    border-color: #d0d7de;
  }
`;

/* 输入行样式（用于替换按钮区域） */
const InputLine = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.75rem;

  &::before {
    content: '$ ';
    color: #7c3aed;
    font-weight: 600;
    margin-right: 0.5rem;
  }
`;

const TerminalButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #238636;
  color: #ffffff;
  border: 1px solid #2ea043;
  border-radius: 6px;
  font-family: var(--font-code);
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #2ea043;
    border-color: #46954a;
    transform: translateY(-1px);
  }

  &.secondary {
    background: #21262d;
    color: #f0f6fc;
    border-color: #30363d;

    &:hover {
      background: #30363d;
      border-color: #484f58;
    }

    [data-theme='light'] & {
      background: #f6f8fa;
      color: #24292f;
      border-color: #d0d7de;

      &:hover {
        background: #f3f4f6;
        border-color: #afb8c1;
      }
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Cursor = styled(motion.span)`
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: #58a6ff;
  margin-left: 2px;

  [data-theme='light'] & {
    background: #0969da;
  }
`;

const TypewriterText = styled.span`
  color: #e6edf3;

  [data-theme='light'] & {
    color: #24292f;
  }
`;

const NotFoundPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [logs, setLogs] = useState<{ type: 'command' | 'output' | 'error'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      { type: 'command', text: 'cd /var/www/blog' },
      { type: 'command', text: 'ls -la pages/' },
      {
        type: 'output',
        text: `total 42
drwxr-xr-x  8 user user 4096 Dec 12 23:00 .
drwxr-xr-x 12 user user 4096 Dec 12 22:58 ..
-rw-r--r--  1 user user 2048 Dec 12 23:00 home.tsx
-rw-r--r--  1 user user 1536 Dec 12 22:59 about.tsx
-rw-r--r--  1 user user 3072 Dec 12 23:00 posts.tsx`,
      },
      { type: 'command', text: 'find . -name "*404*" -o -name "*not-found*"' },
      { type: 'error', text: 'Error: 404 - Page Not Found' },
    ],
    [],
  );

  // 初始化第一条
  useEffect(() => {
    setLogs([{ type: steps[0].type as any, text: (steps[0] as any).text }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 逐步推进输出，追加到 logs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setLogs((prev) => [...prev, steps[currentStep + 1] as any]);
        setCurrentStep(currentStep + 1);
      }
    }, 1000 + currentStep * 500);

    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  // 智能自动滚动：仅当用户在底部时才跟随
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs, currentStep, showCursor, isAtBottom]);

  // 监听滚动，维护是否在底部
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 8;
      setIsAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // 初次挂载聚焦输入
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  // 智能自动滚动：仅当用户在底部时才跟随
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 8;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs, currentStep, showCursor]);

  return (
    <Container>
      <Terminal initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <TerminalHeader>
          <TrafficLights>
            <TrafficLight color="#ff5f57" />
            <TrafficLight color="#ffbd2e" />
            <TrafficLight color="#28ca42" />
          </TrafficLights>
          <TerminalTitle>
            <FiTerminal size={14} />
            terminal — 404 error
          </TerminalTitle>
        </TerminalHeader>

        <TerminalBody
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          tabIndex={0}
          aria-label="404 Terminal Output"
        >
          {steps.slice(0, currentStep + 1).map((step, index) => (
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {step.type === 'command' && (
                <CommandLine>
                  <Command>{step.text}</Command>
                </CommandLine>
              )}
              {step.type === 'output' && (
                <Output>
                  <TypewriterText>{step.text}</TypewriterText>
                </Output>
              )}
              {step.type === 'error' && <ErrorText>{step.text}</ErrorText>}
            </motion.div>
          ))}

          {/* 渲染用户输入的命令和输出 */}
          {logs.slice(steps.length).map((log, index) => (
            <motion.div
              key={`user-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {log.type === 'command' && (
                <CommandLine>
                  <Command>{log.text}</Command>
                </CommandLine>
              )}
              {log.type === 'output' && (
                <Output>
                  <TypewriterText>{log.text}</TypewriterText>
                </Output>
              )}
              {log.type === 'error' && <ErrorText>{log.text}</ErrorText>}
            </motion.div>
          ))}

          {currentStep === steps.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {/* 输入命令行（替换原按钮区域） */}
              <InputLine>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key !== 'Enter') return;

                    const cmd = input.trim();
                    if (!cmd) return;

                    setLogs((prev) => [...prev, { type: 'command', text: cmd }]);
                    const normalized = cmd.toLowerCase();
                    const goHome = ['cd /', 'home', 'cd ~', 'cd ~/home', 'go home'];
                    const goBack = ['cd ..', 'back', 'return', 'up'];

                    // 立即清空输入框
                    setInput('');

                    // 优先处理 help 命令
                    if (normalized === 'help') {
                      setLogs((prev) => [
                        ...prev,
                        {
                          type: 'output',
                          text: `可用命令:
  - cd /        回到首页
  - cd ..       返回上一页
  - cd posts    前往文章列表
  - cd about    查看关于
  - help        查看帮助`,
                        },
                      ]);
                      return;
                    }

                    if (goHome.includes(normalized)) {
                      setLogs((prev) => [...prev, { type: 'output', text: '→ Navigating to /' }]);
                      navigate('/');
                      return;
                    }

                    if (goBack.includes(normalized)) {
                      setLogs((prev) => [...prev, { type: 'output', text: '→ Navigating back' }]);
                      navigate(-1);
                      return;
                    }

                    if (normalized.startsWith('cd ')) {
                      const target = cmd.slice(3).trim();
                      if (['/posts', 'posts'].includes(target)) {
                        setLogs((prev) => [...prev, { type: 'output', text: '→ Navigating to /posts' }]);
                        navigate('/posts');
                        return;
                      }
                      if (['/about', 'about'].includes(target)) {
                        setLogs((prev) => [...prev, { type: 'output', text: '→ Navigating to /about' }]);
                        navigate('/about');
                        return;
                      }
                      setLogs((prev) => [...prev, { type: 'error', text: `cd: no such file or directory: ${target}` }]);
                      return;
                    }

                    setLogs((prev) => [...prev, { type: 'error', text: `command not found: ${cmd}` }]);
                  }}
                  placeholder='输入命令，如 "cd /" 回首页，"cd .." 返回上一页，输入 "help" 查看帮助'
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.875rem',
                    caretColor: '#58a6ff',
                  }}
                  autoFocus
                />
              </InputLine>
            </motion.div>
          )}
        </TerminalBody>
      </Terminal>
    </Container>
  );
};

export default NotFoundPage;
