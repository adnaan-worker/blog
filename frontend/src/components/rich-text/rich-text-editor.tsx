import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import styled from '@emotion/styled';
import '@/styles/rich-text.css';
import { API } from '@/utils';
import { EditorToolbar } from './toolbar/editor-toolbar';
import { CommandMenu } from './toolbar/command-menu';
import { InputPanel } from './toolbar/input-panel';
import { AIAssistant } from './ai-assistant';
import { createExtensions } from '@/utils/editor/extensions';
import {
  uploadImage,
  getRelativeCursorPosition,
  calculateMenuPosition,
  getCurrentCodeBlockLanguage,
} from '@/utils/editor/helpers';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder, maxHeight }) => {
  // 状态管理
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 });
  const [commandSearch, setCommandSearch] = useState('');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  // 创建编辑器扩展(useMemo确保只创建一次)
  const extensions = useMemo(() => createExtensions(), []);

  // 图片上传处理函数 - 提前定义避免循环引用
  const uploadAndInsertImage = useCallback(async (file: File) => {
    try {
      if (isMountedRef.current) setIsUploading(true);
      const url = await uploadImage(file, API.user.batchUpload);
      return url;
    } catch (error: any) {
      console.error('图片上传失败:', error);
      if (isMountedRef.current) {
        adnaan?.toast.error(error.message || '图片上传失败', '上传失败');
      }
      return null;
    } finally {
      if (isMountedRef.current) setIsUploading(false);
    }
  }, []);

  // 创建编辑器实例
  const editor: Editor | null = useEditor({
    extensions,
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'ProseMirror rich-text-content',
        style: 'padding: 2rem 3rem; min-height: 400px;',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter((item) => item.type.indexOf('image') !== -1);

        if (imageItems.length > 0) {
          event.preventDefault();

          imageItems.forEach(async (item) => {
            const file = item.getAsFile();
            if (file) {
              const url = await uploadAndInsertImage(file);
              if (url && view.state.doc) {
                view.dispatch(view.state.tr.insertText(''));
                const { state } = view;
                const { tr } = state;
                const pos = state.selection.from;
                tr.insert(pos, state.schema.nodes.resizableImage.create({ src: url }));
                view.dispatch(tr);
              }
            }
          });

          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) => file.type.indexOf('image') !== -1);

        if (imageFiles.length > 0) {
          event.preventDefault();

          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!coords) return false;

          imageFiles.forEach(async (file) => {
            const url = await uploadAndInsertImage(file);
            if (url && view.state.doc) {
              const { state } = view;
              const { tr } = state;
              tr.insert(coords.pos, state.schema.nodes.resizableImage.create({ src: url }));
              view.dispatch(tr);
            }
          });

          return true;
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        // 检测输入 /
        if (event.key === '/') {
          const editorRect = editorRef.current?.getBoundingClientRect();
          if (editorRect) {
            const { top, left } = getRelativeCursorPosition(view, editorRect);
            const finalTop = calculateMenuPosition(top, editorRect);

            setCommandMenuPosition({ top: finalTop, left });
          }

          setCommandSearch('');
          setShowCommandMenu(true);
          return false;
        }

        // ESC 关闭菜单
        if (event.key === 'Escape') {
          if (showCommandMenu) {
            setShowCommandMenu(false);
            return true;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const html = editor.getHTML();

      // 使用 queueMicrotask 避免 flushSync 警告
      queueMicrotask(() => {
        onChange(html);
        isUpdatingRef.current = false;
      });

      // 检测命令输入
      if (showCommandMenu) {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);

        if (!textBefore.endsWith('/')) {
          const commandText = textBefore.split('/').pop() || '';
          setCommandSearch(commandText);
        }
      }
    },
  });

  // AI助手文本插入处理
  const handleAIInsertText = useCallback(
    (text: string, replace: boolean = false) => {
      if (!editor) return;

      if (replace) {
        // 替换选中的文本
        const { from, to } = editor.state.selection;
        editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
      } else {
        // 在光标位置插入文本
        editor.chain().focus().insertContent(text).run();
      }
    },
    [editor],
  );

  // 组件挂载/卸载处理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      editor?.destroy();
    };
  }, [editor]);

  // 同步外部内容变化 - 使用 ref 避免 flushSync 警告
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editor && content && content !== editor.getHTML() && !isUpdatingRef.current) {
      const trimmedContent = content.trim();
      if (trimmedContent && trimmedContent !== '<p></p>') {
        // 使用 queueMicrotask 避免在渲染期间同步更新
        queueMicrotask(() => {
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(trimmedContent, { emitUpdate: false });
          }
        });
      }
    }
  }, [content, editor]);

  // 处理链接插入
  const insertLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  // 处理图片URL插入
  const insertImage = useCallback(() => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.indexOf('image') !== -1);

      if (imageFiles.length === 0) {
        adnaan?.toast.error('请选择图片文件', '文件类型错误');
        return;
      }

      for (const file of imageFiles) {
        try {
          if (isMountedRef.current) setIsUploading(true);
          const url = await uploadImage(file, API.user.batchUpload);

          if (isMountedRef.current) {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        } catch (error: any) {
          console.error('图片上传失败:', error);
          if (isMountedRef.current) {
            adnaan?.toast.error(error.message || '图片上传失败', '上传失败');
          }
        } finally {
          if (isMountedRef.current) setIsUploading(false);
        }
      }

      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <EditorWrapper ref={editorRef} maxHeight={maxHeight}>
      {/* 浮动工具栏 */}
      <EditorToolbar
        editor={editor}
        isUploading={isUploading}
        onImageUploadClick={() => fileInputRef.current?.click()}
        onLinkClick={() => setShowLinkInput(!showLinkInput)}
        onImageClick={() => setShowImageInput(!showImageInput)}
      />

      {/* 链接输入框 */}
      {showLinkInput && (
        <InputPanel
          type="link"
          value={linkUrl}
          onChange={setLinkUrl}
          onConfirm={insertLink}
          onCancel={() => setShowLinkInput(false)}
        />
      )}

      {/* 图片URL输入框 */}
      {showImageInput && (
        <InputPanel
          type="image"
          value={imageUrl}
          onChange={setImageUrl}
          onConfirm={insertImage}
          onCancel={() => setShowImageInput(false)}
        />
      )}

      {/* 隐藏的文件上传输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* 上传状态提示 */}
      {isUploading && <UploadingIndicator>正在上传图片...</UploadingIndicator>}

      {/* 编辑器内容区 */}
      <div className="tiptap-editor-container" style={{ position: 'relative' }}>
        <EditorContent editor={editor} />

        {/* AI助手 - 优化版 */}
        <AIAssistant editor={editor} editorRef={editorRef} />
      </div>

      {/* 斜杠命令菜单 */}
      {showCommandMenu && (
        <CommandMenu
          editor={editor}
          position={commandMenuPosition}
          searchQuery={commandSearch}
          onCommandSelect={() => setShowCommandMenu(false)}
          onImageClick={() => {
            setShowCommandMenu(false);
            setShowImageInput(true);
          }}
          onLinkClick={() => {
            setShowCommandMenu(false);
            setShowLinkInput(true);
          }}
        />
      )}
    </EditorWrapper>
  );
};

