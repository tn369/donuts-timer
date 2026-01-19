import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import './App.css';

import { TaskList } from './components/TaskList';
import { Controls } from './components/Controls';
import { ResetModal } from './components/ResetModal';
import { DebugControls } from './components/DebugControls';
import { TodoListSelection } from './components/TodoListSelection';
import { TodoListSettings } from './components/TodoListSettings';
import { useTaskTimer } from './useTaskTimer';
import type { TodoList, Task } from './types';
import { loadTodoLists, saveTodoLists, loadActiveListId, saveActiveListId } from './storage';
import { v4 as uuid_v4 } from 'uuid';

type CurrentScreen = 'selection' | 'main' | 'settings';

function App() {
  const {
    tasks,
    activeList,
    selectedTaskId,
    isTaskSelectable,
    selectTask,
    startTimer,
    stopTimer,
    goBack,
    reset,
    setTasks,
    initList,
  } = useTaskTimer();

  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('selection');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 初回ロード
  useEffect(() => {
    const loadedLists = loadTodoLists();
    setTodoLists(loadedLists);

    const activeId = loadActiveListId();
    if (activeId) {
      const active = loadedLists.find(l => l.id === activeId);
      if (active) {
        initList(active);
        setCurrentScreen('main');
      }
    }
  }, []);

  const handleSelectList = (listId: string) => {
    const list = todoLists.find(l => l.id === listId);
    if (list) {
      initList(list);
      saveActiveListId(listId);
      setCurrentScreen('main');
    }
  };

  const handleEditList = (listId: string) => {
    setEditingListId(listId);
    setCurrentScreen('settings');
  };

  const handleAddNewList = () => {
    const newList: TodoList = {
      id: uuid_v4(),
      title: 'あたらしいじゅんび',
      tasks: [
        {
          id: uuid_v4(),
          name: 'トイレ',
          icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhx0t57NmexW6-RnpAFgwUpiBvrYZPjfX62AoLFuIpHpNtpD17HbGXoL5wYatAlk8kzhiLHfTAmehav2tpdYXtCaXuHl_XYWPNeja-p01TKberrUZFkkC18zLAOJwS0mrRDfhFOgjcMqHU/s400/toilet_boy.png',
          plannedSeconds: 5 * 60,
          kind: 'todo',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        },
        {
          id: 'reward-task',
          name: 'あそぶ',
          icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiU3bT8Om8wpYNBSphXDy0LAIrNKFvn6ONxElTN90ekuHals49c0dDv8jcCse07zwHauLyKM8hV-DVak1mzOixULI0egb3ZshzoytLn2BLcc1Xk6NRRKITJJbxRS6ZO-SRUKmDSbOC2CYrA/s400/omochabako.png',
          plannedSeconds: 15 * 60,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
        }
      ],
      targetTimeSettings: {
        mode: 'duration',
        targetHour: 7,
        targetMinute: 55,
      }
    };
    setTodoLists([...todoLists, newList]);
    saveTodoLists([...todoLists, newList]);
    setEditingListId(newList.id);
    setCurrentScreen('settings');
  };

  const handleDeleteList = (listId: string) => {
    const updated = todoLists.filter(l => l.id !== listId);
    setTodoLists(updated);
    saveTodoLists(updated);
  };

  const handleSaveList = (updatedList: TodoList) => {
    const updatedLists = todoLists.map((l: TodoList) => l.id === updatedList.id ? updatedList : l);
    setTodoLists(updatedLists);
    saveTodoLists(updatedLists);

    // もし現在実行中のリストなら同期する
    if (activeList?.id === updatedList.id) {
      initList(updatedList);
    }

    setCurrentScreen('selection');
    setEditingListId(null);
  };

  const handleBackToSelection = () => {
    setCurrentScreen('selection');
    setEditingListId(null);
    saveActiveListId(null);
  };

  const selectedTask = useMemo(() =>
    tasks.find((t: Task) => t.id === selectedTaskId),
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

  if (currentScreen === 'selection') {
    return (
      <TodoListSelection
        lists={todoLists}
        onSelect={handleSelectList}
        onEdit={handleEditList}
        onAdd={handleAddNewList}
        onDelete={handleDeleteList}
      />
    );
  }

  if (currentScreen === 'settings' && editingListId) {
    const listToEdit = todoLists.find(l => l.id === editingListId);
    if (listToEdit) {
      return (
        <TodoListSettings
          list={listToEdit}
          onSave={handleSaveList}
          onBack={() => setCurrentScreen('selection')}
        />
      );
    }
  }

  return (
    <div className="app">
      <div className="settings-button-container">
        <button
          onClick={handleBackToSelection}
          className="settings-button"
          title="リストにもどる"
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
