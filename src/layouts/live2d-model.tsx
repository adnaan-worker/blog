import { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const Live2DContainer = styled(motion.div)`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 100;
  width: 200px;
  height: 400px;
  pointer-events: none;
  @media (max-width: 768px) {
    display: none;
  }
`;

// 小屋样式 - 默认显示
const PetHouse = styled(motion.div)`
  position: fixed;
  left: 10px;
  bottom: 10px;
  width: 60px;
  height: 60px;
  background-color: var(--accent-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 99;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 15px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 0 0 20px 20px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// 门样式
const DoorEffect = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 小爪子样式 - 鼠标悬停时显示
const PawEffect = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 15px;
  background: var(--accent-color);
  border-radius: 50% 50% 30% 30%;
  bottom: -5px;
  left: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 5px;
    height: 5px;
    background-color: var(--accent-color-hover);

    border-radius: 50%;
    top: 4px;
  }

  &::before {
    left: 4px;
  }

  &::after {
    right: 4px;
  }
`;

// 指示器样式
const PetIcon = styled(motion.div)`
  font-size: 24px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

// 加载指示器
const LoadingIndicator = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

// 交互区域
const InteractionArea = styled(motion.div)`
  position: absolute;
  left: 25px;
  bottom: 100px;
  width: 150px;
  height: 150px;
  background-color: transparent;
  cursor: pointer;
  pointer-events: auto;
  z-index: 102;
`;

// 消息气泡样式
const MessageBubble = styled(motion.div)`
  position: absolute;
  left: 150px;
  bottom: 180px;
  min-width: 180px;
  max-width: 250px;
  padding: 10px 14px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: var(--text-primary);
  pointer-events: none;
  z-index: 103;

  &::before {
    content: '';
    position: absolute;
    bottom: 15px;
    left: -8px;
    width: 16px;
    height: 16px;
    background-color: white;
    transform: rotate(45deg);
    border-radius: 2px;
  }
`;

// 随机消息数组
const MESSAGES = [
  '你好呀~欢迎来到我的博客！',
  '今天天气怎么样？',
  '你知道吗？多喝水对身体有好处哦！',
  '休息一下吧，长时间看屏幕对眼睛不好~',
  '有什么我能帮你的吗？',
  '希望你今天过得愉快！',
  '记得保持微笑哦~',
  '发现什么有趣的内容了吗？',
  '别忘了适当运动哦！',
  '今天也要加油呀！',
];

export const Live2DModel = () => {
  // 默认收缩状态为true
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  // 使用ref记录是否应该自动展开模型
  const shouldExpandRef = useRef(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleCollapse = () => {
    // 如果正在加载中，不响应点击
    if (isModelLoading) return;

    // 如果当前是收缩状态，需要展开并加载模型
    if (isCollapsed && !modelLoaded) {
      setIsModelLoading(true);
      initLive2DModel();
      // 记录需要自动展开
      shouldExpandRef.current = true;
      return; // 不立即切换状态，等模型加载完成后再切换
    }

    // 否则正常切换状态
    setIsCollapsed(!isCollapsed);
  };

  // 显示随机消息
  const showRandomMessage = () => {
    // 清除之前的定时器
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }

    // 随机选择一条消息
    const randomIndex = Math.floor(Math.random() * MESSAGES.length);
    setCurrentMessage(MESSAGES[randomIndex]);
    setShowMessage(true);

    // 设置消息自动消失的定时器
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
      messageTimeoutRef.current = null;
    }, 4000);
  };

  // 处理鼠标悬停事件
  const handleModelHover = () => {
    if (!isCollapsed && modelLoaded) {
      showRandomMessage();
    }
  };

  // 初始化Live2D模型的函数
  const initLive2DModel = () => {
    if (typeof window !== 'undefined' && (window as any).L2Dwidget) {
      try {
        const L2Dwidget = (window as any).L2Dwidget;

        // 创建一个新的script元素用于监听模型加载
        const script = document.createElement('script');
        script.id = 'live2d-load-monitor';
        script.textContent = `
          window.live2dLoadMonitor = {
            start: new Date().getTime(),
            checkInterval: setInterval(function() {
              const canvas = document.querySelector('.live2d-widget canvas');
              if (canvas) {
                clearInterval(window.live2dLoadMonitor.checkInterval);
                const loadTime = new Date().getTime() - window.live2dLoadMonitor.start;
                console.log('Live2D模型加载完成，耗时: ' + loadTime + 'ms');
                document.dispatchEvent(new CustomEvent('live2d-loaded'));
              }
            }, 100)
          };
        `;
        document.head.appendChild(script);

        // 监听自定义事件，当模型加载完成时触发
        document.addEventListener('live2d-loaded', handleModelLoaded, { once: true });

        L2Dwidget.init({
          model: {
            jsonPath: 'https://summerscar.me/live2dDemo/assets/penchan/penchan.model.json',
            scale: 1,
          },
          display: {
            position: 'left',
            width: 150,
            height: 300,
            hOffset: 0,
            vOffset: -20,
          },
          mobile: {
            show: false,
            scale: 0.8,
          },
          react: {
            opacityDefault: 0.8,
            opacityOnHover: 0.1,
          },
          dialog: {
            enable: false, // 禁用内置对话框，使用自定义对话框
            hitokoto: false,
            messages: [''],
            delay: 0,
            duration: 0,
            width: 250,
            height: 100,
            opacity: 0,
            fontSize: 14,
            fontColor: '#000000',
            backgroundColor: 'var(--bg-primary)',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            margin: 10,
            position: 'bottom',
            offset: 20,
            style: {
              display: 'none',
              visibility: 'hidden',
              opacity: 0,
              zIndex: 0,
            },
          },
          dev: {
            border: false,
            log: false,
          },
        });

        // 设置一个超时，防止模型加载失败
        setTimeout(() => {
          const evt = new CustomEvent('live2d-loaded');
          document.dispatchEvent(evt);
        }, 10000);

        // 模型初始应该隐藏（透明）
        setTimeout(() => {
          const live2dContainer = document.querySelector('.live2d-widget-container');
          if (live2dContainer) {
            (live2dContainer as HTMLElement).style.opacity = '0';
            (live2dContainer as HTMLElement).style.transform = 'translateY(100px)';
          }
        }, 100);
      } catch (error) {
        console.error('初始化Live2D模型失败:', error);
        setIsModelLoading(false);
        setIsCollapsed(true);
      }
    }
  };

  // 处理模型加载完成事件
  const handleModelLoaded = () => {
    console.log('Live2D模型加载完成');
    setModelLoaded(true);
    setIsModelLoading(false);

    // 移除监控脚本
    const script = document.getElementById('live2d-load-monitor');
    if (script) {
      script.remove();
    }

    // 如果应该自动展开，则展开模型
    if (shouldExpandRef.current) {
      setTimeout(() => {
        setIsCollapsed(false);
        shouldExpandRef.current = false;
      }, 300);
    }
  };

  // 监听收缩状态变化
  useEffect(() => {
    if (!modelLoaded) return;

    const live2dContainer = document.querySelector('.live2d-widget-container');
    if (live2dContainer) {
      if (isCollapsed) {
        // 使用弹性动画效果收缩
        (live2dContainer as HTMLElement).style.opacity = '0';
        (live2dContainer as HTMLElement).style.transform = 'translateY(100px)';
        (live2dContainer as HTMLElement).style.transition =
          'transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.3s ease';

        // 隐藏消息
        setShowMessage(false);
      } else {
        // 使用弹跳效果展开
        (live2dContainer as HTMLElement).style.opacity = '1';
        (live2dContainer as HTMLElement).style.transform = 'translateY(0)';
        (live2dContainer as HTMLElement).style.transition =
          'transform 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.49), opacity 0.3s ease';

        // 展开后显示欢迎消息
        setTimeout(() => {
          setCurrentMessage('你好呀~欢迎来到我的博客！');
          setShowMessage(true);

          // 设置消息自动消失
          messageTimeoutRef.current = setTimeout(() => {
            setShowMessage(false);
          }, 4000);
        }, 800);
      }
    }
  }, [isCollapsed, modelLoaded]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const container = document.querySelector('.live2d-widget-container');
        if (container) {
          container.remove();
        }

        // 清理监听器
        document.removeEventListener('live2d-loaded', handleModelLoaded);

        // 清理监控脚本
        const script = document.getElementById('live2d-load-monitor');
        if (script) {
          script.remove();
        }

        // 清理全局变量
        if (Object.prototype.hasOwnProperty.call(window, 'live2dLoadMonitor')) {
          clearInterval((window as any).live2dLoadMonitor?.checkInterval);
          delete (window as any).live2dLoadMonitor;
        }

        // 清理消息定时器
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
          messageTimeoutRef.current = null;
        }
      }
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isCollapsed ? (
          <PetHouse
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            onClick={toggleCollapse}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <DoorEffect
              animate={{
                boxShadow: isHovering
                  ? 'inset 0px 0px 15px rgba(255,255,255,0.8)'
                  : 'inset 0px 0px 5px rgba(255,255,255,0.3)',
              }}
              transition={{ duration: 0.3 }}
            >
              {isModelLoading ? (
                <LoadingIndicator initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                  >
                    ⏳
                  </motion.div>
                </LoadingIndicator>
              ) : (
                <PetIcon>🏠</PetIcon>
              )}
            </DoorEffect>

            <AnimatePresence>
              {isHovering && !isModelLoading && (
                <PawEffect
                  initial={{ y: 15 }}
                  animate={{ y: [15, 5, 10, 0], rotate: [-5, 5, 0] }}
                  exit={{ y: 15 }}
                  transition={{
                    duration: 0.4,
                    times: [0, 0.4, 0.7, 1],
                    ease: 'easeOut',
                  }}
                />
              )}
            </AnimatePresence>
          </PetHouse>
        ) : (
          <Live2DContainer
            className="hide-on-mobile"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <InteractionArea
              onClick={toggleCollapse}
              onMouseEnter={handleModelHover}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />

            <AnimatePresence>
              {showMessage && (
                <MessageBubble
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {currentMessage}
                </MessageBubble>
              )}
            </AnimatePresence>
          </Live2DContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Live2DModel;
