import { useState } from 'react';

import { DEFAULT_TODO_LISTS } from '../constants';
import { loadTodoLists, saveTodoLists } from '../storage';
import type { TodoList } from '../types';
import { copyTodoList, createDefaultList, migrateTodoList } from '../utils/todoListUtils';

/**
 * 全リストのデータ管理を行うフック
 * @returns リスト一覧と操作関数
 */
export const useTodoListsData = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>(() => {
    const loaded = loadTodoLists(DEFAULT_TODO_LISTS);
    const migrated = loaded.map(migrateTodoList);

    if (JSON.stringify(migrated) !== JSON.stringify(loaded)) {
      saveTodoLists(migrated);
    }

    return migrated;
  });

  const addNewList = () => {
    const newList = createDefaultList();
    const updated = [...todoLists, newList];
    setTodoLists(updated);
    saveTodoLists(updated);
    return newList;
  };

  const deleteList = (listId: string) => {
    const updated = todoLists.filter((list) => list.id !== listId);
    setTodoLists(updated);
    saveTodoLists(updated);
  };

  const copyList = (listId: string) => {
    const original = todoLists.find((list) => list.id === listId);
    if (original) {
      const updated = [...todoLists, copyTodoList(original)];
      setTodoLists(updated);
      saveTodoLists(updated);
    }
  };

  const saveList = (updatedList: TodoList) => {
    const existingIndex = todoLists.findIndex((list) => list.id === updatedList.id);
    let updatedLists: TodoList[];

    if (existingIndex === -1) {
      updatedLists = [...todoLists, updatedList];
    } else {
      updatedLists = todoLists.map((list) => (list.id === updatedList.id ? updatedList : list));
    }

    setTodoLists(updatedLists);
    saveTodoLists(updatedLists);
  };

  const reorderTodoLists = (newLists: TodoList[]) => {
    setTodoLists(newLists);
    saveTodoLists(newLists);
  };

  return {
    todoLists,
    addNewList,
    deleteList,
    copyList,
    saveList,
    reorderTodoLists,
  };
};
