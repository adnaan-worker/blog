import { css } from '@emotion/react';

// 移除重复定义的 glassStyle，改用全局 .glass 类名

export const dockItemHover = css`
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:active {
    transform: scale(0.92);
  }
`;
