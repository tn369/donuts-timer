/**
 * アプリケーションのエントリーポイントコンポーネント。画面遷移やグローバルな状態管理を行う。
 */
import styles from './App.module.css';
import { MainTimerView } from './components/MainTimerView';
import { TodoListSelection } from './components/TodoListSelection';
import { TodoListSettings } from './components/TodoListSettings';
import { useAppScreen } from './hooks/useAppScreen';
import { useTodoLists } from './hooks/useTodoLists';
import type { TodoList } from './types';

/**
 * アプリケーションのメインコンポーネント
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
    showSettings,
  } = useAppScreen();
  const {
    activeLists,
    addNewList,
    clearActiveList,
    copyList,
    deleteList,
    getAllUniqueIcons,
    duplicateActiveListForSiblingMode,
    exitSiblingMode,
    isSiblingMode,
    saveList,
    selectList,
    selectSiblingLists,
    todoLists,
  } = useTodoLists();

  const handleSelectList = (listId: string) => {
    selectList(listId);
    setCurrentScreen('main');
  };

  const handleSelectSiblingLists = (id1: string, id2: string) => {
    selectSiblingLists(id1, id2);
    setCurrentScreen('main');
  };

  const handleAddNewList = () => {
    const newList = addNewList();
    setEditingListId(newList.id);
    setSettingsSource('selection');
    setCurrentScreen('settings');
  };

  const handleSaveList = (updatedList: TodoList) => {
    saveList(updatedList);
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
      />
    );
  }

  if (currentScreen === 'settings' && editingListId) {
    const listToEdit = todoLists.find((list) => list.id === editingListId);
    if (listToEdit) {
      return (
        <TodoListSettings
          list={listToEdit}
          allExistingIcons={getAllUniqueIcons()}
          onSave={handleSaveList}
          onBack={backFromSettings}
        />
      );
    }
  }

  return (
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
}

export default App;
