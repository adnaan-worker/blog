import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

// Tabs样式
const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TabsHeader = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--border-color);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-primary)')};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-color);
    transform: ${(props) => (props.active ? 'scaleX(1)' : 'scaleX(0)')};
    transition: transform 0.2s ease;
    transform-origin: center;
  }
`;

const TabContent = styled.div`
  padding: 1.25rem 0;
`;

// 组件接口
export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Tabs组件
export const Tabs: React.FC<TabsProps> = ({ items, defaultActiveKey, onChange, className, style }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || (items.length > 0 ? items[0].key : ''));

  useEffect(() => {
    if (defaultActiveKey && defaultActiveKey !== activeKey) {
      setActiveKey(defaultActiveKey);
    }
  }, [defaultActiveKey]);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    if (onChange) {
      onChange(key);
    }
  };

  const activeTab = items.find((item) => item.key === activeKey);

  return (
    <TabsContainer className={className} style={style}>
      <TabsHeader>
        {items.map((item) => (
          <TabItem
            key={item.key}
            active={item.key === activeKey}
            onClick={() => !item.disabled && handleTabClick(item.key)}
            disabled={item.disabled}
            style={{ opacity: item.disabled ? 0.5 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer' }}
          >
            {item.label}
          </TabItem>
        ))}
      </TabsHeader>

      <TabContent>{activeTab && activeTab.content}</TabContent>
    </TabsContainer>
  );
};

export default Tabs;
