import React, { useState } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiLink,
  FiImage,
  FiList,
  FiCode,
  FiType,
  FiAlignJustify,
  FiMaximize2,
  FiMoreHorizontal,
} from 'react-icons/fi';

// 定义扩展数组
const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: '开始编写你的内容...',
  }),
  Image.configure({
    allowBase64: true,
    inline: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
  Link.configure({
    openOnClick: false,
    validate: (href: string) => /^https?:\/\//.test(href),
  }),
  Underline,
];

// 初始内容
const initialContent = '<p>开始编写你的内容...</p>';

interface TextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// 工具栏样式
const editorStyles = {
  richTextEditorWrapper: {
    width: '100%',
  },
  textEditorContainer: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  editorToolbar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    padding: '0.5rem',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  toolbarGroup: {
    display: 'flex',
    borderRight: '1px solid var(--border-color)',
    paddingRight: '0.5rem',
    marginRight: '0.5rem',
  },
  toolbarGroupLast: {
    borderRight: 'none',
    paddingRight: '0',
    marginRight: '0',
  },
  toolbarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: '0',
    marginRight: '2px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toolbarButtonHover: {
    background: 'var(--bg-tertiary)',
  },
  toolbarButtonActive: {
    background: 'var(--accent-color-alpha)',
    color: 'var(--accent-color)',
    border: '1px solid var(--accent-color)',
  },
  toolbarText: {
    fontSize: '14px',
    fontWeight: 500,
  },
  tiptapEditor: {
    outline: 'none',
    width: '100%',
    minHeight: '400px',
    padding: '1rem',
  },
};

// 工具栏按钮组件
const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  // 插入图片
  const addImage = () => {
    const url = window.prompt('输入图片URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // 添加链接
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接URL', previousUrl);

    // 取消链接
    if (url === null) {
      return;
    }

    // 清空链接
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // 设置链接
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div style={editorStyles.editorToolbar}>
      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('bold') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="加粗"
        >
          <FiBold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('italic') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="斜体"
        >
          <FiItalic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('underline') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="下划线"
        >
          <FiUnderline size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 2 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题2"
        >
          <FiType size={16} /> 2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 3 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题3"
        >
          <FiType size={16} /> 3
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'left' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="左对齐"
        >
          <FiAlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'center' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="居中对齐"
        >
          <FiAlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'right' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="右对齐"
        >
          <FiAlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'justify' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="两端对齐"
        >
          <FiAlignJustify size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('bulletList') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="无序列表"
        >
          <FiList size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('orderedList') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="有序列表"
        >
          <span style={editorStyles.toolbarText}>1.</span>
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('blockquote') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="引用"
        >
          <span style={editorStyles.toolbarText}>『』</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('codeBlock') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="代码块"
        >
          <FiCode size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={setLink}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('link') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="添加链接"
        >
          <FiLink size={16} />
        </button>
        <button onClick={addImage} style={editorStyles.toolbarButton} title="插入图片">
          <FiImage size={16} />
        </button>
      </div>

      <div style={{ ...editorStyles.toolbarGroup, ...editorStyles.toolbarGroupLast }}>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={editorStyles.toolbarButton}
          title="水平分割线"
        >
          <FiMoreHorizontal size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().selectAll().run()}
          style={editorStyles.toolbarButton}
          title="全选"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

// 编辑器样式
const getCustomStyles = (minHeight: string) => `
  .tiptap-editor {
    outline: none;
    width: 100%;
    min-height: ${minHeight};
    padding: 1rem;
  }
  
  /* 对应BlogDetail中的文章内容样式 */
  .tiptap-editor h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  .tiptap-editor h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--accent-color);
    border-radius: 2px;
  }
  
  .tiptap-editor h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
  }
  
  .tiptap-editor p {
    margin-bottom: 1.5rem;
  }
  
  .tiptap-editor ul, .tiptap-editor ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  .tiptap-editor li {
    margin-bottom: 0.5rem;
  }
  
  .tiptap-editor blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--accent-color);
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
    font-style: italic;
  }
  
  .tiptap-editor blockquote p {
    margin-bottom: 0;
  }
  
  .tiptap-editor code {
    font-family: var(--font-code);
    background: var(--bg-secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .tiptap-editor pre {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1.5rem;
  }
  
  .tiptap-editor pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
  }
  
  .tiptap-editor img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
  }
`;

const TextEditor: React.FC<TextEditorProps> = ({
  content = initialContent,
  onChange,
  placeholder = '开始编写你的内容...',
  minHeight = '400px',
}) => {
  const [value, setValue] = useState(content);

  const handleUpdate = ({ editor }: { editor: any }) => {
    const html = editor.getHTML();
    setValue(html);

    if (onChange) {
      onChange(html);
    }
  };

  return (
    <div style={editorStyles.richTextEditorWrapper}>
      <div style={editorStyles.textEditorContainer}>
        <style dangerouslySetInnerHTML={{ __html: getCustomStyles(minHeight) }} />
        <EditorProvider
          extensions={extensions}
          content={value}
          onUpdate={handleUpdate}
          editorProps={{
            attributes: {
              class: 'tiptap-editor',
            },
          }}
          slotBefore={<MenuBar />}
        />
      </div>
    </div>
  );
};

export default TextEditor;
