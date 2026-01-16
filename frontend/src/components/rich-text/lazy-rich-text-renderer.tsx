import React, { useMemo, useState, useEffect, useRef, memo } from 'react';
import styled from '@emotion/styled';
import RichTextRenderer from './rich-text-renderer';
import { throttle } from '@/utils';

/**
 * 懒加载富文本渲染器
 * 用于优化长文章的渲染性能
 *
 * 优化策略：
 * 1. 分块渲染：避免一次性渲染大量内容
 * 2. 智能滚动恢复：刷新时自动加载足够的内容
 * 3. 内存优化：及时清理事件监听和定时器
 * 4. 防闭包陷阱：使用 ref 追踪最新状态
 * 5. 独立块渲染：每个块独立渲染，避免图片重复加载
 */

interface LazyRichTextRendererProps {
  content: string;
  mode?: 'article' | 'note' | 'comment';
  enableCodeHighlight?: boolean; // 是否启用代码高亮
  enableImagePreview?: boolean; // 是否启用图片预览
  enableTableOfContents?: boolean; // 是否启用目录
  className?: string;
  chunkSize?: number; // 每块内容的最大字符数
}

// 单个内容块渲染器 - 使用 memo 优化
const ChunkRenderer = memo<{
  content: string;
  mode: 'article' | 'note' | 'comment';
  enableCodeHighlight: boolean;
  enableImagePreview: boolean;
  className?: string;
}>(({ content, mode, enableCodeHighlight, enableImagePreview, className }) => {
  return (
    <RichTextRenderer
      content={content}
      mode={mode}
      enableCodeHighlight={enableCodeHighlight}
      enableImagePreview={enableImagePreview}
      enableTableOfContents={false}
      className={className}
    />
  );
});

ChunkRenderer.displayName = 'ChunkRenderer';

// 加载提示容器
const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

// 加载提示卡片
const LoadingCard = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

// 容器 - 确保全宽布局
const Container = styled.div`
  width: 100%;
`;

// 获取当前页面的滚动位置缓存 key
const getScrollKey = () => `scroll-${window.location.pathname}`;

