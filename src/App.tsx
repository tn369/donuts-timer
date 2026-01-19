import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import './App.css';

import { TaskList } from './components/TaskList';
import { Controls } from './components/Controls';
import { ResetModal } from './components/ResetModal';
import { DebugControls } from './components/DebugControls';
import { TargetTimeSettingsComponent } from './components/TargetTimeSettings';
import { useTaskTimer } from './useTaskTimer';
import type { TargetTimeSettings } from './types';


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
    setTargetTimeSettings,
  } = useTaskTimer();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'settings'>('main');

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

  const handleSettingsChange = (settings: TargetTimeSettings) => {
    setTargetTimeSettings(settings);
  };

  if (currentScreen === 'settings') {
    return (
      <TargetTimeSettingsComponent
        onBack={() => setCurrentScreen('main')}
        onSettingsChange={handleSettingsChange}
      />
    );
  }

  return (
    <div className="app">
      <div className="settings-button-container">
        <button
          onClick={() => setCurrentScreen('settings')}
          className="settings-button"
          title="せってい"
        >
          <Settings size={20} />
        </button>
      </div>

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
