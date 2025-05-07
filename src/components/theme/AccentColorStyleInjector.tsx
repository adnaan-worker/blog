import React, { useEffect, useState } from 'react';
import Color from 'colorjs.io';

// 颜色定义接口
interface AccentColorConfig {
  light: string[];
  dark: string[];
}

// 将十六进制颜色转换为OKLCH
const hexToOklchString = (hex: string) => {
  return new Color(hex).oklch
}
// 预设颜色方案
const accentColorLight = [
  // 浅葱 (淡蓝绿色)
  '#33A6B8',
  // 暖红
  '#FF6666',
  // 薄荷绿
  '#26A69A',
  // 粉红
  '#fb7287',
  // 天蓝
  '#69a6cc',
];

const accentColorDark = [
  // 桃色
  '#F596AA',
  // 淡紫
  '#A0A7D4',
  // 亮红
  '#ff7b7b',
  // 淡绿
  '#99D8CF',
  // 淡蓝紫
  '#838BC6',
];

// 默认颜色配置
const defaultAccentColor: AccentColorConfig = {
  light: accentColorLight,
  dark: accentColorDark,
};

interface AccentColorStyleInjectorProps {
  color?: AccentColorConfig;
}

/**
 * 根据主题色创建噪点背景并注入样式
 */
export const AccentColorStyleInjector: React.FC<AccentColorStyleInjectorProps> = ({ color }) => {
  const [styleContent, setStyleContent] = useState<string>('');
  const [lightColor, setLightColor] = useState<string>('');
  const [darkColor, setDarkColor] = useState<string>('');

  useEffect(() => {
    const generateStyles = async () => {
      try {
        // 使用传入的颜色配置或默认配置
        const colorConfig = color || defaultAccentColor;

        // 随机选择亮色和暗色主题色
        const randomLightIndex = Math.floor(Math.random() * colorConfig.light.length);
        const randomDarkIndex = Math.floor(Math.random() * colorConfig.dark.length);

        const currentLightColor = colorConfig.light[randomLightIndex];
        const currentDarkColor = colorConfig.dark[randomDarkIndex];

        setLightColor(currentLightColor);
        setDarkColor(currentDarkColor);

        const lightOklch = hexToOklchString(currentLightColor);
        const darkOklch = hexToOklchString(currentDarkColor);

        const [hl, sl, ll] = lightOklch;
        const [hd, sd, ld] = darkOklch;

        // 生成CSS变量
        const css = `
          :root {
            --accent-color-light: ${currentLightColor};
            --accent-color-dark: ${currentDarkColor};
            --a: ${`${hl} ${sl} ${ll}`};
          }
        `;

        setStyleContent(css);
      } catch (error) {
        console.error('生成主题样式失败:', error);
      }
    };

    generateStyles();
  }, [color]);

  return (
    <style
      id="accent-color-style"
      data-light={lightColor}
      data-dark={darkColor}
      dangerouslySetInnerHTML={{ __html: styleContent }}
    />
  );
};

export default AccentColorStyleInjector;