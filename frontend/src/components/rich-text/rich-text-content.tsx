import styled from '@emotion/styled';

/**
 * 富文本内容容器 - 统一样式组件
 * 适用于所有详情页面：文章、手记、项目等
 *
 */
export const RichTextContent = styled.div`
  /* ========== 基础布局 ========== */
  padding: 2rem 0;
  max-width: 100%;

  /* ========== 移动端优化 ========== */
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

export default RichTextContent;
