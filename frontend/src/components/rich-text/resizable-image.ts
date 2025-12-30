import { Node, mergeAttributes } from '@tiptap/core';

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  minWidth: number;
  maxWidth: number;
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
      minWidth: 100,
      maxWidth: 1200,
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
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width;
          return width ? parseInt(width) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width, style: `width: ${attributes.width}px` };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height;
          return height ? parseInt(height) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height, style: `height: ${attributes.height}px` };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    if (attrs.width) attrs.style = `width: ${attrs.width}px; ${attrs.style || ''}`;
    if (attrs.height) attrs.style = `height: ${attrs.height}px; ${attrs.style || ''}`;
    return ['img', attrs];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const { minWidth, maxWidth } = this.options;

      // 创建 DOM 结构
      const dom = document.createElement('div');
      dom.className = 'resizable-image-wrapper';
      dom.setAttribute('data-align', node.attrs.align || 'center');

      const container = document.createElement('div');
      container.className = 'resizable-image-container';
      container.contentEditable = 'false';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
      if (node.attrs.height) img.style.height = `${node.attrs.height}px`;

      // 创建四个角的拖拽手柄
      const handles = ['nw', 'ne', 'sw', 'se'].map((pos) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${pos}`;
        handle.setAttribute('data-position', pos);
        return handle;
      });

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

      container.appendChild(img);
      container.appendChild(toolbar);
      handles.forEach((h) => container.appendChild(h));
      dom.appendChild(container);

      // 拖拽状态
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let aspectRatio = 1;
      let currentHandle = '';

      const startResize = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        currentHandle = target.getAttribute('data-position') || 'se';

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        aspectRatio = startWidth / startHeight;
        isResizing = true;

        img.style.transition = 'none';
        dom.classList.add('resizing');
        document.body.style.cursor = getCursor(currentHandle);
        document.body.style.userSelect = 'none';

        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', onResize, { passive: false });
        document.addEventListener('touchend', stopResize);
      };

      const getCursor = (pos: string) => {
        const cursors: Record<string, string> = {
          nw: 'nwse-resize',
          ne: 'nesw-resize',
          sw: 'nesw-resize',
          se: 'nwse-resize',
        };
        return cursors[pos] || 'nwse-resize';
      };

      const onResize = (e: MouseEvent | TouchEvent) => {
        if (!isResizing) return;
        e.preventDefault();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        let deltaX = clientX - startX;
        let deltaY = clientY - startY;

        // 根据手柄位置调整方向
        if (currentHandle.includes('w')) deltaX = -deltaX;
        if (currentHandle.includes('n')) deltaY = -deltaY;

        // 使用较大的变化量，保持宽高比
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
        let newWidth = Math.round(startWidth + delta);
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        const newHeight = Math.round(newWidth / aspectRatio);

        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      };

      const stopResize = () => {
        if (!isResizing) return;
        isResizing = false;

        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', onResize);
        document.removeEventListener('touchend', stopResize);

        dom.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        img.style.transition = '';

        // 更新节点属性
        const pos = getPos();
        if (typeof pos === 'number') {
          const finalWidth = Math.round(parseFloat(img.style.width));
          const finalHeight = Math.round(parseFloat(img.style.height));

          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width: finalWidth,
              height: finalHeight,
            }),
          );
        }
      };

      // 绑定事件
      handles.forEach((handle) => {
        handle.addEventListener('mousedown', startResize);
        handle.addEventListener('touchstart', startResize, { passive: false });
      });

      // 工具栏事件
      toolbar.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.toolbar-btn') as HTMLElement;
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const pos = getPos();
        if (typeof pos !== 'number') return;

        switch (action) {
          case 'align-left':
          case 'align-center':
          case 'align-right':
            const align = action.replace('align-', '');
            editor.commands.updateAttributes('resizableImage', { align });
            dom.setAttribute('data-align', align);
            break;
          case 'delete':
            editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
            break;
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;

          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt;
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title;
          if (updatedNode.attrs.width) img.style.width = `${updatedNode.attrs.width}px`;
          if (updatedNode.attrs.height) img.style.height = `${updatedNode.attrs.height}px`;
          dom.setAttribute('data-align', updatedNode.attrs.align || 'center');

          return true;
        },
        destroy: () => {
          handles.forEach((handle) => {
            handle.removeEventListener('mousedown', startResize);
            handle.removeEventListener('touchstart', startResize);
          });
          document.removeEventListener('mousemove', onResize);
          document.removeEventListener('mouseup', stopResize);
          document.removeEventListener('touchmove', onResize);
          document.removeEventListener('touchend', stopResize);
          document.body.style.cursor = '';
        },
      };
    };
  },
});
