/**
 * 富文本编辑器辅助工具函数
 */

/**
 * 上传图片到服务器
 * @param file 图片文件
 * @param uploadFn API上传函数
 * @returns 图片URL
 */
export const uploadImage = async (
  file: File,
  uploadFn: (files: File[], folder: string) => Promise<any>,
): Promise<string> => {
  try {
    const response = await uploadFn([file], 'editor');

    // 后端返回的数据结构是 { data: { data: [...] } }
    const files = response.data?.data.data;

    if (files && Array.isArray(files) && files.length > 0) {
      // 返回第一个上传成功的文件URL
      const fileUrl = files[0].url || files[0].path;
      // 修复路径中的反斜杠
      return fileUrl.replace(/\\/g, '/');
    }

    throw new Error('上传失败,请重试');
  } catch (error: any) {
    console.error('图片上传失败:', error);
    throw new Error(error.message || '图片上传失败');
  }
};

/**
 * 删除斜杠命令文本
 * @param editor TipTap编辑器实例
 */
export const removeSlashCommand = (editor: any) => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;
  const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
  const slashPos = textBefore.lastIndexOf('/');

  if (slashPos !== -1) {
    const from = $from.pos - (textBefore.length - slashPos);
    const to = $from.pos;
    editor.chain().focus().deleteRange({ from, to }).run();
  }
};

/**
 * 处理AI返回内容,转换为TipTap编辑器兼容格式
 * @param content AI返回的HTML内容
 * @returns 处理后的HTML
 */
/**
 * 处理AI生成的内容，确保格式符合编辑器和渲染器要求
 * @param content AI生成的原始HTML内容
 * @returns 处理后的HTML内容
 */
export const processAIContentForEditor = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '<p></p>';
  }

  let processedContent = content.trim();

  // 1. 移除可能的Markdown代码块标记
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    return `<pre><code class="language-${language || 'text'}">${code.trim()}</code></pre>`;
  });

  // 2. 移除外层包装
  processedContent = processedContent.replace(/^<div[^>]*class="rich-text-content"[^>]*>([\s\S]*)<\/div>$/i, '$1');

  // 3. 移除所有 rich-text-* 类名（渲染器会自动添加）
  processedContent = processedContent.replace(/class="rich-text-[^"]*"/gi, '');

  // 4. 清理空的class属性
  processedContent = processedContent.replace(/\s*class="\s*"\s*/gi, ' ');

  // 5. 移除style属性（不允许内联样式）
  processedContent = processedContent.replace(/\s*style="[^"]*"/gi, '');

  // 6. 标准化代码块格式
  processedContent = processedContent.replace(
    /<pre[^>]*>\s*<code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, language, code) => {
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    },
  );

  // 7. 处理没有语言标识符的代码块
  processedContent = processedContent.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, code) => {
      const trimmedCode = code.trim();
      let language = 'text';

      // 智能语言推断
      if (
        trimmedCode.includes('function') ||
        trimmedCode.includes('const ') ||
        trimmedCode.includes('let ') ||
        trimmedCode.includes('=>')
      ) {
        language = 'javascript';
      } else if (trimmedCode.includes('def ') || trimmedCode.includes('import ') || trimmedCode.includes('from ')) {
        language = 'python';
      } else if (trimmedCode.includes('SELECT ') || trimmedCode.includes('FROM ') || trimmedCode.includes('WHERE ')) {
        language = 'sql';
      } else if (trimmedCode.includes('<!DOCTYPE') || (trimmedCode.includes('<') && trimmedCode.includes('>'))) {
        language = 'html';
      } else if (trimmedCode.match(/^\s*[{\[]/)) {
        language = 'json';
      } else if (trimmedCode.includes('public class') || trimmedCode.includes('private ')) {
        language = 'java';
      }

      return `<pre><code class="language-${language}">${code}</code></pre>`;
    },
  );

  // 8. 清理多余的空白
  processedContent = processedContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余的空行
    .replace(/>\s+</g, '><') // 移除标签之间的多余空格
    .trim();

  // 9. 确保段落格式正确
  processedContent = processedContent.replace(/<p>\s*<\/p>/g, ''); // 移除空段落

  // 10. 标准化链接格式
  processedContent = processedContent.replace(
    /<a\s+href="([^"]+)"[^>]*>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">',
  );

  // 11. 处理引用块格式
  processedContent = processedContent.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    // 确保引用内容有段落包装
    if (!content.trim().startsWith('<p>')) {
      return `<blockquote><p>${content.trim()}</p></blockquote>`;
    }
    return `<blockquote>${content}</blockquote>`;
  });

  // 12. 如果内容为空，返回空段落
  if (!processedContent.trim() || processedContent === '<p></p>') {
    return '<p></p>';
  }

  // 13. 确保内容以段落或其他块级元素开始
  if (!processedContent.match(/^<(p|h[1-6]|ul|ol|pre|blockquote|table)/i)) {
    processedContent = `<p>${processedContent}</p>`;
  }

  return processedContent;
};

