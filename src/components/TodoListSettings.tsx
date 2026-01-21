import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Camera, Save, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TodoList, Task, TargetTimeSettings } from '../types';
import styles from './TodoListSettings.module.css';
import { v4 as uuidv4 } from 'uuid';
import { resizeImage } from '../utils';

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
        <div className={styles.settingsContainer}>
            <div className={styles.settingsHeader}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.settingsTitle}>
                    <span>やることリスト の せってい</span>
                </div>
                <button
                    onClick={() => onSave(editedList)}
                    className={`${styles.confirmButton} ${styles.hasChanges}`}
                    style={{ marginLeft: 'auto' }}
                >
                    <Save size={20} />
                    <span>保存する</span>
                </button>
            </div>

            <div className={styles.settingsContent}>
                <section className={styles.settingsSection}>
                    <h2 className={styles.sectionTitle}>リストのなまえ</h2>
                    <input
                        type="text"
                        className={styles.titleInput}
                        value={editedList.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="リストのなまえを入力..."
                    />
                </section>
                <section className={styles.settingsSection}>
                    <h2 className={styles.sectionTitle}>どーなつタイマー の みため</h2>
                    <div className={styles.modeSelection}>
                        <button
                            className={`${styles.modeButton} ${(!editedList.timerSettings || editedList.timerSettings.theme === 'modern') ? styles.active : ''}`}
                            onClick={() => setEditedList({ ...editedList, timerSettings: { theme: 'modern' } })}
                        >
                            <div className={styles.modeIcon}>
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <rect x="5" y="5" width="30" height="30" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.8" />
                                </svg>
                            </div>
                            <div className={styles.modeLabel}>しかく</div>
                            <div className={styles.modeDescription}>あおいろ</div>
                        </button>
                        <button
                            className={`${styles.modeButton} ${editedList.timerSettings?.theme === 'classic' ? styles.active : ''}`}
                            onClick={() => setEditedList({ ...editedList, timerSettings: { theme: 'classic' } })}
                        >
                            <div className={styles.modeIcon}>
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.8" />
                                </svg>
                            </div>
                            <div className={styles.modeLabel}>まる</div>
                            <div className={styles.modeDescription}>あかいろ</div>
                        </button>
                    </div>
                </section>

                <section className={styles.settingsSection}>
                    <h2 className={styles.sectionTitle}>ごほうび の じかん計算</h2>
                    <div className={styles.modeSelection}>
                        <button
                            className={`${styles.modeButton} ${editedList.targetTimeSettings.mode === 'duration' ? styles.active : ''}`}
                            onClick={() => handleTargetTimeChange({ mode: 'duration' })}
                        >
                            <div className={styles.modeIcon}>⏳</div>
                            <div className={styles.modeLabel}>きまった時間</div>
                            <div className={styles.modeDescription}>のこった時間があそび時間</div>
                        </button>
                        <button
                            className={`${styles.modeButton} ${editedList.targetTimeSettings.mode === 'target-time' ? styles.active : ''}`}
                            onClick={() => handleTargetTimeChange({ mode: 'target-time' })}
                        >
                            <div className={styles.modeIcon}>⏰</div>
                            <div className={styles.modeLabel}>おわる時刻</div>
                            <div className={styles.modeDescription}>出発にまにあうよう調整</div>
                        </button>
                    </div>
                </section>

                <section className={styles.settingsSection}>
                    <h2 className={styles.sectionTitle}>やること の せってい</h2>
                    <div className={styles.taskEditorList}>
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
                                className={styles.addTaskBtn}
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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // ファイルサイズチェック（目安として1MB以下）
            if (file.size > 1024 * 1024) {
                alert('画像サイズが大きすぎます。1MB以下の画像を選んでください。');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const resizedImage = await resizeImage(base64String, 200, 200);
                onTaskChange(task.id, { icon: resizedImage });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlClick = () => {
        const url = prompt('画像のURLをいれてください', task.icon);
        if (url) {
            onTaskChange(task.id, { icon: url });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`${styles.taskEditorItem} ${task.kind === 'reward' ? styles.reward : ''}`}
        >
            <div className={styles.taskEditorImage}>
                <img src={task.icon} alt={task.name} />
                <div className={styles.taskEditorImageButtons}>
                    <button
                        className={styles.changeImageBtn}
                        title="がぞうをえらぶ"
                        onClick={handleImageClick}
                    >
                        <Camera size={14} />
                    </button>
                    <button
                        className={`${styles.changeImageBtn} ${styles.secondary}`}
                        title="URLをいれる"
                        onClick={handleUrlClick}
                    >
                        <Link size={14} />
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>

            <div className={styles.taskEditorInfo}>
                <input
                    type="text"
                    className={styles.taskNameInput}
                    value={task.name}
                    onChange={(e) => onTaskChange(task.id, { name: e.target.value })}
                />
                <div className={styles.taskTimeInputGroup}>
                    {task.kind === 'reward' && mode === 'target-time' ? (
                        <div className={styles.taskTargetTimeInputs}>
                            <select
                                className={styles.timeSelectSmall}
                                value={targetHour}
                                onChange={(e) => onTargetTimeChange({ targetHour: parseInt(e.target.value) })}
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <span className={styles.timeSeparatorSmall}>:</span>
                            <select
                                className={styles.timeSelectSmall}
                                value={targetMinute}
                                onChange={(e) => onTargetTimeChange({ targetMinute: parseInt(e.target.value) })}
                            >
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <span className={styles.timeLabelSmall}>におわる</span>
                        </div>
                    ) : (
                        <>
                            <input
                                type="number"
                                className={styles.taskMinutesInput}
                                value={Math.floor(task.plannedSeconds / 60)}
                                onChange={(e) => onTaskChange(task.id, { plannedSeconds: parseInt(e.target.value || '0') * 60 })}
                                disabled={task.kind === 'reward' && mode === 'target-time'}
                            />
                            <span>ぷん</span>
                            {task.kind === 'reward' && mode === 'target-time' && (
                                <span className={styles.autoCalcHint}>（じどう計算）</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {task.kind === 'todo' && (
                <button
                    className={styles.deleteTaskBtn}
                    onClick={() => onRemoveTask(task.id)}
                    title="削除"
                >
                    <Trash2 size={20} />
                </button>
            )}
            {task.kind === 'reward' && (
                <div className={styles.rewardBadge}>ごほうび</div>
            )}
        </motion.div>
    );
};

