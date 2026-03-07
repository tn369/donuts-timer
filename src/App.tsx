/**
 * アプリケーションのエントリーポイントコンポーネント。画面遷移やグローバルな状態管理を行う。
 */
import { useState } from 'react';

import styles from './App.module.css';
import { ParentGuidePage } from './components/info/ParentGuidePage';
import { TodoListSelection } from './components/task/TodoListSelection';
import { TodoListSettings } from './components/task/TodoListSettings';
import { MainTimerView } from './components/timer/MainTimerView';
import { useAppScreen } from './hooks/useAppScreen';
import { useTodoLists } from './hooks/useTodoLists';
import type { TodoList } from './types';

/**
 * メインタイマー画面を描画する
 * @param isSiblingMode きょうだいモードかどうか
 * @param activeLists 現在アクティブなリスト一覧
 * @param handleBackToSelection リスト選択画面へ戻るコールバック
 * @param showSettings 設定画面を開くコールバック
 * @param exitSiblingMode きょうだいモード終了コールバック
 * @param duplicateActiveListForSiblingMode きょうだいモード開始コールバック
 * @returns レンダリングされるJSX要素
 */
const renderTimerScreen = (
  isSiblingMode: boolean,
  activeLists: TodoList[],
  handleBackToSelection: () => void,
  showSettings: (listId: string, source: 'selection' | 'main') => void,
  exitSiblingMode: () => void,
  duplicateActiveListForSiblingMode: () => void
) => (
  <div className={styles.app}>
    {isSiblingMode ? (
      <div className={styles.siblingContainer}>
        <div className={styles.siblingItem}>
          <MainTimerView
            key={`sibling-0-${activeLists[0]?.id}`}
            initialList={activeLists[0]}
            onBackToSelection={handleBackToSelection}
            onEditSettings={(id) => {
              showSettings(id, 'main');
            }}
            onExitSiblingMode={exitSiblingMode}
            isSiblingMode={true}
            timerMode="sibling-0"
          />
        </div>
        <div className={styles.siblingItem}>
          <MainTimerView
            key={`sibling-1-${activeLists[1]?.id}`}
            initialList={activeLists[1]}
            onBackToSelection={handleBackToSelection}
            onEditSettings={(id) => {
              showSettings(id, 'main');
            }}
            onExitSiblingMode={exitSiblingMode}
            showSelectionButton={false}
            isSiblingMode={true}
            timerMode="sibling-1"
          />
        </div>
      </div>
    ) : (
      <MainTimerView
        initialList={activeLists[0]}
        onBackToSelection={handleBackToSelection}
        onEditSettings={(id) => {
          showSettings(id, 'main');
        }}
        onEnterSiblingMode={duplicateActiveListForSiblingMode}
        timerMode="single"
      />
    )}
  </div>
);

/**
 * アプリケーションのメインコンポーネント
 * @returns レンダリングされるJSX要素
 */
function App() {
  const {
    backFromSettings,
    backToSelection,
    currentScreen,
    editingListId,
    setCurrentScreen,
    setEditingListId,
    setSettingsSource,
    showParentGuide,
    showSettings,
  } = useAppScreen();
  const {
    activeLists,
    clearActiveList,
    copyList,
    createTemporaryList,
    deleteList,
    getAllUniqueIcons,
    duplicateActiveListForSiblingMode,
    exitSiblingMode,
    isSiblingMode,
    reorderTodoLists,
    saveList,
    selectList,
    selectSiblingLists,
    todoLists,
  } = useTodoLists();
  const [temporaryList, setTemporaryList] = useState<TodoList | null>(null);

  const handleSelectList = (listId: string) => {
    selectList(listId);
    setCurrentScreen('main');
  };

  const handleSelectSiblingLists = (id1: string, id2: string) => {
    selectSiblingLists(id1, id2);
    setCurrentScreen('main');
  };

  const handleAddNewList = () => {
    const newList = createTemporaryList();
    setTemporaryList(newList);
    setEditingListId(newList.id);
    setSettingsSource('selection');
    setCurrentScreen('settings');
  };

  const handleSaveList = (updatedList: TodoList) => {
    saveList(updatedList);
    setTemporaryList(null);
    backFromSettings();
  };

  const handleBackToSelection = () => {
    clearActiveList();
    backToSelection();
  };

  if (currentScreen === 'selection') {
    return (
      <TodoListSelection
        lists={todoLists}
        onSelect={handleSelectList}
        onSelectSibling={handleSelectSiblingLists}
        onEdit={(listId) => {
          showSettings(listId, 'selection');
        }}
        onCopy={copyList}
        onAdd={handleAddNewList}
        onDelete={deleteList}
        onReorder={reorderTodoLists}
        onShowParentGuide={() => {
          setTemporaryList(null);
          setEditingListId(null);
          showParentGuide();
        }}
      />
    );
  }

  if (currentScreen === 'settings' && editingListId) {
    // 一時的なリストがあればそれを使用、なければtodoListsから検索
    const listToEdit =
      temporaryList?.id === editingListId
        ? temporaryList
        : todoLists.find((list) => list.id === editingListId);
    if (listToEdit) {
      return (
        <TodoListSettings
          list={listToEdit}
          allExistingIcons={getAllUniqueIcons()}
          allTodoLists={todoLists}
          onSave={handleSaveList}
          onBack={() => {
            setTemporaryList(null);
            backFromSettings();
          }}
        />
      );
    }
  }

  if (currentScreen === 'parent-guide') {
    return <ParentGuidePage onBack={backToSelection} />;
  }

  return renderTimerScreen(
    isSiblingMode,
    activeLists,
    handleBackToSelection,
    showSettings,
    exitSiblingMode,
    duplicateActiveListForSiblingMode
  );
}

export default App;
