import { h } from 'https://esm.sh/preact';
import TaskEpic from './TaskEpic.js';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const ROW_HEIGHT = 60;

const GanttGridEpic = ({
    tasks,
    dayWidth,
    rowLabelsLength,
    totalDaysCount,
    currentDay,
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
    swimlaneColors
}) => {
    return html`
        <div class="gantt-grid relative" style="width: ${totalDaysCount * dayWidth}px; height: ${Math.max(rowLabelsLength + 1, 12) * ROW_HEIGHT}px; background-size: ${dayWidth}px ${ROW_HEIGHT}px;">
            ${currentDay >= 0 && html`<div class="absolute top-0 left-0 bg-slate-300/20 pointer-events-none" style="width: ${Math.min(currentDay, totalDaysCount) * dayWidth}px; height: 100%;"></div>`}
            ${tasks.map(task => {
                const rowTasks = tasks.filter(t => t.row === task.row).sort((a,b)=>a.start-b.start);
                return html`<${TaskEpic}
                    task=${task}
                    dayWidth=${dayWidth}
                    rowLabelsLength=${rowLabelsLength}
                    containerScroll=${containerScroll}
                    sidebarWidth=${sidebarWidth}
                    finalizeMove=${finalizeMove}
                    onDelete=${onDelete}
                    setEditingTaskId=${setEditingTaskId}
                    setConfirmDeleteId=${setConfirmDeleteId}
                    editingTaskId=${editingTaskId}
                    editingTaskIdValue=${editingTaskIdValue}
                    setEditingTaskIdValue=${setEditingTaskIdValue}
                    confirmDeleteId=${confirmDeleteId}
                    settings=${settings}
                    getTaskColor=${getTaskColor}
                    updateTaskName=${updateTaskName}
                    updateTaskId=${updateTaskId}
                    rowTasks=${rowTasks}
                    currentDay=${currentDay}
                />`;
            })}
        </div>
    `;
};

export default GanttGridEpic;