/**
 * 获取当前代码块的语言
 * @param editor TipTap编辑器实例
 * @returns 语言代码
 */
export const getCurrentCodeBlockLanguage = (editor: any): string => {
  if (!editor) return 'text';

  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  if ($from.parent.type.name === 'codeBlock') {
    return $from.parent.attrs.language || 'text';
  }

  return 'text';
};

/**
 * 获取光标位置的坐标
 * @param view ProseMirror视图
 * @param editorRect 编辑器容器的DOMRect
 * @returns 相对于编辑器容器的坐标
 */
export const getRelativeCursorPosition = (view: any, editorRect: DOMRect) => {
  const { state } = view;
  const { selection } = state;
  const { $from } = selection;

  // 获取光标位置
  const coords = view.coordsAtPos($from.pos);

  const relativeTop = coords.top - editorRect.top;
  const relativeLeft = coords.left - editorRect.left;

  return { top: relativeTop, left: relativeLeft, coords, editorRect };
};

/**
 * 计算菜单显示位置(智能判断上方或下方)
 * @param cursorTop 光标相对位置
 * @param editorRect 编辑器矩形
 * @param menuHeight 菜单高度
 * @returns 菜单顶部位置
 */
export const calculateMenuPosition = (cursorTop: number, editorRect: DOMRect, menuHeight: number = 400): number => {
  const spaceBelow = editorRect.bottom - (editorRect.top + cursorTop);
  const spaceAbove = cursorTop;

  let finalTop = cursorTop + 30;

  if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
    // 下方空间不足且上方空间更大,显示在上方
    finalTop = cursorTop - Math.min(menuHeight, spaceAbove);
  }

  return finalTop;
};

/**
 * 语言列表
 */
export const SUPPORTED_LANGUAGES = [
  { key: 'javascript', name: 'JavaScript' },
  { key: 'typescript', name: 'TypeScript' },
  { key: 'python', name: 'Python' },
  { key: 'java', name: 'Java' },
  { key: 'cpp', name: 'C++' },
  { key: 'csharp', name: 'C#' },
  { key: 'html', name: 'HTML' },
  { key: 'css', name: 'CSS' },
  { key: 'json', name: 'JSON' },
  { key: 'sql', name: 'SQL' },
  { key: 'bash', name: 'Bash' },
  { key: 'markdown', name: 'Markdown' },
  { key: 'text', name: '纯文本' },
] as const;

/**
 * 文本颜色选项
 */
export const TEXT_COLORS = [
  '#000000',
  '#e60000',
  '#ff9900',
  '#ffff00',
  '#008a00',
  '#0066cc',
  '#9933ff',
  '#ffffff',
  '#facccc',
  '#ffebcc',
  '#ffffcc',
  '#cce8cc',
  '#cce0f5',
  '#ebd6ff',
  '#bbbbbb',
  '#f06666',
  '#ffc266',
  '#ffff66',
  '#66b966',
  '#66a3e0',
  '#c285ff',
  '#888888',
  '#a10000',
  '#b26b00',
  '#b2b200',
  '#006100',
  '#0047b2',
  '#6b24b2',
  '#444444',
  '#5c0000',
  '#663d00',
  '#666600',
  '#003700',
  '#002966',
  '#3d1466',
] as const;

/**
 * 高亮颜色选项
 */
export const HIGHLIGHT_COLORS = [
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
] as const;
