/**
 * やることリストの一覧管理、保存、選択状態を管理するカスタムフック
 */
import { useState } from 'react';
import { v4 as uuid_v4 } from 'uuid';

import { DEFAULT_TODO_LISTS, migrateTasksWithDefaultIcons, PRESET_IMAGES } from '../constants';
import {
  loadActiveListId,
  loadExecutionState,
  loadTodoLists,
  saveActiveListId,
  saveExecutionState,
  saveTodoLists,
} from '../storage';
import type { TodoList } from '../types';

/**
 * リスト内のタスクをマイグレーションする（アイコンの補完など）
 */
const migrateTodoList = (list: TodoList): TodoList => ({
  ...list,
  tasks: migrateTasksWithDefaultIcons(list.tasks),
});

/**
 * 新規作成時のデフォルトリストを生成する
 */
const createDefaultList = (): TodoList => ({
  id: uuid_v4(),
  title: 'あさ',
  tasks: migrateTasksWithDefaultIcons([
    {
      id: uuid_v4(),
      name: 'トイレ',
      icon: '',
      plannedSeconds: 5 * 60,
      kind: 'todo',
      status: 'todo',
      elapsedSeconds: 0,
      actualSeconds: 0,
    },
    {
      id: 'reward-task',
      name: 'あそぶ',
      icon: '',
      plannedSeconds: 15 * 60,
      kind: 'reward',
      status: 'todo',
      elapsedSeconds: 0,
      actualSeconds: 0,
    },
  ]),
});

/**
 * リストをコピーする
 */
const copyTodoList = (list: TodoList): TodoList => ({
  ...list,
  id: uuid_v4(),
  title: `${list.title} (コピー)`,
  tasks: list.tasks.map((task) => ({
    ...task,
    id: task.kind === 'reward' ? 'reward-task' : uuid_v4(),
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  })),
});

/**
 * やることリストのデータ操作と選択状態を管理するフック
 */
export const useTodoLists = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>(() => {
    const loaded = loadTodoLists(DEFAULT_TODO_LISTS);
    const migrated = loaded.map(migrateTodoList);

    if (JSON.stringify(migrated) !== JSON.stringify(loaded)) {
      saveTodoLists(migrated);
    }

    return migrated;
  });
  const [activeLists, setActiveLists] = useState<TodoList[]>(() => {
    const loadedLists = loadTodoLists(DEFAULT_TODO_LISTS);
    const activeId = loadActiveListId();
    if (activeId) {
      const active = loadedLists.find((list) => list.id === activeId);
      if (active) {
        return [migrateTodoList(active)];
      }
    }
    return [];
  });
  const [isSiblingMode, setIsSiblingMode] = useState(false);

  /**
   * リストを選択する（1人モード）
   */
  const selectList = (listId: string) => {
    const list = todoLists.find((item) => item.id === listId);
    if (list) {
      setActiveLists([list]);
      saveActiveListId(listId);
      setIsSiblingMode(false);
    }
  };

  /**
   * 2つのリストを選択する（2人モード）
   */
  const selectSiblingLists = (id1: string, id2: string) => {
    const list1 = todoLists.find((item) => item.id === id1);
    const list2 = todoLists.find((item) => item.id === id2);
    if (list1 && list2) {
      setActiveLists([list1, list2]);
      setIsSiblingMode(true);
    }
  };

  /**
   * 新しいリストを追加する
   */
  const addNewList = () => {
    const newList = createDefaultList();
    const updated = [...todoLists, newList];
    setTodoLists(updated);
    saveTodoLists(updated);
    return newList;
  };

  /**
   * リストを削除する
   */
  const deleteList = (listId: string) => {
    const updated = todoLists.filter((list) => list.id !== listId);
    setTodoLists(updated);
    saveTodoLists(updated);
  };

  /**
   * リストをコピーして追加する
   */
  const copyList = (listId: string) => {
    const original = todoLists.find((list) => list.id === listId);
    if (original) {
      const updated = [...todoLists, copyTodoList(original)];
      setTodoLists(updated);
      saveTodoLists(updated);
    }
  };

  /**
   * リストの内容を保存する
   */
  const saveList = (updatedList: TodoList) => {
    const updatedLists = todoLists.map((list) => (list.id === updatedList.id ? updatedList : list));
    setTodoLists(updatedLists);
    saveTodoLists(updatedLists);
    setActiveLists((prev) => prev.map((list) => (list.id === updatedList.id ? updatedList : list)));
  };

  /**
   * 選択状態を解除する
   */
  const clearActiveList = () => {
    saveActiveListId(null);
    setActiveLists([]);
    setIsSiblingMode(false);
  };

  /**
   * 全リストで使用されているユニークなアイコン一覧を取得する
   */
  const getAllUniqueIcons = () =>
    Array.from(
      new Set([...PRESET_IMAGES, ...todoLists.flatMap((list) => list.tasks.map((t) => t.icon))])
    ).filter((icon) => icon !== '');

  /**
   * 現在のリストを複製して2人モードに切り替える
   */
  const duplicateActiveListForSiblingMode = () => {
    if (activeLists.length > 0) {
      const list = activeLists[0];
      // 1人モードの実行状態を2人モードの両方にコピーする
      const currentState = loadExecutionState(list.id, 'single');
      if (currentState) {
        saveExecutionState({ ...currentState, mode: 'sibling-0', isAutoResume: true });
        saveExecutionState({ ...currentState, mode: 'sibling-1', isAutoResume: true });
      }

      setActiveLists([list, list]);
      setIsSiblingMode(true);
    }
  };

  /**
   * 2人モードを終了して1人モードに戻る
   */
  const exitSiblingMode = () => {
    if (isSiblingMode && activeLists.length > 0) {
      const list = activeLists[0];
      // 2人モード（左側）の実行状態を1人モードに書き戻す
      const currentState = loadExecutionState(list.id, 'sibling-0');
      if (currentState) {
        saveExecutionState({ ...currentState, mode: 'single', isAutoResume: true });
      }

      setActiveLists([list]);
      setIsSiblingMode(false);
    }
  };

  return {
    activeLists,
    addNewList,
    clearActiveList,
    copyList,
    deleteList,
    duplicateActiveListForSiblingMode,
    exitSiblingMode,
    getAllUniqueIcons,
    isSiblingMode,
    saveList,
    selectList,
    selectSiblingLists,
    todoLists,
  };
};
