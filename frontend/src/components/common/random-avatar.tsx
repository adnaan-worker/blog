import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { LazyImage } from './lazy-image';

/**
 * DiceBear 头像样式
 */
export type AvatarStyle =
  | 'avataaars' // 卡通人物
  | 'personas' // 简约人物
  | 'initials' // 首字母
  | 'pixel-art' // 像素风
  | 'identicon' // 几何图案
  | 'bottts' // 机器人
  | 'shapes' // 抽象形状
  | 'fun-emoji'; // 表情符号

/**
 * 头像组件属性
 */
interface RandomAvatarProps {
  /** 用于生成头像的种子值（用户名、邮箱等） */
  seed: string;
  /** 头像尺寸（px） */
  size?: number;
  /** 头像风格 */
  style?: AvatarStyle;
  /** 自定义类名 */
  className?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 背景色（仅对某些风格有效） */
  backgroundColor?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 加载失败时的后备内容 */
  fallback?: React.ReactNode;
}

const AvatarContainer = styled.div<{
  size: number;
  clickable: boolean;
  showBorder: boolean;
}>`
  position: relative;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  border: ${(props) => (props.showBorder ? '2px solid var(--border-color)' : 'none')};
  transition: all 0.2s ease;

  ${(props) =>
    props.clickable &&
    `
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const FallbackContainer = styled.div<{ size: number }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 85%), hsl(${Math.random() * 360}, 70%, 75%));
  color: white;
  font-weight: 700;
  font-size: ${(props) => props.size * 0.4}px;
  text-transform: uppercase;
`;

/**
 * 生成 DiceBear 头像 URL
 */
const generateAvatarUrl = (
  seed: string,
  style: AvatarStyle = 'personas',
  size: number = 40,
  backgroundColor?: string,
): string => {
  const baseUrl = 'https://api.dicebear.com/7.x';
  const encodedSeed = encodeURIComponent(seed);

  let params = new URLSearchParams({
    seed: encodedSeed,
    size: size.toString(),
  });

  // 根据不同风格添加特定参数
  switch (style) {
    case 'avataaars':
      params.append('accessories', 'prescription01,prescription02,round,sunglasses,wayfarers');
      params.append('accessoriesChance', '40');
      break;
    case 'personas':
      params.append('hair', 'curly,straight,wavy');
      params.append('beard', 'beard,goatee,mustache');
      params.append('beardChance', '30');
      break;
    case 'initials':
      if (backgroundColor) {
        params.append('backgroundColor', backgroundColor.replace('#', ''));
      }
      params.append('fontSize', '36');
      break;
    case 'pixel-art':
      params.append('mood', 'happy,sad,surprised');
      break;
  }

  return `${baseUrl}/${style}/svg?${params.toString()}`;
};

/**
 * 随机头像组件
 */
export const RandomAvatar: React.FC<RandomAvatarProps> = ({
  seed,
  size = 40,
  style = 'personas',
  className,
  onClick,
  showBorder = false,
  backgroundColor,
  lazy = true,
  fallback,
}) => {
  const [hasError, setHasError] = useState(false);

  // 生成头像 URL
  const avatarUrl = useMemo(
    () => generateAvatarUrl(seed, style, size, backgroundColor),
    [seed, style, size, backgroundColor],
  );

  // 生成后备内容（首字母）
  const fallbackContent = useMemo(() => {
    if (fallback) return fallback;

    const initials = seed
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return <FallbackContainer size={size}>{initials}</FallbackContainer>;
  }, [seed, size, fallback]);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <AvatarContainer
      size={size}
      clickable={!!onClick}
      showBorder={showBorder}
      className={className}
      onClick={onClick}
      title={`${seed} 的头像`}
    >
      {hasError ? (
        fallbackContent
      ) : lazy ? (
        <LazyImage
          src={avatarUrl}
          alt={`${seed} 的头像`}
          onError={handleError}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img src={avatarUrl} alt={`${seed} 的头像`} onError={handleError} loading="lazy" />
      )}
    </AvatarContainer>
  );
};

/**
 * 预设配置的头像组件
 */
export const UserAvatar: React.FC<Omit<RandomAvatarProps, 'style'>> = (props) => (
  <RandomAvatar {...props} style="personas" />
);

export const CommentAvatar: React.FC<Omit<RandomAvatarProps, 'style' | 'size'>> = (props) => (
  <RandomAvatar {...props} style="pixel-art" size={32} showBorder />
);

export const GuestbookAvatar: React.FC<Omit<RandomAvatarProps, 'style' | 'size'>> = (props) => (
  <RandomAvatar {...props} style="avataaars" size={40} />
);

export default RandomAvatar;
