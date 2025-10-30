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

    /* 代码块和表格在移动端全宽显示 */
    pre,
    table {
      margin-left: -0.75rem;
      margin-right: -0.75rem;
      border-radius: 0;
    }

    /* 图片在移动端全宽显示 */
    img {
      margin-left: 0;
      margin-right: 0;
      border-radius: 0;
    }
  }
`;

export default RichTextContent;
