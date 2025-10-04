import React, { useEffect, useMemo } from 'react';
import Color from 'colorjs.io';

// 类型定义
interface AccentColorConfig {
  light: string[];
  dark: string[];
}

// 预设颜色方案 - 优化版（更协调柔和）
const ACCENT_COLORS: AccentColorConfig = {
  light: [
    '#5183f5', // 标准蓝 - 默认主题色
    '#26A69A', // 青绿色 - 清新
    '#66a6d8', // 柔和天蓝 - 舒适
    '#FF9066', // 珊瑚橙 - 温暖
    '#9C7FB8', // 柔和紫 - 优雅（之前是#BA68C8太鲜艳）
    '#4FB8E8', // 湖蓝 - 清爽
    '#95C956', // 草绿 - 活力
  ],
  dark: [
    '#7B88D8', // 亮蓝紫 - 易读
    '#6BC9BE', // 青绿 - 柔和
    '#8B95C9', // 柔和紫蓝 - 舒适
    '#E6B84D', // 柔和金黄 - 温暖（之前太亮）
    '#A89FD8', // 淡紫 - 优雅（调整对比度）
    '#7DC5F0', // 天蓝 - 清晰
    '#B8D890', // 柔和绿 - 护眼
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

  // 将十六进制颜色转换为RGB字符串，例如: "255, 0, 0"（用于rgba）
  hexToRgbString: (hex: string) => {
    const color = new Color(hex);
    const { r, g, b } = color.srgb;
    return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
  },

  // 计算颜色的亮度（0-1），用于判断颜色是否太淡
  calculateLightness: (hex: string) => {
    const color = new Color(hex);
    return color.oklch.l; // 返回 OKLCH 的 L 值（亮度）
  },

  // 计算阴影透明度 - 使用固定较高值确保可见性
  calculateShadowAlpha: (hex: string, isDark: boolean = false) => {
    // 直接返回较高的固定值，确保阴影始终可见
    // 之前的 #5183f533 相当于 alpha = 0.2，但视觉效果很好
    // 这里我们使用更高的值确保所有颜色都清晰
    return isDark ? 0.5 : 0.5;
  },

  // 生成渐变色
  generateGradientColors: (hex: string, isDark: boolean = false) => {
    const color = new Color(hex);

    if (isDark) {
      // 暗色模式：使用更鲜明的渐变
      const fromColor = new Color(color).mix('#ffffff', 0.15);
      const toColor = new Color(color).mix('#000000', 0.2);
      return {
        from: colorUtils.hexToRgbString(fromColor.toString()),
        to: colorUtils.hexToRgbString(toColor.toString()),
      };
    } else {
      // 亮色模式：保持原有逻辑
      const fromColor = new Color(color).mix('white', 0.2);
      const toColor = new Color(color).mix('white', 0.5);
      return {
        from: colorUtils.hexToRgbString(fromColor.toString()),
        to: colorUtils.hexToRgbString(toColor.toString()),
      };
    }
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

      // 生成暗色模式相关颜色 - 优化对比度
      const darkColorAssistant = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.15); // 更亮的辅助色
      const darkColorHover = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.25); // 增强悬停效果
      const darkColorAlpha = colorUtils.generateAlphaColor(currentDarkColor, '#ffffff', 0.2, 0.15); // 提高透明色可见度
      const darkGradient = colorUtils.generateGradientColors(currentDarkColor, true);
      const darkBgColor = new Color(currentDarkColor).mix('#1a1a1a', 0.7).toString(); // 更深的背景色

      // 生成OKLCH值
      const [hl, sl, ll] = colorUtils.hexToOklchString(currentLightColor);
      const [hd, sd, ld] = colorUtils.hexToOklchString(currentDarkColor);

      // 生成主题色的 RGB 字符串（用于 rgba）
      const lightRgb = colorUtils.hexToRgbString(currentLightColor);
      const darkRgb = colorUtils.hexToRgbString(currentDarkColor);

      // 计算动态阴影透明度
      const lightShadowAlpha = colorUtils.calculateShadowAlpha(currentLightColor, false);
      const darkShadowAlpha = colorUtils.calculateShadowAlpha(currentDarkColor, true);

      // 返回生成的CSS
      return `
        [data-theme='dark'] {
          --accent-color-dark: ${currentDarkColor};
          --accent-bg-color-dark: ${darkBgColor};
          --accent-color-dark-assistant: ${darkColorAssistant};
          --accent-color-dark-hover: ${darkColorHover};
          --accent-color-dark-alpha: ${darkColorAlpha};
          --accent-rgb: ${darkRgb}; /* RGB 格式用于 rgba() */
          --nav-shadow-alpha: ${darkShadowAlpha.toFixed(2)}; /* 动态计算的阴影透明度 */
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
          --accent-rgb: ${lightRgb}; /* RGB 格式用于 rgba() */
          --nav-shadow-alpha: ${lightShadowAlpha.toFixed(2)}; /* 动态计算的阴影透明度 */
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
