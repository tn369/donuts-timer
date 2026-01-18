import { useState, useEffect } from 'react';
import type { Task } from './types';
import './App.css';

/**
 * 初期タスクデータ
 * 固定タスク: トイレ(5分)、おきがえ(10分)、ごはん(20分)
 * 変動タスク: あそび(15分) ※固定タスクの差分で増減
 */
const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: '🚽',
    plannedSeconds: 5 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'おきがえ',
    icon: '👕',
    plannedSeconds: 10 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: '🍚',
    plannedSeconds: 20 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそび',
    icon: '🧸',
    plannedSeconds: 15 * 60,
    kind: 'variable',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
];

const BASE_PLAY_SECONDS = 15 * 60; // あそびの基本時間（15分）

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(INITIAL_TASKS[0].id);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false); // 全体のタイマー実行状態

  // タイマー処理（1秒ごと）
  useEffect(() => {
    // 全体のタイマーが停止中または選択中タスクがない場合は何もしない
    if (!isTimerRunning || !selectedTaskId) {
      return;
    }

    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const currentIndex = prevTasks.findIndex((t) => t.id === selectedTaskId);
        if (currentIndex === -1) return prevTasks;

        const task = prevTasks[currentIndex];
        // 万が一実行中でないタスクが選択されている場合は何もしない
        if (task.status !== 'running') return prevTasks;

        const newElapsed = task.elapsedSeconds + 1;

        // まだ時間が残っている場合：経過時間を進めるだけ
        if (newElapsed < task.plannedSeconds) {
          return prevTasks.map((t) =>
            t.id === selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
          );
        }

        // --- タスク完了時の処理 ---
        // 1. 現在のタスクを完了状態にする
        const completedTask: Task = {
          ...task,
          elapsedSeconds: newElapsed,
          actualSeconds: newElapsed,
          status: 'done' as const,
        };

        let updatedTasks = prevTasks.map((t, idx) => (idx === currentIndex ? completedTask : t));

        // 2. 固定タスクが完了した場合、あそび時間を再計算
        if (task.kind === 'fixed') {
          let totalDelta = 0;
          updatedTasks.forEach((t) => {
            if (t.kind === 'fixed' && t.status === 'done') {
              totalDelta += t.plannedSeconds - t.actualSeconds;
            }
          });
          const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
          updatedTasks = updatedTasks.map((t) =>
            t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
          );
        }

        // 3. 次のタスクがあれば自動開始、なければタイマー停止
        const nextTask = prevTasks[currentIndex + 1];
        if (nextTask) {
          // 次のタスクを running にし、選択状態も更新する
          updatedTasks = updatedTasks.map((t) =>
            t.id === nextTask.id ? { ...t, status: 'running' as const } : t
          );
          setTimeout(() => setSelectedTaskId(nextTask.id), 0);
        } else {
          // 全てのタスクが完了
          setTimeout(() => {
            setIsTimerRunning(false);
          }, 0);
        }

        return updatedTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, selectedTaskId]);

  /**
   * タスクが選択可能かどうかをチェック
   * タスクは順序を持ち、前のタスクが完了していない場合は選択できない
   */
  const isTaskSelectable = (taskId: string): boolean => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return false;

    // 最初のタスクは常に選択可能
    if (taskIndex === 0) return true;

    // 前のタスクが完了していれば選択可能
    const previousTask = tasks[taskIndex - 1];
    return previousTask.status === 'done';
  };

  /**
   * タスク選択
   * 進行中のタスクがある状態でタップされた場合、
   * そのタスクを完了し、次のタスクがある場合は選択・（タイマー稼働中なら）開始する。
   */
  const handleSelectTask = (taskId: string) => {
    // 選択不可な場合は何もしない
    if (!isTaskSelectable(taskId)) {
      return;
    }

    setTasks((prevTasks) => {
      const currentIndex = prevTasks.findIndex((t) => t.id === selectedTaskId);
      const isCurrentTapped = taskId === selectedTaskId;

      let updatedTasks = [...prevTasks];
      let nextTaskIdToSelect: string | null = null;

      // 1. タップされたタスク、または現在のタスクを完了状態にする
      if (currentIndex !== -1) {
        const currentTask = updatedTasks[currentIndex];
        // すでに完了しているタスクをタップした場合は何もしない
        if (currentTask.status === 'done' && isCurrentTapped) {
          return prevTasks;
        }

        if (currentTask.status === 'running' || currentTask.status === 'paused') {
          updatedTasks[currentIndex] = {
            ...currentTask,
            status: 'done' as const,
            actualSeconds: currentTask.elapsedSeconds,
          };

          // 現在のタスクが完了した場合、自動的に次のタスクを決定する
          if (isCurrentTapped) {
            const nextTask = prevTasks[currentIndex + 1];
            if (nextTask) {
              nextTaskIdToSelect = nextTask.id;
            }
          } else {
            // 別のタスクがタップされた場合はそのタスクを選択
            nextTaskIdToSelect = taskId;
          }
        } else {
          // 現在のタスクが todo 状態で別のタスクがタップされた場合
          nextTaskIdToSelect = taskId;
        }
      } else {
        nextTaskIdToSelect = taskId;
      }

      // 2. あそび時間の再計算
      let totalDelta = 0;
      updatedTasks.forEach((t) => {
        if (t.kind === 'fixed' && t.status === 'done') {
          totalDelta += t.plannedSeconds - t.actualSeconds;
        }
      });
      const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
      updatedTasks = updatedTasks.map((t) =>
        t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
      );

      // 3. 次のタスクを選択状態にし、必要なら開始する
      if (nextTaskIdToSelect) {
        if (isTimerRunning) {
          updatedTasks = updatedTasks.map((t) =>
            t.id === nextTaskIdToSelect ? { ...t, status: 'running' as const } : t
          );
        }
        // State 更新の中で State 更新（setSelectedTaskId）を呼べないため
        // この後の setSelectedTaskId 呼び出しのために ID を保持
        setTimeout(() => {
          if (nextTaskIdToSelect) setSelectedTaskId(nextTaskIdToSelect);
        }, 0);
      } else if (isCurrentTapped) {
        // 次のタスクがない（全完了）
        setTimeout(() => setIsTimerRunning(false), 0);
      }

      return updatedTasks;
    });
  };

  /**
   * ひとつ前のタスクに戻る
   */
  const handleBack = () => {
    const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId);
    if (currentIndex === -1) return;

    const currentTask = tasks[currentIndex];

    setTasks((prevTasks) => {
      let updatedTasks = [...prevTasks];
      let newSelectedTaskId = selectedTaskId;

      if (currentTask.status === 'done') {
        // 現在のタスクが完了している場合は、そのタスクをやり直す
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      } else {
        // 現在のタスクが未完了なら、前のタスクに戻る
        if (currentIndex <= 0) return prevTasks;

        const prevTaskIndex = currentIndex - 1;
        newSelectedTaskId = prevTasks[prevTaskIndex].id;

        // 現在のタスク（誤って進んでしまった先）を todo に戻す
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: 'todo' as const,
        };

        // 前のタスクを復元する
        updatedTasks[prevTaskIndex] = {
          ...updatedTasks[prevTaskIndex],
          status: isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      }

      // あそび時間の再計算
      let totalDelta = 0;
      updatedTasks.forEach((t) => {
        if (t.kind === 'fixed' && t.status === 'done') {
          totalDelta += t.plannedSeconds - t.actualSeconds;
        }
      });
      const newPlaySeconds = Math.max(0, BASE_PLAY_SECONDS + totalDelta);
      updatedTasks = updatedTasks.map((t) =>
        t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
      );

      // 選択状態の更新
      if (newSelectedTaskId !== selectedTaskId) {
        setTimeout(() => setSelectedTaskId(newSelectedTaskId), 0);
      }

      return updatedTasks;
    });
  };

  /**
   * スタートボタン
   * 選択中タスクを実行状態にする
   */
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

  /**
   * ストップボタン
   * 実行中のタスクを一時停止
   */
  const handleStop = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.status === 'running' ? { ...task, status: 'paused' } : task
      )
    );
    setIsTimerRunning(false);
  };

  /**
   * 全体進捗の計算
   * 進捗 = 完了時間 / 合計予定時間
   * 完了時間 = Σ完了タスクの実績 + 進行中タスクの経過
   */
  const calculateOverallProgress = (): number => {
    // 合計予定時間（変動タスク含む現在の予定）
    const totalPlanned = tasks.reduce((sum, task) => sum + task.plannedSeconds, 0);

    // 完了時間
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

  /**
   * 残り時間の表示フォーマット
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = calculateOverallProgress();
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const isRunning = selectedTask?.status === 'running';

  return (
    <div className="app">
      {/* 全体プログレスバー */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      {/* タスク一覧（横並び、時間比率で幅を可変） */}
      <div className="task-list">
        {tasks.map((task) => {
          const remaining = Math.max(0, task.plannedSeconds - task.elapsedSeconds);
          const isSelected = task.id === selectedTaskId;
          const isDone = task.status === 'done';
          const isSelectable = isTaskSelectable(task.id);

          return (
            <div
              key={task.id}
              className={`task-card ${isSelected ? 'selected' : ''} ${isDone ? 'done' : ''} ${!isSelectable ? 'disabled' : ''}`}
              style={{ flexGrow: task.plannedSeconds / 60 }} // 分単位で比率設定
              onClick={() => isSelectable && handleSelectTask(task.id)}
            >
              <div className="task-icon">{task.icon}</div>
              <div className="task-name">{task.name}</div>
              <div className="task-time">
                {isDone ? '✓' : formatTime(remaining)}
              </div>
              {task.status === 'running' && (
                <div className="task-progress-bar">
                  <div
                    className="task-progress-fill"
                    style={{
                      width: `${(task.elapsedSeconds / task.plannedSeconds) * 100}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* コントロールボタン */}
      <div className="controls">
        <button
          className="btn btn-back"
          onClick={handleBack}
          disabled={tasks.findIndex((t) => t.id === selectedTaskId) === 0 && selectedTask?.status !== 'done'}
        >
          ↩ 戻る
        </button>
        <button
          className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
          onClick={isRunning ? handleStop : handleStart}
          disabled={!isRunning && (!selectedTaskId || selectedTask?.status === 'done')}
        >
          {isRunning ? '⏸ ストップ' : '▶ スタート'}
        </button>
      </div>

      {/* デバッグ用：開発中は早送りボタンを表示（本番では非表示） */}
      {import.meta.env.DEV && selectedTask && selectedTask.status !== 'done' && (
        <div className="debug-controls">
          <button
            className="btn-debug"
            onClick={() => {
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task.id === selectedTaskId
                    ? { ...task, elapsedSeconds: Math.max(0, task.plannedSeconds - 60) }
                    : task
                )
              );
            }}
          >
            ⏩ 残り1分
          </button>
          <button
            className="btn-debug"
            onClick={() => {
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task.id === selectedTaskId
                    ? { ...task, elapsedSeconds: Math.max(0, task.plannedSeconds - 5) }
                    : task
                )
              );
            }}
          >
            ⏩ 残り5秒
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
