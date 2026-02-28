/**
 * やることリストの一覧管理、保存、選択状態を管理するカスタムフック
 */
import { useMemo, useState } from 'react';

import { toAppTasks, toDomainTasks } from '../domain/timer/mappers/taskMapper';
import {
  convertSiblingPrimaryToSingle,
  duplicateSingleSessionForSibling,
} from '../domain/timer/services/modeTransition';
import {
  loadActiveListId,
  loadExecutionState,
  saveActiveListId,
  saveExecutionState,
} from '../storage';
import type { TodoList } from '../types';
import { createDefaultList, getAllUniqueIcons } from '../utils/todoListUtils';
import { useTodoListsData } from './useTodoListsData';

/**
 * やることリストのデータ操作と選択状態を管理するフック
 * @returns リスト操作に関連する状態と関数
 */
export const useTodoLists = () => {
  const { todoLists, addNewList, deleteList, copyList, saveList, reorderTodoLists } =
    useTodoListsData();

  const [activeListIds, setActiveListIds] = useState<string[]>(() => {
    const activeId = loadActiveListId();
    if (activeId) {
      return [activeId];
    }
    return [];
  });

  const activeLists = useMemo(() => {
    return activeListIds
      .map((id) => todoLists.find((l) => l.id === id))
      .filter((list): list is TodoList => !!list);
  }, [activeListIds, todoLists]);

  const [isSiblingMode, setIsSiblingMode] = useState(false);

  /**
   * リストを選択する（1人モード）
   * @param listId 選択するリストのID
   */
  const selectList = (listId: string) => {
    const list = todoLists.find((item) => item.id === listId);
    if (list) {
      setActiveListIds([listId]);
      saveActiveListId(listId);
      setIsSiblingMode(false);
    }
  };

  /**
   * 2つのリストを選択する（2人モード）
   * @param id1 1人目のリストID
   * @param id2 2人目のリストID
   */
  const selectSiblingLists = (id1: string, id2: string) => {
    const list1 = todoLists.find((item) => item.id === id1);
    const list2 = todoLists.find((item) => item.id === id2);
    if (list1 && list2) {
      setActiveListIds([id1, id2]);
      setIsSiblingMode(true);
    }
  };

  /**
   * 選択状態を解除する
   */
  const clearActiveList = () => {
    saveActiveListId(null);
    setActiveListIds([]);
    setIsSiblingMode(false);
  };

  /**
   * 現在のリストを複製して2人モードに切り替える
   */
  const duplicateActiveListForSiblingMode = () => {
    if (activeLists.length > 0) {
      const list = activeLists[0];
      // 1人モードの実行状態を2人モードの両方にコピーする
      const currentState = loadExecutionState(list.id, 'single');
      if (currentState) {
        const [leftState, rightState] = duplicateSingleSessionForSibling({
          tasks: toDomainTasks(currentState.tasks),
          selectedTaskId: currentState.selectedTaskId,
          isTimerRunning: currentState.isTimerRunning,
          lastTickTimestamp: currentState.lastTickTimestamp,
          listId: currentState.listId,
        });
        saveExecutionState({ ...leftState, tasks: toAppTasks(leftState.tasks) });
        saveExecutionState({ ...rightState, tasks: toAppTasks(rightState.tasks) });
      }

      setActiveListIds([list.id, list.id]);
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
        const singleState = convertSiblingPrimaryToSingle({
          tasks: toDomainTasks(currentState.tasks),
          selectedTaskId: currentState.selectedTaskId,
          isTimerRunning: currentState.isTimerRunning,
          lastTickTimestamp: currentState.lastTickTimestamp,
          listId: currentState.listId,
        });
        saveExecutionState({ ...singleState, tasks: toAppTasks(singleState.tasks) });
      }
      setActiveListIds([list.id]);
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
    getAllUniqueIcons: () => getAllUniqueIcons(todoLists),
    isSiblingMode,
    reorderTodoLists,
    saveList,
    selectList,
    selectSiblingLists,
    todoLists,
    // Note: createTemporaryList is used in App.tsx but was previously just a wrapper around createDefaultList
    createTemporaryList: () => {
      // We import createDefaultList from utils and export it as createTemporaryList to keep the API
      return createDefaultList();
    },
  };
};