// 样式组件
const EditorWrapper = styled.div<{ maxHeight?: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
  max-height: ${(props) => props.maxHeight || 'none'};

  @media (max-width: 768px) {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .tiptap-editor-container {
    flex: 1;
    overflow-y: auto;
    min-height: 200px;
    max-height: ${(props) => (props.maxHeight ? `calc(${props.maxHeight} - 50px)` : 'none')};
    outline: none;

    &:focus,
    &:focus-within {
      outline: none;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
    }

    @media (max-width: 768px) {
      padding-bottom: 80px; /* 底部留白，避免被键盘遮挡 */
    }
  }

  .ProseMirror {
    padding: 2rem;
    min-height: 200px;

    &:focus {
      outline: none;
    }

    /* 隐藏原生placeholder，使用自定义的AI助手placeholder */
    p.is-editor-empty:first-of-type::before {
      content: '';
      display: none;
    }
  }

  @media (max-width: 768px) {
    .ProseMirror {
      padding: 1rem 1.5rem !important;
    }
  }

  /* ===== 可调整大小的图片样式 ===== */
  .ProseMirror .resizable-image-wrapper {
    display: flex;
    margin: 1.5rem 0;
    position: relative;

    &[data-align='left'] {
      justify-content: flex-start;
    }

    &[data-align='center'] {
      justify-content: center;
    }

    &[data-align='right'] {
      justify-content: flex-end;
    }
  }

  .ProseMirror .resizable-image-container {
    position: relative;
    display: inline-block;
    max-width: 100%;
    border-radius: 8px;
    overflow: visible;
    transition: all 0.2s ease;

    img {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    &.ProseMirror-selectednode {
      outline: 2px solid var(--accent-color);
      outline-offset: 2px;

      .resize-handle {
        opacity: 1;
        pointer-events: all;
      }

      .image-toolbar {
        opacity: 1;
        pointer-events: all;
      }
    }

    &:hover {
      .resize-handle {
        opacity: 1;
      }

      .image-toolbar {
        opacity: 1;
      }
    }
  }

  .ProseMirror .resize-handle {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border: 2px solid var(--bg-primary);
    border-radius: 50%;
    cursor: nwse-resize;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: scale(1.2);
    }
  }

  .ProseMirror .image-toolbar {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 10;

    [data-theme='dark'] & {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--bg-secondary);
        color: var(--accent-color);
      }

      &[data-action='delete']:hover {
        background: var(--error-bg);
        color: var(--error-color);
      }
    }
  }

  .ProseMirror .resizable-image-wrapper.resizing {
    .resizable-image-container {
      opacity: 0.7;
    }

    img {
      pointer-events: none;
    }
  }
`;

const UploadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  font-size: 14px;
  z-index: 1000;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  animation: pulse 1.5s ease-in-out infinite;
`;

export default RichTextEditor;
