import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Color from 'colorjs.io';
import { createCanvasNoiseBackground } from './noise-bg';

// 类型定义
export interface AccentColorConfig {
  light: string[];
  dark: string[];
}

// 预设颜色方案
export const ACCENT_COLORS: AccentColorConfig = {
  light: [
    '#5183f5', // 标准蓝 - 默认主题色
    '#26A69A', // 青绿色 - 清新
    '#66a6d8', // 柔和天蓝 - 舒适
    '#FF9066', // 珊瑚橙 - 温暖
    '#9C7FB8', // 柔和紫 - 优雅
    '#4FB8E8', // 湖蓝 - 清爽
    '#95C956', // 草绿 - 活力
  ],
  dark: [
    '#7B88D8', // 亮蓝紫 - 易读
    '#6BC9BE', // 青绿 - 柔和
    '#8B95C9', // 柔和紫蓝 - 舒适
    '#E6B84D', // 柔和金黄 - 温暖
    '#A89FD8', // 淡紫 - 优雅
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
  // 监听当前主题
  const currentTheme = useSelector((state: RootState) => state.theme.theme);
  const colorIndex = useSelector((state: RootState) => state.theme.colorIndex); // 获取用户选择的颜色索引

  const [noiseBgs, setNoiseBgs] = useState({
    light: '',
    dark: '',
  });

  // 使用useMemo计算当前使用的颜色
  const selectedColors = useMemo(() => {
    // 如果用户选择了固定颜色
    if (colorIndex !== null && colorIndex >= 0 && colorIndex < ACCENT_COLORS.light.length) {
      return {
        light: ACCENT_COLORS.light[colorIndex],
        dark: ACCENT_COLORS.dark[colorIndex],
      };
    }

    // 否则使用随机颜色（每次组件重新挂载时随机，或者 Redux 中 colorIndex 为 null 时）
    // 注意：为了避免 hydration mismatch 或不必要的跳变，这里应该保持稳定
    // 但因为 colorIndex 为 null 时表示"随机"，我们可以在这里随机
    const randomLightIndex = Math.floor(Math.random() * ACCENT_COLORS.light.length);
    // 保持 light/dark 索引一致，以获得最佳匹配体验
    const index = randomLightIndex;

    return {
      light: ACCENT_COLORS.light[index],
      dark: ACCENT_COLORS.dark[index],
    };
  }, [colorIndex]); // 当 colorIndex 变化时重新计算

  // 预生成噪点图 - 优化性能
  useEffect(() => {
    let isMounted = true;

    const generateNoises = async () => {
      try {
        const [lightNoise, darkNoise] = await Promise.all([
          createCanvasNoiseBackground(selectedColors.light),
          createCanvasNoiseBackground(selectedColors.dark),
        ]);

        if (isMounted) {
          setNoiseBgs({ light: lightNoise, dark: darkNoise });
        }
      } catch (error) {
        console.error('生成噪点背景失败:', error);
      }
    };

    generateNoises();

    return () => {
      isMounted = false;
    };
  }, [selectedColors]);

  // 生成CSS样式 - 使用useMemo优化
  const generateStyles = useMemo(() => {
    try {
      const { light: currentLightColor, dark: currentDarkColor } = selectedColors;

      // 生成亮色模式相关颜色
      const lightColorAssistant = colorUtils.generateAssistantColor(currentLightColor, '#ffffff', 0.3);
      const lightColorHover = colorUtils.generateAssistantColor(currentLightColor, '#000000', 0.15);
      const lightColorAlpha = colorUtils.generateAlphaColor(currentLightColor, '#ffffff', 0.45, 0.1);
      const lightGradient = colorUtils.generateGradientColors(currentLightColor);

      // 生成暗色模式相关颜色 - 优化对比度
      const darkColorAssistant = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.15);
      const darkColorHover = colorUtils.generateAssistantColor(currentDarkColor, '#ffffff', 0.25);
      const darkColorAlpha = colorUtils.generateAlphaColor(currentDarkColor, '#ffffff', 0.2, 0.15);
      const darkGradient = colorUtils.generateGradientColors(currentDarkColor, true);

      // 生成OKLCH值
      const [hl, sl, ll] = colorUtils.hexToOklchString(currentLightColor);
      const [hd, sd, ld] = colorUtils.hexToOklchString(currentDarkColor);

      // 生成主题色的 RGB 字符串（用于 rgba）
      const lightRgb = colorUtils.hexToRgbString(currentLightColor);
      const darkRgb = colorUtils.hexToRgbString(currentDarkColor);

      // 计算动态阴影透明度
      const lightShadowAlpha = colorUtils.calculateShadowAlpha(currentLightColor, false);
      const darkShadowAlpha = colorUtils.calculateShadowAlpha(currentDarkColor, true);

      // 生成额外的衍生颜色（供其他组件使用）
      const lightColorSoft = colorUtils.generateAlphaColor(currentLightColor, '#ffffff', 0.6, 0.15);
      const darkColorSoft = colorUtils.generateAlphaColor(currentDarkColor, '#ffffff', 0.3, 0.2);

      // 生成噪点背景变量（如果已生成）
      const lightNoiseVar = noiseBgs.light ? `--noise-bg: ${noiseBgs.light};` : '';
      const darkNoiseVar = noiseBgs.dark ? `--noise-bg: ${noiseBgs.dark};` : '';

      // 返回生成的CSS
      return `
        [data-theme='dark'] {
          --accent-color-dark: ${currentDarkColor};
          --accent-color-dark-assistant: ${darkColorAssistant};
          --accent-color-dark-hover: ${darkColorHover};
          --accent-color-dark-alpha: ${darkColorAlpha};
          --accent-color-dark-soft: ${darkColorSoft}; /* 柔和主题色 */
          --accent-rgb: ${darkRgb}; /* RGB 格式用于 rgba() */
          --nav-shadow-alpha: ${darkShadowAlpha.toFixed(2)}; /* 动态计算的阴影透明度 */
          --a: ${`${hd} ${sd} ${ld}`}; /* OKLCH 值 */
          --gradient-from: ${darkGradient.from}; /* 渐变起点 RGB */
          --gradient-to: ${darkGradient.to}; /* 渐变终点 RGB */
          ${darkNoiseVar} /* 暗色模式噪点背景 */
        }
        [data-theme='light'] {
          --accent-color-light: ${currentLightColor};
          --accent-color-light-assistant: ${lightColorAssistant};
          --accent-color-light-hover: ${lightColorHover};
          --accent-color-light-alpha: ${lightColorAlpha};
          --accent-color-light-soft: ${lightColorSoft}; /* 柔和主题色 */
          --accent-rgb: ${lightRgb}; /* RGB 格式用于 rgba() */
          --nav-shadow-alpha: ${lightShadowAlpha.toFixed(2)}; /* 动态计算的阴影透明度 */
          --a: ${`${hl} ${sl} ${ll}`}; /* OKLCH 值 */
          --gradient-from: ${lightGradient.from}; /* 渐变起点 RGB */
          --gradient-to: ${lightGradient.to}; /* 渐变终点 RGB */
          ${lightNoiseVar} /* 亮色模式噪点背景 */
        }
      `;
    } catch (error) {
      console.error('生成主题样式失败:', error);
      return '';
    }
  }, [selectedColors, noiseBgs]);

  // 注入样式 - 在主题切换时也会重新生成
  useEffect(() => {
    const styleElement = document.getElementById('accent-color-style') || document.createElement('style');
    styleElement.id = 'accent-color-style';
    styleElement.innerHTML = generateStyles;

    if (!document.getElementById('accent-color-style')) {
      document.head.appendChild(styleElement);
    }
  }, [generateStyles, currentTheme]);

  return null;
};

export default AccentColorStyleInjector;