const LazyRichTextRenderer: React.FC<LazyRichTextRendererProps> = ({
  content,
  mode = 'article',
  enableCodeHighlight = true,
  enableImagePreview = true,
  enableTableOfContents = false,
  className,
  chunkSize = 5000,
}) => {
  // 根据保存的滚动位置智能决定初始块数
  const initialChunks = useMemo(() => {
    const savedPos = sessionStorage.getItem(getScrollKey());
    const scrollY = savedPos ? parseFloat(savedPos) : 0;
    return scrollY > 1000 ? 3 : 1;
  }, []);

  const [renderedChunks, setRenderedChunks] = useState(initialChunks);
  const isRenderingRef = useRef(false);
  const timerIdRef = useRef<number>(0);
  const renderedChunksRef = useRef(initialChunks);
  const rafIdRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 智能分块：保持 HTML 结构完整性，特别处理内联图片
  const chunks = useMemo(() => {
    if (!content || content.length <= chunkSize) {
      return [content];
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const elements = Array.from(doc.body.childNodes);
      const result: string[] = [];
      let currentChunk = '';
      let inlineImageGroup: string[] = []; // 收集连续的内联图片段落

      // 检查元素是否包含内联图片
      const hasInlineImage = (el: Node): boolean => {
        if (!(el instanceof Element)) return false;
        return el.querySelector('img[data-display="inline"]') !== null;
      };

      // 刷新内联图片组到当前块
      const flushInlineGroup = () => {
        if (inlineImageGroup.length > 0) {
          // 将所有内联图片段落合并到一个容器中，确保它们在同一块
          const groupHtml = inlineImageGroup.join('');
          if (currentChunk.length > 0 && currentChunk.length + groupHtml.length > chunkSize) {
            result.push(currentChunk);
            currentChunk = groupHtml;
          } else {
            currentChunk += groupHtml;
          }
          inlineImageGroup = [];
        }
      };

      for (const element of elements) {
        const html = element instanceof Element ? element.outerHTML : element.textContent || '';

        // 如果是包含内联图片的元素，收集到组中
        if (hasInlineImage(element)) {
          inlineImageGroup.push(html);
          continue;
        }

        // 遇到非内联图片元素时，先刷新之前的内联图片组
        flushInlineGroup();

        // 超过限制且当前块不为空时，开始新块
        if (currentChunk.length > 0 && currentChunk.length + html.length > chunkSize) {
          result.push(currentChunk);
          currentChunk = html;
        } else {
          currentChunk += html;
        }
      }

      // 处理剩余的内联图片组
      flushInlineGroup();

      if (currentChunk) result.push(currentChunk);
      return result.length > 0 ? result : [content];
    } catch (error) {
      console.warn('内容分块失败，使用原始内容:', error);
      return [content];
    }
  }, [content, chunkSize]);

  // 保存滚动位置（防抖优化）
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const scrollKey = getScrollKey();

    const saveScrollPosition = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      }, 300);
    };

    const handleUnload = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener('scroll', saveScrollPosition);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // 智能滚动恢复：确保有足够内容支持滚动位置
  useEffect(() => {
    const savedPos = sessionStorage.getItem(getScrollKey());
    if (!savedPos || parseFloat(savedPos) <= 1000) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    // 使用 requestAnimationFrame 避免强制重排
    const rafId = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        // 在下一个动画帧中读取布局属性，避免强制重排
        requestAnimationFrame(() => {
          const { scrollHeight } = document.documentElement;
          const targetPos = parseFloat(savedPos);

          if (scrollHeight < targetPos + 1000 && renderedChunksRef.current < chunks.length) {
            setRenderedChunks((prev) => Math.min(prev + 2, chunks.length));
          }
        });
      }, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
    };
  }, [chunks.length]);

  // 同步 state 到 ref，避免闭包陷阱
  useEffect(() => {
    renderedChunksRef.current = renderedChunks;
  }, [renderedChunks]);

  // 创建 IntersectionObserver 来检测加载触发器（不触发重排）
  useEffect(() => {
    if (renderedChunks >= chunks.length) {
      // 已全部加载，清理观察器
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // 清理旧的观察器
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 等待 DOM 更新后再创建观察器
    const timer = setTimeout(() => {
      const sentinel = document.querySelector('[data-lazy-sentinel]') as HTMLElement;
      if (!sentinel || renderedChunksRef.current >= chunks.length) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !isRenderingRef.current) {
            const currentRendered = renderedChunksRef.current;
            const totalChunks = chunks.length;

            if (currentRendered < totalChunks) {
              isRenderingRef.current = true;
              setRenderedChunks((prev) => {
                const next = Math.min(prev + 1, totalChunks);
                isRenderingRef.current = false;
                return next;
              });
            }
          }
        },
        {
          rootMargin: '400px', // 提前 400px 开始加载
          threshold: 0.01,
        },
      );

      observerRef.current.observe(sentinel);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [renderedChunks, chunks.length]);

  // 懒加载：使用优化的滚动监听作为备用方案
  useEffect(() => {
    // 初始化时重置渲染标志
    isRenderingRef.current = false;
    timerIdRef.current = 0;
    rafIdRef.current = 0;

    // 使用 requestAnimationFrame 包装布局读取，避免强制重排
    const checkAndLoadNext = () => {
      const currentRendered = renderedChunksRef.current;
      const totalChunks = chunks.length;

      // 已全部加载或正在渲染中，跳过
      if (isRenderingRef.current || currentRendered >= totalChunks) {
        return;
      }

      // 在 requestAnimationFrame 中读取布局属性，避免强制重排
      rafIdRef.current = requestAnimationFrame(() => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

        // 距离底部 2 屏时触发加载（备用方案，主要用于初始加载）
        if (distanceToBottom < clientHeight * 2) {
          isRenderingRef.current = true;

          const renderNext = () => {
            setRenderedChunks((prev) => Math.min(prev + 1, chunks.length));
            isRenderingRef.current = false;
            timerIdRef.current = 0;
          };

          // 使用 setTimeout 延迟渲染，避免阻塞主线程
          timerIdRef.current = setTimeout(renderNext, 50) as unknown as number;
        }
      });
    };

    // 使用节流函数限制检查频率（200ms 节流），主要作为备用方案
    // IntersectionObserver 是主要检测方式，不会触发重排
    const throttledCheck = throttle(() => {
      cancelAnimationFrame(rafIdRef.current);
      checkAndLoadNext();
    }, 200);

    // 初始检查
    requestAnimationFrame(checkAndLoadNext);

    // 备用方案：使用节流的滚动监听（IntersectionObserver 失效时使用）
    window.addEventListener('scroll', throttledCheck, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledCheck);
      cancelAnimationFrame(rafIdRef.current);

      // 清理未完成的异步任务
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = 0;
      }

      // 重置渲染标志
      isRenderingRef.current = false;
    };
  }, [chunks.length]);

  // 是否还有更多内容
  const hasMore = renderedChunks < chunks.length;

  return (
    <Container>
      {/* 分块独立渲染，避免重复渲染已加载的内容 */}
      {chunks.slice(0, renderedChunks).map((chunk, index) => (
        <ChunkRenderer
          key={index}
          content={chunk}
          mode={mode}
          enableCodeHighlight={enableCodeHighlight}
          enableImagePreview={enableImagePreview}
          className={className}
        />
      ))}

      {hasMore && (
        <>
          {/* IntersectionObserver 触发器 */}
          <div
            data-lazy-sentinel
            style={{
              height: '1px',
              width: '100%',
              pointerEvents: 'none',
              visibility: 'hidden',
            }}
            aria-hidden="true"
          />
          <LoadingContainer>
            <LoadingCard>
              正在加载更多内容... ({renderedChunks}/{chunks.length})
            </LoadingCard>
          </LoadingContainer>
        </>
      )}
    </Container>
  );
};

export default LazyRichTextRenderer;
