import { h } from 'https://esm.sh/preact';
import { useRef, useCallback, useState } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
};

const TaskEpic = ({
    task,
    dayWidth,
    rowLabelsLength,
    containerScroll,
    sidebarWidth,
    finalizeMove,
    onDelete,
    setEditingTaskId,
    setConfirmDeleteId,
    editingTaskId,
    editingTaskIdValue,
    setEditingTaskIdValue,
    confirmDeleteId,
    settings,
    getTaskColor,
    updateTaskName,
    updateTaskId,
    rowTasks,
    currentDay
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState(null);

    const isEditing = editingTaskId === task.id;

    const taskIndex = rowTasks.findIndex(t => t.id === task.id);
    const hasNextTask = taskIndex < rowTasks.length - 1;

    const measureTextWidth = (text, fontSize, fontWeight) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontWeight} ${fontSize}px Inter`;
        return ctx.measureText(text).width;
    };
    const nameWidth = measureTextWidth(task.name, 14, 'bold');
    const infoWidth = measureTextWidth(`ID: ${task.id}, Days: ${task.duration}`, 12, '500');
    const idWidth = measureTextWidth(`ID: ${task.id}`, 12, '500');
    const labelWidth = Math.max(nameWidth, infoWidth);
    const taskWidth = task.duration * dayWidth - 4;
    const shouldRotate = idWidth > taskWidth && hasNextTask;

    const isPastCompleted = currentDay >= 0 && task.start + task.duration <= currentDay;

    const currentStart = isDragging && dragPosition ? dragPosition.start : task.start;
    const currentRow = isDragging && dragPosition ? dragPosition.row : task.row;
    const currentDuration = isDragging && dragPosition ? dragPosition.duration : task.duration;
    const opacity = isDragging ? 0.7 : 1;

    const color = getTaskColor(task);
    const progressPercent = task.progress * 100;
    const backgroundStyle = `linear-gradient(to right, ${color} 0%, ${color} ${progressPercent}%, rgba(${hexToRgb(color)}, 0.3) ${progressPercent}% 100%)`;

    return html`
        <div key=${task.id} id=${task.id} data-task-id=${task.id}
            class="absolute task-bar group rounded-lg border border-black/10 flex flex-col justify-center px-3 text-white shadow-sm hover:shadow-lg"
            style="left: ${currentStart * dayWidth + 2}px; top: ${currentRow * 60 + 10}px; width: ${currentDuration * dayWidth - 4}px; height: 42px; background: ${backgroundStyle}; z-index: ${Math.max(1000, 11000 - currentDuration)}; opacity: ${opacity};">
            <div class="absolute bg-slate-300/50" style="left: 0px; width:100%; height:100%; ${isPastCompleted ?  '' : 'display: none;'};"></div>

            ${isEditing
                ? html`
                    <div class="relative w-full h-full flex flex-col items-center justify-center gap-1">
                        <input autoFocus onFocus=${e => e.target.select()} class="editable-input text-xs" value=${task.id} onInput=${(e) => setEditingTaskIdValue(e.target.value)} onKeyDown=${(e) => { if (e.key === 'Enter') { updateTaskId(task.id, e.target.value); setEditingTaskId(null); } }} onBlur=${() => { updateTaskId(task.id, task.id); setEditingTaskId(null); }} placeholder="Task ID" />
                        <input onFocus=${e => e.target.select()} class="editable-input text-xs" value=${task.name} onInput=${(e) => updateTaskName(task.id, e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && setEditingTaskId(null)} placeholder="Task Name" />
                    </div>
                    <!-- Edit Toolbar -->
                    <div class="edit-toolbar absolute top-[44px] left-0 w-max min-w-full bg-white border border-slate-200 shadow-xl rounded-lg p-1.5 flex items-center gap-3 z-[60]">
                        <button onMouseDown=${(e) => { e.stopPropagation(); setConfirmDeleteId(task.id); }} class="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md p-1.5 transition-colors" title="Delete Task">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                        </button>
                        <div class="h-4 w-px bg-slate-200"></div>
                    </div>
                `
                : html`
                    <div class="task-label-container">
                        <div class="text-[12px] font-medium opacity-80 leading-tight" style=${shouldRotate ? 'transform: rotate(-30deg) translateX(0); transform-origin: left center; z-index: 999;' : ''}>
                            ID: ${task.id}
                        </div>
                        <div class="text-sm font-bold leading-tight" style=${!settings.showTitles ? 'display: none;' : ''}>${task.name}</div>
                        <div class="text-[12px] font-medium opacity-80 leading-tight" style=${!settings.showTitles ? 'display: none;' : ''}>
                            ${task.duration} Days (${(task.progress * 100).toFixed(0)}%)
                        </div>
                    </div>`
            }

            ${confirmDeleteId === task.id && html`
                <div class="absolute inset-0 rounded-lg delete-confirm-overlay z-[70] flex items-center justify-around px-1">
                    <button onMouseDown=${(e) => { e.stopPropagation(); finalizeMove({ ...task, toDelete: true }); setConfirmDeleteId(null); setEditingTaskId(null); }} class="text-[12px] bg-rose-600 text-white px-2 py-1 rounded font-bold">Delete?</button>
                    <button onMouseDown=${(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} class="text-[12px] bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold">No</button>
                </div>`}
        </div>`;
};

export default TaskEpic;