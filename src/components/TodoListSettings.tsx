import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Camera, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TodoList, Task, TargetTimeSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TodoListSettingsProps {
    list: TodoList;
    onSave: (list: TodoList) => void;
    onBack: () => void;
}

export const TodoListSettings: React.FC<TodoListSettingsProps> = ({
    list,
    onSave,
    onBack,
}) => {
    const [editedList, setEditedList] = useState<TodoList>({ ...list });

    const handleTitleChange = (title: string) => {
        setEditedList({ ...editedList, title });
    };

    const handleTaskChange = (taskId: string, updates: Partial<Task>) => {
        setEditedList({
            ...editedList,
            tasks: editedList.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        });
    };

    const addTask = () => {
        const newTask: Task = {
            id: uuidv4(),
            name: '新しいやること',
            icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7b3g9p9JvE8Q9XW_r2k3B6jF-eW9mK1bQv3r6m0jLwS4y8T8x6R6r_e6m8w/s400/kid_jujunbi_boy.png',
            plannedSeconds: 5 * 60,
            kind: 'todo',
            status: 'todo',
            elapsedSeconds: 0,
            actualSeconds: 0,
        };

        // ごほうび(reward)の前に挿入
        const rewardIndex = editedList.tasks.findIndex(t => t.kind === 'reward');
        const newTasks = [...editedList.tasks];
        if (rewardIndex !== -1) {
            newTasks.splice(rewardIndex, 0, newTask);
        } else {
            newTasks.push(newTask);
        }

        setEditedList({ ...editedList, tasks: newTasks });
    };

    const removeTask = (taskId: string) => {
        setEditedList({
            ...editedList,
            tasks: editedList.tasks.filter(t => t.id !== taskId || t.kind === 'reward')
        });
    };

    const handleTargetTimeChange = (updates: Partial<TargetTimeSettings>) => {
        setEditedList({
            ...editedList,
            targetTimeSettings: { ...editedList.targetTimeSettings, ...updates }
        });
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={24} />
                </button>
                <div className="settings-title">
                    <span>やることリスト の せってい</span>
                </div>
                <button
                    onClick={() => onSave(editedList)}
                    className="confirm-button has-changes"
                    style={{ marginLeft: 'auto' }}
                >
                    <Save size={20} />
                    <span>保存する</span>
                </button>
            </div>

            <div className="settings-content">
                <section className="settings-section">
                    <h2 className="section-title">リストのなまえ</h2>
                    <input
                        type="text"
                        className="title-input"
                        value={editedList.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="リストのなまえを入力..."
                    />
                </section>

                <section className="settings-section">
                    <h2 className="section-title">ごほうび の じかん計算</h2>
                    <div className="mode-selection">
                        <button
                            className={`mode-button ${editedList.targetTimeSettings.mode === 'duration' ? 'active' : ''}`}
                            onClick={() => handleTargetTimeChange({ mode: 'duration' })}
                        >
                            <div className="mode-icon">⏳</div>
                            <div className="mode-label">きまった時間</div>
                            <div className="mode-description">のこった時間があそび時間</div>
                        </button>
                        <button
                            className={`mode-button ${editedList.targetTimeSettings.mode === 'target-time' ? 'active' : ''}`}
                            onClick={() => handleTargetTimeChange({ mode: 'target-time' })}
                        >
                            <div className="mode-icon">⏰</div>
                            <div className="mode-label">おわる時刻</div>
                            <div className="mode-description">出発にまにあうよう調整</div>
                        </button>
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="section-title">やること の せってい</h2>
                    <div className="task-editor-list">
                        <AnimatePresence mode="popLayout">
                            {editedList.tasks.filter(t => t.kind !== 'reward').map((task) => (
                                <TaskEditorItem
                                    key={task.id}
                                    task={task}
                                    mode={editedList.targetTimeSettings.mode}
                                    targetHour={editedList.targetTimeSettings.targetHour}
                                    targetMinute={editedList.targetTimeSettings.targetMinute}
                                    onTaskChange={handleTaskChange}
                                    onRemoveTask={removeTask}
                                    onTargetTimeChange={handleTargetTimeChange}
                                />
                            ))}

                            <motion.button
                                layout
                                key="add-task-button"
                                className="add-task-btn"
                                onClick={addTask}
                            >
                                <Plus size={20} />
                                <span>やること を ついか</span>
                            </motion.button>

                            {editedList.tasks.filter(t => t.kind === 'reward').map((task) => (
                                <TaskEditorItem
                                    key={task.id}
                                    task={task}
                                    mode={editedList.targetTimeSettings.mode}
                                    targetHour={editedList.targetTimeSettings.targetHour}
                                    targetMinute={editedList.targetTimeSettings.targetMinute}
                                    onTaskChange={handleTaskChange}
                                    onRemoveTask={removeTask}
                                    onTargetTimeChange={handleTargetTimeChange}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
};

interface TaskEditorItemProps {
    task: Task;
    mode: 'duration' | 'target-time';
    targetHour: number;
    targetMinute: number;
    onTaskChange: (taskId: string, updates: Partial<Task>) => void;
    onRemoveTask: (taskId: string) => void;
    onTargetTimeChange: (updates: Partial<TargetTimeSettings>) => void;
}

const TaskEditorItem: React.FC<TaskEditorItemProps> = ({
    task,
    mode,
    targetHour,
    targetMinute,
    onTaskChange,
    onRemoveTask,
    onTargetTimeChange,
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`task-editor-item ${task.kind}`}
        >
            <div className="task-editor-image">
                <img src={task.icon} alt={task.name} />
                <button className="change-image-btn" title="画像をへんこう">
                    <Camera size={14} />
                </button>
            </div>

            <div className="task-editor-info">
                <input
                    type="text"
                    className="task-name-input"
                    value={task.name}
                    onChange={(e) => onTaskChange(task.id, { name: e.target.value })}
                />
                <div className="task-time-input-group">
                    {task.kind === 'reward' && mode === 'target-time' ? (
                        <div className="task-target-time-inputs">
                            <select
                                className="time-select-small"
                                value={targetHour}
                                onChange={(e) => onTargetTimeChange({ targetHour: parseInt(e.target.value) })}
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <span className="time-separator-small">:</span>
                            <select
                                className="time-select-small"
                                value={targetMinute}
                                onChange={(e) => onTargetTimeChange({ targetMinute: parseInt(e.target.value) })}
                            >
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <span className="time-label-small">におわる</span>
                        </div>
                    ) : (
                        <>
                            <input
                                type="number"
                                className="task-minutes-input"
                                value={Math.floor(task.plannedSeconds / 60)}
                                    onChange={(e) => onTaskChange(task.id, { plannedSeconds: parseInt(e.target.value || '0') * 60 })}
                                    disabled={task.kind === 'reward' && mode === 'target-time'}
                                />
                                <span>ぷん</span>
                            {task.kind === 'reward' && mode === 'target-time' && (
                                <span className="auto-calc-hint">（じどう計算）</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {task.kind === 'todo' && (
                <button
                    className="delete-task-btn"
                    onClick={() => onRemoveTask(task.id)}
                    title="削除"
                >
                    <Trash2 size={20} />
                </button>
            )}
            {task.kind === 'reward' && (
                <div className="reward-badge">ごほうび</div>
            )}
        </motion.div>
    );
};

