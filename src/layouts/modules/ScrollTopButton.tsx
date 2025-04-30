import React from 'react';
import styled from '@emotion/styled';

const ScrollTopButton = styled.button<{ visible: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;

  /* 使用纯CSS过渡代替Framer Motion动画 */
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 0.3s ease;

  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: ${(props) => (props.visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)')};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};

  &:hover {
    transform: ${(props) => (props.visible ? 'translateY(-3px)' : 'translateY(20px) scale(0.8)')};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: var(--accent-color-hover, #4a76e8);
  }

  &:active {
    transform: ${(props) => (props.visible ? 'scale(0.95)' : 'translateY(20px) scale(0.8)')};
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

interface ScrollTopButtonProps {
  visible: boolean;
  onClick: () => void;
}

const ScrollTopButtonComponent: React.FC<ScrollTopButtonProps> = ({ visible, onClick }) => {
  return (
    <ScrollTopButton visible={visible} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </ScrollTopButton>
  );
};

export default ScrollTopButtonComponent; 