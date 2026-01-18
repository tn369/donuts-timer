import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';

import { TaskList } from './components/TaskList';
import { Controls } from './components/Controls';
import { ResetModal } from './components/ResetModal';
import { DebugControls } from './components/DebugControls';
import { useTaskTimer } from './useTaskTimer';


function App() {
  const {
    tasks,
    selectedTaskId,
    isTaskSelectable,
    selectTask,
    startTimer,
    stopTimer,
    goBack,
    reset,
    setTasks,
  } = useTaskTimer();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 派生状態の計算


  const selectedTask = useMemo(() =>
    tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const isRunning = selectedTask?.status === 'running';

  const canGoBack = useMemo(() => {
    const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId);
    return currentIndex > 0 || selectedTask?.status === 'done';
  }, [tasks, selectedTaskId, selectedTask]);

  const canStartOrStop = useMemo(() => {
    return !(!isRunning && (!selectedTaskId || selectedTask?.status === 'done'));
  }, [isRunning, selectedTaskId, selectedTask]);

  return (
    <div className="app">


      <TaskList
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        isTaskSelectable={isTaskSelectable}
        onSelectTask={selectTask}
      />

      <Controls
        isRunning={isRunning}
        onBack={goBack}
        onStart={startTimer}
        onStop={stopTimer}
        onReset={() => setShowResetConfirm(true)}
        canGoBack={canGoBack}
        canStartOrStop={canStartOrStop}
      />

      <AnimatePresence>
        {showResetConfirm && (
          <ResetModal
            onCancel={() => setShowResetConfirm(false)}
            onConfirm={() => {
              reset();
              setShowResetConfirm(false);
            }}
          />
        )}
      </AnimatePresence>

      <DebugControls
        selectedTaskId={selectedTaskId}
        tasks={tasks}
        setTasks={setTasks}
      />
    </div>
  );
}

export default App;
