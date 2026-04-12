import { h } from 'https://esm.sh/preact';
import { useRef, useCallback, useState } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const Task = ({
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
    updateTaskColorLabel,
    colorLabels,
    rowTasks,
    currentDay
}) => {
    const dragInfo = useRef({
        task: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0,
        hasMoved: false, mode: 'move', originalStart: 0, originalDuration: 0
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState(null);

    const handleMouseMove = useCallback((e) => {
        if (!dragInfo.current.task) return;
        const dx = Math.abs(e.clientX - dragInfo.current.startX);
        const dy = Math.abs(e.clientY - dragInfo.current.startY);
        if (dx > 3 || dy > 3) dragInfo.current.hasMoved = true;
        if (!dragInfo.current.hasMoved) return;

        const containerRect = document.querySelector('.flex-1.overflow-visible.relative.bg-white').getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left + containerScroll.left;
        const mouseY = e.clientY - containerRect.top - 48 + containerScroll.top;
        const dayUnderMouse = Math.floor(mouseX / dayWidth);
        const rowUnderMouse = Math.floor(mouseY / 60);

        let updated = { ...dragInfo.current.task };
        if (dragInfo.current.mode === 'resize-r') {
            updated.duration = Math.max(1, dayUnderMouse - dragInfo.current.task.start + 1);
            setDragPosition({ start: updated.start, row: updated.row, duration: updated.duration });
        } else if (dragInfo.current.mode === 'resize-l') {
            const originalEnd = dragInfo.current.originalStart + dragInfo.current.originalDuration;
            const newStart = Math.min(originalEnd - 1, Math.max(0, dayUnderMouse));
            updated.start = newStart;
            updated.duration = originalEnd - newStart;
            setDragPosition({ start: updated.start, row: updated.row, duration: updated.duration });
        } else {
            const offsetDays = Math.floor(dragInfo.current.offsetX / dayWidth);
            updated.start = Math.max(0, dayUnderMouse - offsetDays);
            updated.row = Math.max(0, Math.min(rowLabelsLength - 1, rowUnderMouse));
            setDragPosition({ start: updated.start, row: updated.row, duration: updated.duration });
        }
        dragInfo.current.task = updated;
    }, [dayWidth, rowLabelsLength, containerScroll]);

    const handleMouseUp = useCallback(() => {
        if (dragInfo.current.task) {
            if (dragInfo.current.hasMoved) finalizeMove(dragInfo.current.task);
            else {
                setEditingTaskId(dragInfo.current.task.id);
            }
        }
        dragInfo.current.task = null;
        setIsDragging(false);
        setDragPosition(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, finalizeMove, setEditingTaskId]);

    const onMouseDown = (e) => {
        if (e.target.closest('.edit-toolbar') || e.target.closest('.delete-confirm-overlay')) return;
        if (editingTaskId && editingTaskId !== task.id) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isNearLeft = clickX < 10;
        const isNearRight = clickX > rect.width - 10;

        dragInfo.current = {
            task: task, startX: e.clientX, startY: e.clientY, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
            hasMoved: false, mode: isNearLeft ? 'resize-l' : (isNearRight ? 'resize-r' : 'move'),
            originalStart: task.start, originalDuration: task.duration
        };
        setIsDragging(true);
        setDragPosition({ start: task.start, row: task.row, duration: task.duration });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

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

    return html`
        <div key=${task.id} id=${task.id} data-task-id=${task.id} onMouseDown=${onMouseDown}
            class="absolute task-bar group rounded-lg border border-black/10 flex flex-col justify-center px-3 text-white shadow-sm hover:shadow-lg"
            style="left: ${currentStart * dayWidth + 2}px; top: ${currentRow * 60 + 10}px; width: ${currentDuration * dayWidth - 4}px; height: 42px; background-color: ${getTaskColor(task)}; z-index: ${Math.max(1000, 11000 - currentDuration)}; opacity: ${opacity};">
            <div class="absolute bg-slate-300/50" style="left: 0px; width:100%; height:100%; ${isPastCompleted ?  '' : 'display: none;'};"></div>
            <div class="resize-handle-l"></div>
            <div class="resize-handle-r"></div>

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
                        <select
                            class="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-900"
                            value=${task.colorLabel}
                            onChange=${(e) => updateTaskColorLabel(task.id, e.target.value)}
                            title="Select ColorLabel"
                        >
                            <option value="">None</option>
                            ${colorLabels.map(colorLabel => html`<option value=${colorLabel.id}>${colorLabel.name}</option>`)}
                        </select>
                    </div>
                `
                : html`
                    <div class="task-label-container">
                        <div class="text-[12px] font-medium opacity-80 leading-tight" style=${shouldRotate ? 'transform: rotate(-30deg) translateX(0); transform-origin: left center; z-index: 999;' : ''}>
                            ID: ${task.id}
                        </div>
                        <div class="text-sm font-bold leading-tight" style=${!settings.showTitles ? 'display: none;' : ''}>${task.name}</div>
                        <div class="text-[12px] font-medium opacity-80 leading-tight" style=${!settings.showTitles ? 'display: none;' : ''}>
                            ${task.duration} Days
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

export default Task;