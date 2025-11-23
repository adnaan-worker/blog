import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MiniPlayer from './mini-player';
import ExpandedPlayer from './expanded-player';

const NavBarPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 在移动端禁用点击外部关闭，因为使用了 Portal，且会有遮罩层处理关闭
  useClickOutside(
    containerRef,
    () => {
      if (!isMobile) {
        setIsExpanded(false);
      }
    },
    isExpanded,
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <MiniPlayer
        onClick={(e?: React.MouseEvent) => {
          e?.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      />

      <AnimatePresence>{isExpanded && <ExpandedPlayer onClose={() => setIsExpanded(false)} />}</AnimatePresence>
    </div>
  );
};

export default NavBarPlayer;
