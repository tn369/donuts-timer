import { v4 as uuid_v4 } from 'uuid';

import { migrateTasksWithDefaultIcons, PRESET_IMAGES } from '../constants';
import type { TodoList } from '../types';

/**
 * リスト内のタスクをマイグレーションする（アイコンの補完など）
 * @param list 対象のリスト
 * @returns 変換後のリスト
 */
export const migrateTodoList = (list: TodoList): TodoList => ({
  ...list,
  tasks: migrateTasksWithDefaultIcons(list.tasks),
});

/**
 * 新規作成時のデフォルトリストを生成する
 * @returns デフォルトのリスト
 */
export const createDefaultList = (): TodoList => ({
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
 * @param list 対象のリスト
 * @returns コピーされたリスト
 */
export const copyTodoList = (list: TodoList): TodoList => ({
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
 * 全リストで使用されているユニークなアイコン一覧を取得する
 * @param todoLists リスト一覧
 * @returns アイコンURLのリスト
 */
export const getAllUniqueIcons = (todoLists: TodoList[]) =>
  Array.from(
    new Set([...PRESET_IMAGES, ...todoLists.flatMap((list) => list.tasks.map((t) => t.icon))])
  ).filter((icon) => icon !== '');
