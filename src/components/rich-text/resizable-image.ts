import { Node, mergeAttributes } from '@tiptap/core';

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: { src: string; alt?: string; title?: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width;
          return width ? parseInt(width) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height;
          return height ? parseInt(height) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px`,
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => {
          return element.getAttribute('data-align') || 'center';
        },
        renderHTML: (attributes) => {
          return {
            'data-align': attributes.align,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);

    // 确保宽高属性正确渲染
    if (attrs.width) {
      attrs.style = `width: ${attrs.width}px; ${attrs.style || ''}`;
    }
    if (attrs.height) {
      attrs.style = `height: ${attrs.height}px; ${attrs.style || ''}`;
    }

    return ['img', attrs];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'resizable-image-wrapper';
      dom.setAttribute('data-align', node.attrs.align || 'center');

      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
      if (node.attrs.height) img.style.height = `${node.attrs.height}px`;

      // 图片容器
      const container = document.createElement('div');
      container.className = 'resizable-image-container';
      container.contentEditable = 'false';
      container.appendChild(img);

      // 调整大小的手柄
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';

      // 工具栏
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.innerHTML = `
        <button class="toolbar-btn" data-action="align-left" title="左对齐">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" data-action="align-center" title="居中">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="10" x2="6" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="18" y1="18" x2="6" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" data-action="align-right" title="右对齐">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="7" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" data-action="delete" title="删除">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      container.appendChild(toolbar);
      container.appendChild(resizeHandle);
      dom.appendChild(container);

      // 调整大小逻辑
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let aspectRatio = 1;
      let rafId: number | null = null; // requestAnimationFrame ID
      let currentMouseX = 0;
      let currentMouseY = 0;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        aspectRatio = startWidth / startHeight;

        // 临时移除最大宽度限制和 transition
        img.style.maxWidth = 'none';
        img.style.transition = 'none';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        dom.classList.add('resizing');
        document.body.style.cursor = 'nwse-resize'; // 设置全局鼠标样式
      };

      const updateSize = () => {
        const deltaX = currentMouseX - startX;
        const deltaY = currentMouseY - startY;

        // 使用对角线距离来计算新尺寸
        const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * Math.sign(deltaX);
        const newWidth = Math.max(100, Math.min(startWidth + delta, 1200)); // 限制最大宽度
        const newHeight = newWidth / aspectRatio;

        // 直接设置 DOM，非常快
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;

        rafId = null; // 重置 RAF ID
      };

      const onMouseMove = (e: MouseEvent) => {
        e.preventDefault();

        // 保存当前鼠标位置
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;

        // 使用 requestAnimationFrame 节流，确保最流畅的渲染
        if (rafId === null) {
          rafId = requestAnimationFrame(updateSize);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // 取消可能待执行的 RAF
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        dom.classList.remove('resizing');
        document.body.style.cursor = ''; // 恢复鼠标样式

        // 恢复样式
        img.style.maxWidth = '100%';
        img.style.transition = '';

        // 更新节点属性到 Tiptap
        const pos = getPos();

        if (typeof pos === 'number') {
          const finalWidth = Math.round(parseFloat(img.style.width));
          const finalHeight = Math.round(parseFloat(img.style.height));

          // 使用底层 Transaction API 直接更新节点属性
          const { state, view } = editor;
          const { tr } = state;

          // 设置新的节点属性
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            width: finalWidth,
            height: finalHeight,
          });

          // 应用 transaction
          view.dispatch(tr);
        }
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);

      // 工具栏按钮事件
      toolbar.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.toolbar-btn') as HTMLElement;
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const pos = getPos();
        if (typeof pos !== 'number') return;

        switch (action) {
          case 'align-left':
            editor.commands.updateAttributes('resizableImage', { align: 'left' });
            dom.setAttribute('data-align', 'left');
            break;
          case 'align-center':
            editor.commands.updateAttributes('resizableImage', { align: 'center' });
            dom.setAttribute('data-align', 'center');
            break;
          case 'align-right':
            editor.commands.updateAttributes('resizableImage', { align: 'right' });
            dom.setAttribute('data-align', 'right');
            break;
          case 'delete':
            editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
            break;
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }

          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt;
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title;
          if (updatedNode.attrs.width) img.style.width = `${updatedNode.attrs.width}px`;
          if (updatedNode.attrs.height) img.style.height = `${updatedNode.attrs.height}px`;
          dom.setAttribute('data-align', updatedNode.attrs.align || 'center');

          return true;
        },
        destroy: () => {
          resizeHandle.removeEventListener('mousedown', onMouseDown);
        },
      };
    };
  },
});
