import { useState, useCallback } from 'react';
import { API } from '@/utils';

export type TaskType = 'generate_title' | 'generate_summary';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AITask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface UseAITasksReturn {
  tasks: AITask[];
  pendingTasks: AITask[];
  completedTasks: AITask[];
  createTask: (type: TaskType, params: any) => Promise<string>;
  cancelTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompleted: () => void;
}

export const useAITasks = (): UseAITasksReturn => {
  const [tasks, setTasks] = useState<AITask[]>([]);

  // 创建任务
  const createTask = useCallback(async (type: TaskType, params: any): Promise<string> => {
    const taskId = `${type}_${Date.now()}`;

    const newTask: AITask = {
      id: taskId,
      type,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);

    try {
      let response: any;

      // 根据任务类型调用不同的 API（返回jobId）
      switch (type) {
        case 'generate_title':
          response = await API.ai.generateTitle(params);
          break;
        case 'generate_summary':
          response = await API.ai.generateSummary(params);
          break;
        default:
          throw new Error('未知的任务类型');
      }

      const jobId = response.data.jobId;

      // 开始轮询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await API.ai.getTaskStatus(jobId);
          const { status, result, progress } = statusResponse.data;

          // 更新进度
          setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, progress: progress || 0 } : task)));

          // 任务完成
          if (status === 'completed') {
            clearInterval(pollInterval);
            setTasks((prev) =>
              prev.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status: 'completed' as TaskStatus,
                      progress: 100,
                      result,
                      completedAt: new Date(),
                    }
                  : task,
              ),
            );
          }

          // 任务失败
          if (status === 'failed') {
            clearInterval(pollInterval);
            setTasks((prev) =>
              prev.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status: 'failed' as TaskStatus,
                      error: '任务执行失败',
                      completedAt: new Date(),
                    }
                  : task,
              ),
            );
          }
        } catch (pollError: any) {
          console.error('轮询错误:', pollError);
        }
      }, 2000); // 每2秒轮询一次

      // 60秒后停止轮询（超时保护）
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 60000);

      return taskId;
    } catch (error: any) {
      // 更新任务状态为失败
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: 'failed' as TaskStatus,
                error: error.message || '任务创建失败',
                completedAt: new Date(),
              }
            : task,
        ),
      );
      throw error;
    }
  }, []);

  // 取消任务
  const cancelTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId && task.status === 'processing'
          ? { ...task, status: 'failed' as TaskStatus, error: '已取消' }
          : task,
      ),
    );
  }, []);

  // 删除任务
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  // 清空已完成的任务
  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
  }, []);

  // 计算派生状态
  const pendingTasks = tasks.filter((task) => task.status === 'processing');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  return {
    tasks,
    pendingTasks,
    completedTasks,
    createTask,
    cancelTask,
    deleteTask,
    clearCompleted,
  };
};

export default useAITasks;
