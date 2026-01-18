import { useState, useEffect } from 'react';
import type { Task } from './types';
import './App.css';
import { INITIAL_TASKS, BASE_PLAY_SECONDS } from './constants';
import { ProgressBar } from './components/ProgressBar';
import { TaskList } from './components/TaskList';
import { Controls } from './components/Controls';
import { ResetModal } from './components/ResetModal';
import { DebugControls } from './components/DebugControls';

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(INITIAL_TASKS[0].id);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // タイマー処理（1秒ごと）
  useEffect(() => {
    if (!isTimerRunning || !selectedTaskId) {
      return;
    }

    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const currentIndex = prevTasks.findIndex((t) => t.id === selectedTaskId);
        if (currentIndex === -1) return prevTasks;

        const task = prevTasks[currentIndex];
        if (task.status !== 'running') return prevTasks;

        const newElapsed = task.elapsedSeconds + 1;

        // すべてのタスクについて経過時間を更新
        let updatedTasks = prevTasks.map((t) =>
          t.id === selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
        );

        // 固定タスクが予定時間を超過している場合、あそび時間をリアルタイムで減らす
        if (task.kind === 'fixed' || task.kind === 'variable') {
          let totalDelta = 0;
          updatedTasks.forEach((t) => {
            if (t.kind === 'fixed') {
              if (t.status === 'done') {
                totalDelta += t.plannedSeconds - t.actualSeconds;
              } else if (t.status === 'running' || t.status === 'paused') {
                // 超過分を計算
                if (t.elapsedSeconds > t.plannedSeconds) {
                  totalDelta += t.plannedSeconds - t.elapsedSeconds;
                }
              }
            }
          });

          const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
          updatedTasks = updatedTasks.map((t) =>
            t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
          );
        }

        return updatedTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, selectedTaskId]);

  const isTaskSelectable = (taskId: string): boolean => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return false;
    if (taskIndex === 0) return true;
    const previousTask = tasks[taskIndex - 1];
    return previousTask.status === 'done';
  };

  const handleSelectTask = (taskId: string) => {
    if (!isTaskSelectable(taskId)) return;

    setTasks((prevTasks) => {
      const currentIndex = prevTasks.findIndex((t) => t.id === selectedTaskId);
      const isCurrentTapped = taskId === selectedTaskId;

      let updatedTasks = [...prevTasks];
      let nextTaskIdToSelect: string | null = null;

      if (currentIndex !== -1) {
        const currentTask = updatedTasks[currentIndex];
        if (currentTask.status === 'done' && isCurrentTapped) {
          return prevTasks;
        }

        if (currentTask.status === 'running' || currentTask.status === 'paused') {
          updatedTasks[currentIndex] = {
            ...currentTask,
            status: 'done' as const,
            actualSeconds: currentTask.elapsedSeconds,
          };

          if (isCurrentTapped) {
            const nextTask = prevTasks[currentIndex + 1];
            if (nextTask) {
              nextTaskIdToSelect = nextTask.id;
            }
          } else {
            nextTaskIdToSelect = taskId;
          }
        } else {
          nextTaskIdToSelect = taskId;
        }
      } else {
        nextTaskIdToSelect = taskId;
      }

      let totalDelta = 0;
      updatedTasks.forEach((t) => {
        if (t.kind === 'fixed') {
          if (t.status === 'done') {
            totalDelta += t.plannedSeconds - t.actualSeconds;
          } else if (t.status === 'running' || t.status === 'paused') {
            if (t.elapsedSeconds > t.plannedSeconds) {
              totalDelta += t.plannedSeconds - t.elapsedSeconds;
            }
          }
        }
      });
      const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
      updatedTasks = updatedTasks.map((t) =>
        t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
      );

      if (nextTaskIdToSelect) {
        if (isTimerRunning) {
          updatedTasks = updatedTasks.map((t) =>
            t.id === nextTaskIdToSelect ? { ...t, status: 'running' as const } : t
          );
        }
        setTimeout(() => {
          if (nextTaskIdToSelect) setSelectedTaskId(nextTaskIdToSelect);
        }, 0);
      } else if (isCurrentTapped) {
        setTimeout(() => setIsTimerRunning(false), 0);
      }

      return updatedTasks;
    });
  };

  const handleBack = () => {
    const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId);
    if (currentIndex === -1) return;

    const currentTask = tasks[currentIndex];

    setTasks((prevTasks) => {
      let updatedTasks = [...prevTasks];
      let newSelectedTaskId = selectedTaskId;

      if (currentTask.status === 'done') {
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      } else {
        if (currentIndex <= 0) return prevTasks;

        const prevTaskIndex = currentIndex - 1;
        newSelectedTaskId = prevTasks[prevTaskIndex].id;

        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: 'todo' as const,
        };

        updatedTasks[prevTaskIndex] = {
          ...updatedTasks[prevTaskIndex],
          status: isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      }

      let totalDelta = 0;
      updatedTasks.forEach((t) => {
        if (t.kind === 'fixed') {
          if (t.status === 'done') {
            totalDelta += t.plannedSeconds - t.actualSeconds;
          } else if (t.status === 'running' || t.status === 'paused') {
            if (t.elapsedSeconds > t.plannedSeconds) {
              totalDelta += t.plannedSeconds - t.elapsedSeconds;
            }
          }
        }
      });
      const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
      updatedTasks = updatedTasks.map((t) =>
        t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
      );

      if (newSelectedTaskId !== selectedTaskId) {
        setTimeout(() => setSelectedTaskId(newSelectedTaskId), 0);
      }

      return updatedTasks;
    });
  };

  const handleStart = () => {
    if (!selectedTaskId) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === selectedTaskId && task.status !== 'done') {
          return { ...task, status: 'running' };
        }
        return task;
      })
    );
    setIsTimerRunning(true);
  };

  const handleStop = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.status === 'running' ? { ...task, status: 'paused' } : task
      )
    );
    setIsTimerRunning(false);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    const resetTasks = INITIAL_TASKS.map((task) => ({
      ...task,
      elapsedSeconds: 0,
      actualSeconds: 0,
      status: 'todo' as const,
    }));
    setTasks(resetTasks);
    setSelectedTaskId(INITIAL_TASKS[0].id);
    setIsTimerRunning(false);
    setShowResetConfirm(false);
  };

  const calculateOverallProgress = (): number => {
    const totalPlanned = tasks.reduce((sum, task) => sum + task.plannedSeconds, 0);
    let completedSeconds = 0;
    tasks.forEach((task) => {
      if (task.status === 'done') {
        completedSeconds += task.actualSeconds;
      } else if (task.status === 'running' || task.status === 'paused') {
        completedSeconds += task.elapsedSeconds;
      }
    });

    return totalPlanned > 0 ? (completedSeconds / totalPlanned) * 100 : 0;
  };

  const progress = calculateOverallProgress();
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const isRunning = selectedTask?.status === 'running';
  const canGoBack = tasks.findIndex((t) => t.id === selectedTaskId) > 0 || selectedTask?.status === 'done';
  const canStartOrStop = !(!isRunning && (!selectedTaskId || selectedTask?.status === 'done'));

  return (
    <div className="app">
      <ProgressBar progress={progress} />

      <TaskList
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        isTaskSelectable={isTaskSelectable}
        onSelectTask={handleSelectTask}
      />

      <Controls
        isRunning={isRunning}
        onBack={handleBack}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleResetClick}
        canGoBack={canGoBack}
        canStartOrStop={canStartOrStop}
      />

      {showResetConfirm && (
        <ResetModal
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={executeReset}
        />
      )}

      <DebugControls
        selectedTaskId={selectedTaskId}
        tasks={tasks}
        setTasks={setTasks}
      />
    </div>
  );
}

export default App;
