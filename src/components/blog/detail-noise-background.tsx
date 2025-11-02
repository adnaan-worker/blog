import styled from '@emotion/styled';

/**
 * 详情页专用噪点背景
 * 仅在文章详情、手记详情、项目详情等阅读页面使用
 */
export const DetailNoiseBackground = styled.div`
  position: fixed;
  inset: 0;
  content: '';
  opacity: 0.02;
  background-repeat: repeat;
  background-image: var(--noise-bg);
  pointer-events: none;
  z-index: 0;

  /* 确保在详情页内容下方 */
  [data-theme='dark'] & {
    opacity: 0.015;
  }
`;

export default DetailNoiseBackground;
