import React from 'react';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  increment,
  decrement,
  setValue,
  selectCount,
  selectStatus,
  selectLastUpdated,
} from '../../store/modules/counterSlice';

const CounterContainer = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CounterValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
  margin: 1rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--accent-color-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
`;

const Counter: React.FC = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const status = useAppSelector(selectStatus);
  const lastUpdated = useAppSelector(selectLastUpdated);

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  const handleReset = () => {
    dispatch(setValue(0));
  };

  return (
    <CounterContainer>
      <CounterValue>{count}</CounterValue>
      <ButtonGroup>
        <Button onClick={handleDecrement} disabled={status === 'loading'}>
          减少
        </Button>
        <Button onClick={handleReset} disabled={status === 'loading'}>
          重置
        </Button>
        <Button onClick={handleIncrement} disabled={status === 'loading'}>
          增加
        </Button>
      </ButtonGroup>
      <StatusText>
        {status === 'loading'
          ? '加载中...'
          : lastUpdated
            ? `最后更新: ${new Date(lastUpdated).toLocaleString()}`
            : '准备就绪'}
      </StatusText>
    </CounterContainer>
  );
};

export default Counter;
