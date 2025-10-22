import styled from '@emotion/styled';

/**
 * 富文本内容容器 - 统一样式组件
 * 适用于所有详情页面：文章、手记、项目等
 *
 * 核心样式已在 rich-text.css 中定义(.rich-text-content)
 * 这里只添加布局和移动端优化相关的样式
 */
export const RichTextContent = styled.div`
  /* 基础布局 */
  padding: 2rem 0;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;

  /* 应用全局富文本样式类 */
  &.rich-text-content {
    /* rich-text.css 中的样式会自动应用 */
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 1rem 0;

    /* 表格和代码块负边距全宽显示 */
    pre,
    table {
      margin-left: -0.75rem;
      margin-right: -0.75rem;
      border-radius: 0;
    }

    /* 图片移动端优化 */
    img {
      margin-left: 0;
      margin-right: 0;
      border-radius: 0;
    }
  }

  /* 防止长单词和URL溢出 */
  p,
  li {
    word-break: break-word;
    overflow-wrap: break-word;
  }

  a {
    word-break: break-all;
  }

  /* 代码块内不换行，允许横向滚动 */
  pre code {
    white-space: pre;
    word-break: normal;
    display: block;
    overflow-x: auto;
  }

  /* 内联代码允许换行 */
  code:not(pre code) {
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* 表格响应式处理 */
  table {
    display: block;
    overflow-x: auto;
    max-width: 100%;

    th,
    td {
      white-space: nowrap;

      @media (max-width: 768px) {
        padding: 0.5rem;
        font-size: 0.85em;
      }
    }
  }

  /* 图片响应式 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;

export default RichTextContent;
