import { useEffect } from 'react';
import styled from '@emotion/styled';
import { L2Dwidget } from 'live2d-widget';

const Live2DContainer = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 100;
  width: 300px;
  height: 300px;
  pointer-events: auto;
  cursor: pointer;

  // 手机端隐藏
  @media (max-width: var(--mobile)) {
    display: none;
  }
`;

export const Live2DModel = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && L2Dwidget) {
      try {
        // 使用可选链确保安全访问
        L2Dwidget.init({
          model: {
            jsonPath: 'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
            scale: 1,
          },
          display: {
            position: 'left',
            width: 200,
            height: 400,
            hOffset: 0,
            vOffset: -20,
            pointerEvents: 'auto',
          },
          mobile: {
            show: false,
            scale: 0.8,
          },
          react: {
            opacityDefault: 0.8,
            opacityOnHover: 0.1,
            hover: true,
            click: true,
            tap: true,
            tapRandom: true,
            tapRandomInterval: 1000,
            tapRandomMessages: [
              { message: '不要戳我啦~', weight: 1 },
              { message: '再戳我就生气了！', weight: 1 },
              { message: '好痒啊~', weight: 1 },
              { message: '别闹了~', weight: 1 },
              { message: '再戳我就咬你哦！', weight: 1 },
            ],
          },
          dialog: {
            enable: false,
            hitokoto: false,
            messages: ['你好呀~', '今天也要加油哦！', '欢迎来到我的博客~', '有什么我可以帮你的吗？', '要记得多喝水哦~'],
            delay: 0,
            duration: 2000,
            width: 250,
            height: 100,
            opacity: 0.8,
            fontSize: 14,
            fontColor: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            margin: 10,
            position: 'bottom',
            offset: 20,
            style: {
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              zIndex: 99999,
            },
          },
          dev: {
            border: false,
            log: true,
          },
          tool: {
            enable: true,
            position: 'right',
            size: 0.5,
          },
        });
      } catch (error) {
        console.error('Failed to initialize Live2D widget:', error);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        // 清理 Live2D 实例
        const container = document.querySelector('.live2d-widget-container');
        if (container) {
          container.remove();
        }
      }
    };
  }, []);

  return <Live2DContainer />;
};

export default Live2DModel;
