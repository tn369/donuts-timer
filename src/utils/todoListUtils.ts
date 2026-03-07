import { v4 as uuid_v4 } from 'uuid';

import { migrateTasksWithDefaultIcons, PRESET_IMAGES } from '../constants';
import type { TodoList } from '../types';

const createTimestamp = () => Date.now();

/**
 * リスト内のタスクをマイグレーションする（アイコンの補完など）
 * @param list 対象のリスト
 * @returns 変換後のリスト
 */
export const migrateTodoList = (list: TodoList): TodoList => ({
  ...list,
  updatedAt: list.updatedAt ?? createTimestamp(),
  tasks: migrateTasksWithDefaultIcons(list.tasks),
});

/**
 * 新規作成時のデフォルトリストを生成する
 * @returns デフォルトのリスト
 */
export const createDefaultList = (): TodoList => ({
  id: uuid_v4(),
  title: 'あさ',
  updatedAt: createTimestamp(),
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
  updatedAt: createTimestamp(),
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

interface FindTaskNameByIconParams {
  currentListId: string;
  currentTaskId: string;
  icon: string;
  todoLists: TodoList[];
}

/**
 * 同じ画像を使う既存タスクから、名称補完候補を取得する
 * @param params 検索条件
 * @param params.currentListId 現在編集中のリストID
 * @param params.currentTaskId 現在編集中のタスクID
 * @param params.icon 選択された画像
 * @param params.todoLists 検索対象のやることリスト一覧
 * @returns 補完候補のタスク名。候補がなければnull
 */
export const findTaskNameByIcon = ({
  currentListId,
  currentTaskId,
  icon,
  todoLists,
}: FindTaskNameByIconParams): string | null => {
  if (!icon) {
    return null;
  }

  const candidates = todoLists.flatMap((list) =>
    list.tasks
      .filter((task) => task.icon === icon)
      .filter((task) => task.name.trim() !== '')
      .filter((task) => !(list.id === currentListId && task.id === currentTaskId))
      .map((task) => ({
        name: task.name,
        updatedAt: list.updatedAt ?? 0,
      }))
  );

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => b.updatedAt - a.updatedAt);
  return candidates[0]?.name ?? null;
};
