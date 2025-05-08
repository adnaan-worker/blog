import React, { useEffect, useMemo } from 'react';
import Color from 'colorjs.io';

// 类型定义
interface AccentColorConfig {
  light: string[];
  dark: string[];
}

// 预设颜色方案
const ACCENT_COLORS: AccentColorConfig = {
  light: [
    '#33A6B8', // 浅葱 (淡蓝绿色)
    '#FF6666', // 暖红
    '#26A69A', // 薄荷绿
    '#fb7287', // 粉红
    '#69a6cc', // 天蓝
  ],
  dark: [
    '#F596AA', // 桃色
    '#A0A7D4', // 淡紫
    '#ff7b7b', // 亮红
    '#99D8CF', // 淡绿
    '#838BC6', // 淡蓝紫
  ],
};

// 颜色生成工具函数
const colorUtils = {
  // 将十六进制颜色转换为OKLCH
  hexToOklchString: (hex: string) => new Color(hex).oklch,

  // 生成辅助颜色
  generateAssistantColor: (baseColor: string, mixColor: string, mixRatio: number) => {
    return new Color(baseColor).mix(new Color(mixColor), mixRatio);
  },

  // 生成带透明度的颜色
  generateAlphaColor: (baseColor: string, mixColor: string, mixRatio: number, alpha: number) => {
    return new Color(baseColor)
      .mix(new Color(mixColor), mixRatio)
      .toString({ format: 'rgba', alpha });
  },
};

/**
 * 主题色样式注入器组件
 * 用于生成和注入随机主题色及其相关样式
 */
const AccentColorStyleInjector: React.FC = () => {
  // 使用useMemo缓存随机选择的颜色，避免重复计算
  const selectedColors = useMemo(() => {
    const randomLightIndex = Math.floor(Math.random() * ACCENT_COLORS.light.length);
    const randomDarkIndex = Math.floor(Math.random() * ACCENT_COLORS.dark.length);
    
    return {
      light: ACCENT_COLORS.light[randomLightIndex],
      dark: ACCENT_COLORS.dark[randomDarkIndex],
    };
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  // 生成CSS样式
  const generateStyles = () => {
    try {
      const { light: currentLightColor, dark: currentDarkColor } = selectedColors;

      // 生成亮色模式相关颜色
      const lightColorAssistant = colorUtils.generateAssistantColor(currentLightColor, '#ffffff', 0.3);
      const lightColorHover = colorUtils.generateAssistantColor(currentLightColor, '#000000', 0.15);
      const lightColorAlpha = colorUtils.generateAlphaColor(currentLightColor, '#ffffff', 0.85, 0.1);

      // 生成暗色模式相关颜色
      const darkColorAssistant = colorUtils.generateAssistantColor(currentDarkColor, '#000000', 0.2);
      const darkColorHover = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.15);
      const darkColorAlpha = colorUtils.generateAlphaColor(currentDarkColor, '#000000', 0.85, 0.1);

      // 生成OKLCH值
      const [hl, sl, ll] = colorUtils.hexToOklchString(currentLightColor);
      const [hd, sd, ld] = colorUtils.hexToOklchString(currentDarkColor);

      // 返回生成的CSS
      return `
        [data-theme='dark'] {
          --accent-color-dark: ${currentDarkColor};
          --accent-color-dark-assistant: ${darkColorAssistant};
          --accent-color-dark-hover: ${darkColorHover};
          --accent-color-dark-alpha: ${darkColorAlpha};
          --a: ${`${hd} ${sd} ${ld}`};
        }
        [data-theme='light'] {
          --accent-color-light: ${currentLightColor};
          --accent-color-light-assistant: ${lightColorAssistant};
          --accent-color-light-hover: ${lightColorHover};
          --accent-color-light-alpha: ${lightColorAlpha};
          --a: ${`${hl} ${sl} ${ll}`};
        }
      `;
    } catch (error) {
      console.error('生成主题样式失败:', error);
      return '';
    }
  };

  // 注入样式
  useEffect(() => {
    const styleElement = document.getElementById('accent-color-style') || document.createElement('style');
    styleElement.id = 'accent-color-style';
    styleElement.innerHTML = generateStyles();
    
    if (!document.getElementById('accent-color-style')) {
      document.head.appendChild(styleElement);
    }
  }, [selectedColors]);

  return null; // 这是一个纯样式注入组件，不需要渲染任何内容
};

export default AccentColorStyleInjector;