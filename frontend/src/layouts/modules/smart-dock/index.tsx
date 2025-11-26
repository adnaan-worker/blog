import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSmartDock from './mobile-bar';
import DesktopSmartDock from './desktop-stack';

const SmartDock: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileSmartDock /> : <DesktopSmartDock />;
};

export default SmartDock;
