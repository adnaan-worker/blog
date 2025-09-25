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
    '#26A69A', // 薄荷绿
    '#69a6cc', // 天蓝
    '#FFB74D', // 明亮橙
    '#BA68C8', // 浅紫
    '#4FC3F7', // 亮天蓝
    '#AED581', // 淡黄绿
  ],
  dark: [
    '#A0A7D4', // 淡紫
    '#99D8CF', // 淡绿
    '#838BC6', // 淡蓝紫
    '#FFD54F', // 明亮黄
    '#D1C4E9', // 淡薰衣草紫
    '#B3E5FC', // 极浅蓝
    '#DCEDC8', // 极浅绿
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
    return new Color(baseColor).mix(new Color(mixColor), mixRatio).toString({ format: 'rgba', alpha });
  },

  // 将十六进制颜色转换为RGB字符串，例如: "255 0 0"
  hexToRgbString: (hex: string) => {
    const color = new Color(hex);
    const { r, g, b } = color.srgb;
    return `${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}`;
  },

  // 生成渐变色
  generateGradientColors: (hex: string) => {
    // 否则根据颜色生成渐变
    const color = new Color(hex);

    // 创建一个更轻一点的颜色作为渐变起点
    const fromColor = new Color(color).mix('white', 0.2);
    // 创建一个更亮更淡的颜色作为渐变终点
    const toColor = new Color(color).mix('white', 0.5);

    return {
      from: colorUtils.hexToRgbString(fromColor.toString()),
      to: colorUtils.hexToRgbString(toColor.toString()),
    };
  },

  // 生成背景色
  generateBgColor: (hex: string) => {
    const color = new Color(hex);
    return color.mix('white', 0.2).toString();
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
      const lightColorAlpha = colorUtils.generateAlphaColor(currentLightColor, '#ffffff', 0.45, 0.1);
      const lightGradient = colorUtils.generateGradientColors(currentLightColor);
      const lightBgColor = colorUtils.generateBgColor(currentLightColor);

      // 生成暗色模式相关颜色
      const darkColorAssistant = colorUtils.generateAssistantColor(currentDarkColor, '#000000', 0.2);
      const darkColorHover = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.15);
      const darkColorAlpha = colorUtils.generateAlphaColor(currentDarkColor, '#000000', 0.45, 0.1);
      const darkGradient = colorUtils.generateGradientColors(currentDarkColor);
      const darkBgColor = colorUtils.generateBgColor(currentDarkColor);

      // 生成OKLCH值
      const [hl, sl, ll] = colorUtils.hexToOklchString(currentLightColor);
      const [hd, sd, ld] = colorUtils.hexToOklchString(currentDarkColor);

      // 返回生成的CSS
      return `
        [data-theme='dark'] {
          --accent-color-dark: ${currentDarkColor};
          --accent-bg-color-dark: ${darkBgColor};
          --accent-color-dark-assistant: ${darkColorAssistant};
          --accent-color-dark-hover: ${darkColorHover};
          --accent-color-dark-alpha: ${darkColorAlpha};
          --a: ${`${hd} ${sd} ${ld}`};
          --gradient-from: ${darkGradient.from};
          --gradient-to: ${darkGradient.to};
        }
        [data-theme='light'] {
          --accent-color-light: ${currentLightColor};
          --accent-bg-color-light: ${lightBgColor};
          --accent-color-light-assistant: ${lightColorAssistant};
          --accent-color-light-hover: ${lightColorHover};
          --accent-color-light-alpha: ${lightColorAlpha};
          --a: ${`${hl} ${sl} ${ll}`};
          --gradient-from: ${lightGradient.from};
          --gradient-to: ${lightGradient.to};
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
