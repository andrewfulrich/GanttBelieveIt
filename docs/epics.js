import { h, render, Component } from 'https://esm.sh/preact';
import { useState, useEffect, useRef, useCallback, useMemo } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

import HeaderEpic from './epics/components/HeaderEpic.js';
import TimelineHeader from './components/TimelineHeader.js';
import Footer from './components/Footer.js';
import SidebarEpic from './epics/components/SidebarEpic.js';
import GanttGridEpic from './epics/components/GanttGridEpic.js';
import Modals from './components/Modals.js';
import { parseEpics } from './parseEpics.js';

const html = htm.bind(h);

const DAY_WIDTH_BASE = 40;
const ROW_HEIGHT = 60;
const STORAGE_KEY = 'epics-believe-it-data-v1';
const SWIMLANE_COLORS_KEY = 'epics-swimlane-colors';

const JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "tasks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "start": { "type": "number" },
                    "duration": { "type": "number" },
                    "row": { "type": "number" },
                    "progress": { "type": "number", "minimum": 0, "maximum": 1 }
                },
                "required": ["id", "name", "start", "duration", "row", "progress"]
            }
        },
        "rowLabels": {
            "type": "array",
            "items": { "type": "string" }
        },
        "settings": {
            "type": "object",
            "properties": {
                "showTitles": { "type": "boolean", "description": "Whether to display task titles" },
                "projectStartDate": { "type": "string", "description": "Project start date in YYYY-MM-DD format" }
            },
            "required": ["showTitles", "projectStartDate"]
        }
    },
    "required": ["tasks", "rowLabels", "settings"]
};

const palette = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#eab308', '#ec4899', '#14b8a6', '#f97316'
];

const initialTasks = [];
const initialRowLabels = [];
const initialSettings = { showTitles: true, projectStartDate: '2026-01-01' };

const App = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).tasks : initialTasks;
    });
    const [rowLabels, setRowLabels] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).rowLabels : initialRowLabels;
    });
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).settings : initialSettings;
    });
    const [swimlaneColors, setSwimlaneColors] = useState(() => {
        const saved = localStorage.getItem(SWIMLANE_COLORS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [zoom, setZoom] = useState(0.5);
    const [containerScroll, setContainerScroll] = useState({ left: 0, top: 0 });
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('gantt-sidebar-width');
        return saved ? parseInt(saved, 10) : 250;
    });

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingRowIdx, setEditingRowIdx] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteRowIdx, setConfirmDeleteRowIdx] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [swimlaneMenuOpen, setSwimlaneMenuOpen] = useState(null);
    const [swimlaneInfoOpen, setSwimlaneInfoOpen] = useState(null);
    const [confirmRemoveGaps, setConfirmRemoveGaps] = useState(null);
    const [createGapModal, setCreateGapModal] = useState(null);
    const [gapAfterTaskId, setGapAfterTaskId] = useState(null);
    const [gapDate, setGapDate] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [confirmPivot, setConfirmPivot] = useState(false);
    const [taskJustAdded, setTaskJustAdded] = useState(false);
    const [editingTaskIdValue, setEditingTaskIdValue] = useState(null);

    const dayWidth = DAY_WIDTH_BASE * zoom;
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, rowLabels, settings }));
    }, [tasks, rowLabels, settings]);

    useEffect(() => {
        localStorage.setItem(SWIMLANE_COLORS_KEY, JSON.stringify(swimlaneColors));
    }, [swimlaneColors]);

    useEffect(() => {
        localStorage.setItem('gantt-sidebar-width', sidebarWidth.toString());
    }, [sidebarWidth]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (editingTaskId) {
                const isTaskElement = e.target.closest(`[data-task-id="${editingTaskId}"]`);
                const isToolbar = e.target.closest('.edit-toolbar');
                if (!isTaskElement && !isToolbar) {
                    setEditingTaskId(null);
                    setConfirmDeleteId(null);
                    setEditingTaskIdValue(null);
                }
            }
            if (editingRowIdx !== null) {
                const isRowElement = e.target.closest(`[data-row-idx="${editingRowIdx}"]`);
                if (!isRowElement) {
                    setEditingRowIdx(null);
                    setConfirmDeleteRowIdx(null);
                }
            }
            const isSwimlaneMenu = e.target.closest('.swimlane-menu');
            if (swimlaneMenuOpen !== null && !isSwimlaneMenu) setSwimlaneMenuOpen(null);
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [editingTaskId, editingRowIdx, swimlaneMenuOpen, swimlaneInfoOpen, confirmRemoveGaps]);

    useEffect(() => {
        if (taskJustAdded) {
            setTimeout(() => {
                const element = document.getElementById(editingTaskId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
                setTaskJustAdded(false);
            }, 0);
        }
    }, [taskJustAdded, editingTaskId]);

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target.result;
                const epics = parseEpics(csvText);
                const startDates = epics.map(e => e.startDate).filter(Boolean);
                const minStartDate = startDates.length > 0 ? startDates.reduce((min, d) => d < min ? d : min) : '2026-01-01';
                const projectStartDate = minStartDate;
                const newRowLabels = epics.map(e => e.title);
                const newSwimlaneColors = epics.map((_, i) => palette[i % palette.length]);
                const newTasks = epics.map((e, i) => {
                    const start = dateToBusinessDay(e.startDate, projectStartDate);
                    return {
                        id: e.id,
                        name: e.title,
                        start: start,
                        duration: Math.max(1, e.totalDays),
                        row: i,
                        progress: e.percentageComplete / 100
                    };
                });

                // Sort swimlanes by earliest task start date
                const rowMinStarts = newRowLabels.map((_, i) => {
                    const tasksInRow = newTasks.filter(t => t.row === i);
                    return tasksInRow.length > 0 ? Math.min(...tasksInRow.map(t => t.start)) : Infinity;
                });
                const sortedIndices = rowMinStarts.map((_, i) => i).sort((a, b) => rowMinStarts[a] - rowMinStarts[b]);
                const sortedRowLabels = sortedIndices.map(i => newRowLabels[i]);
                const sortedSwimlaneColors = sortedIndices.map(i => newSwimlaneColors[i]);
                const sortedTasks = newTasks.map(task => ({ ...task, row: sortedIndices.indexOf(task.row) }));

                setTasks(sortedTasks);
                setRowLabels(sortedRowLabels);
                setSwimlaneColors(sortedSwimlaneColors);
                setSettings({ ...settings, projectStartDate });
            } catch (err) {
                console.error('Import failed:', err);
                alert('Failed to import CSV. Check console for details.');
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const addTask = () => {
        let currentLabels = [...rowLabels];
        if (currentLabels.length === 0) {
            currentLabels = ["General Epics"];
            setRowLabels(currentLabels);
            setSwimlaneColors([palette[0]]);
        }
        const firstLaneTasks = tasks.filter(t => t.row === 0);
        let newStart = 0;
        if (firstLaneTasks.length > 0) {
            newStart = Math.max(...firstLaneTasks.map(t => t.start + t.duration));
        } else {
            newStart = Math.floor(containerScroll.left / dayWidth);
        }
        const newId = Date.now().toString();
        const newTask = {
            id: newId,
            name: 'New Epic',
            start: newStart,
            duration: 4,
            row: 0,
            progress: 0
        };
        setTasks([...tasks, newTask]);
        setEditingTaskId(newId);
        setEditingTaskIdValue(newId);
        setTaskJustAdded(true);
    };

    const updateTaskName = (id, name) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, name } : t));
    };

    const updateTaskId = (oldId, newId) => {
        if (newId.trim() === '') return;
        if (tasks.some(t => t.id === newId && t.id !== oldId)) {
            alert('Task ID must be unique. Please choose a different ID.');
            return;
        }
        setTasks(tasks.map(t => t.id === oldId ? { ...t, id: newId } : t));
        setEditingTaskIdValue(null);
    };

    const getTaskColor = (task) => {
        return swimlaneColors[task.row] || '#4b5563';
    };

    const updateRowLabel = (idx, label) => {
        const newLabels = [...rowLabels];
        newLabels[idx] = label;
        setRowLabels(newLabels);
    };

    const updateSwimlaneColor = (idx, color) => {
        const newColors = [...swimlaneColors];
        newColors[idx] = color;
        setSwimlaneColors(newColors);
    };

    const finalizeMove = (movedTask) => {
        setTasks(prevTasks => {
            return prevTasks.map(t => t.id === movedTask.id ? { ...movedTask } : t);
        });
    };

    const finalizeSwimlaneMove = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        setRowLabels(prevLabels => {
            const newLabels = [...prevLabels];
            const [moved] = newLabels.splice(fromIndex, 1);
            newLabels.splice(toIndex, 0, moved);
            return newLabels;
        });
        setSwimlaneColors(prevColors => {
            const newColors = [...prevColors];
            const [moved] = newColors.splice(fromIndex, 1);
            newColors.splice(toIndex, 0, moved);
            return newColors;
        });
        setTasks(prevTasks => {
            return prevTasks.map(task => {
                if (task.row === fromIndex) return { ...task, row: toIndex };
                if (fromIndex < toIndex) {
                    if (task.row > fromIndex && task.row <= toIndex) return { ...task, row: task.row - 1 };
                } else {
                    if (task.row >= toIndex && task.row < fromIndex) return { ...task, row: task.row + 1 };
                }
                return task;
            });
        });
    };

    const projectEndDay = useMemo(() => tasks.length > 0 ? Math.max(...tasks.map(t => t.start + t.duration)) : 0, [tasks]);

    const countBusinessDays = (startDate, endDate) => {
        let count = 0;
        const current = new Date(startDate);
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    const getBusinessDays = (startDate, count) => {
        const dates = [];
        let current = new Date(startDate);
        while (dates.length < count) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const dateToBusinessDay = (dateStr, projectStartDate) => {
        if (!dateStr) return 0;
        const start = new Date(projectStartDate);
        const end = new Date(dateStr);
        return countBusinessDays(start, end);
    };

    const takeSnapshot = () => {
        // Create a new container for the snapshot
        const snapshotContainer = document.createElement('div');
        snapshotContainer.style.position = 'absolute';
        snapshotContainer.style.top = '-9999px';
        snapshotContainer.style.left = '-9999px';
        snapshotContainer.style.width = (sidebarWidth + totalDaysCount * dayWidth) + 'px';
        snapshotContainer.style.height = (48 + rowLabels.length * 60) + 'px';
        snapshotContainer.style.overflow = 'visible';
        snapshotContainer.style.backgroundColor = '#ffffff';

        // Clone and position sidebar
        const sidebar = document.querySelector('.bg-white.border-r');
        const sidebarClone = sidebar.cloneNode(true);
        sidebarClone.style.position = 'absolute';
        sidebarClone.style.left = '0';
        sidebarClone.style.top = '0';
        sidebarClone.style.height = (48 + rowLabels.length * 60) + 'px';
        sidebarClone.style.zIndex = '1';
        // Reset the scroll transform to prevent overlap
        const swimlaneContainer = sidebarClone.querySelector('.swimlane-container');
        if (swimlaneContainer && swimlaneContainer.parentElement) {
            swimlaneContainer.parentElement.style.transform = 'translateY(0)';
        }
        // Adjust swimlane container to position label higher
        const containers = sidebarClone.querySelectorAll('.swimlane-container');
        containers.forEach(container => {
            container.style.justifyContent = 'flex-start';
            container.style.paddingTop = '8px';
            container.style.backgroundColor="white";
            container.style.position = 'relative';
        });
        const inners=sidebarClone.querySelectorAll('.swimlane-inner');
        inners.forEach(inner=>{
            inner.style.backgroundColor='none';
            inner.style.padding=0;
        })

        const sbuttons = sidebarClone.querySelectorAll('.swimlane-button');
        sbuttons.forEach(b => {
            b.style.display='none';
        })
        const labels = sidebarClone.querySelectorAll('.swimlane-label');
        labels.forEach(l=>{
            l.style.position='absolute';
            l.style.top=0;
            l.style.zIndex=2000;
            l.style.overflow='visible';
        })

        snapshotContainer.appendChild(sidebarClone);

        // Clone and position timeline
        const timeline = document.querySelector('.sticky.top-0.bg-slate-50.border-b');
        const timelineClone = timeline.cloneNode(true);
        timelineClone.style.position = 'absolute';
        timelineClone.style.left = sidebarWidth + 'px';
        timelineClone.style.top = '0';
        timelineClone.style.width = (totalDaysCount * dayWidth) + 'px';
        snapshotContainer.appendChild(timelineClone);

        // Clone and position grid
        const ganttGrid = document.querySelector('.gantt-grid');
        const gridClone = ganttGrid.cloneNode(true);
        gridClone.style.position = 'absolute';
        gridClone.style.left = sidebarWidth + 'px';
        gridClone.style.top = '48px';
        gridClone.style.width = (totalDaysCount * dayWidth) + 'px';
        gridClone.style.height = `${rowLabels.length * 60}px`;
        snapshotContainer.appendChild(gridClone);

        document.body.appendChild(snapshotContainer);

        html2canvas(snapshotContainer, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: sidebarWidth + totalDaysCount * dayWidth,
            height: 48 + rowLabels.length * 60
        }).then(canvas => {
            document.body.removeChild(snapshotContainer);
            const link = document.createElement('a');
            link.download = `epics-snapshot-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            document.body.removeChild(snapshotContainer);
            console.error('Snapshot failed:', err);
        });
    };

    const startDate = useMemo(() => new Date(settings.projectStartDate || '2026-01-01'), [settings.projectStartDate]);
    const businessDays = useMemo(() => getBusinessDays(startDate, Math.max(90, projectEndDay)), [startDate, projectEndDay]);
    const totalDaysCount = businessDays.length;

    const monthGroups = useMemo(() => {
        const groups = [];
        let currentMonth = null;
        let count = 0;
        businessDays.forEach((date, i) => {
            const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (month !== currentMonth) {
                if (currentMonth) {
                    groups.push({ month: currentMonth, days: count });
                }
                currentMonth = month;
                count = 1;
            } else {
                count++;
            }
        });
        if (currentMonth) {
            groups.push({ month: currentMonth, days: count });
        }
        return groups;
    }, [businessDays]);

    const currentDay = useMemo(() => {
        if (!settings.projectStartDate) return -1;
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        return countBusinessDays(startDate, endDate);
    }, [startDate]);

    const getDayTooltip = (day) => {
        const date = businessDays[day];
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let tooltip = `${formatted}`;
        rowLabels.forEach((label, rowIndex) => {
            const tasksOnDay = tasks.filter(t => t.row === rowIndex && t.start <= day && t.start + t.duration > day);
            if (tasksOnDay.length > 0) {
                tooltip += `\n${label}: ${tasksOnDay.map(t => t.name).join(', ')}`;
            }
        });
        return tooltip;
    };

    return html`
        <div id="gantt-container" class="flex flex-col h-screen overflow-auto text-slate-800">
            <${HeaderEpic}
                zoom=${zoom}
                setZoom=${setZoom}
                setIsSettingsOpen=${setIsSettingsOpen}
                fileInputRef=${fileInputRef}
                importData=${importData}
                takeSnapshot=${takeSnapshot}
                addTask=${addTask}
            />

            <div class="flex-1 flex overflow-visible relative" ref=${containerRef}>
                <${SidebarEpic}
                    rowLabels=${rowLabels}
                    tasks=${tasks}
                    businessDays=${businessDays}
                    sidebarWidth=${sidebarWidth}
                    setSidebarWidth=${setSidebarWidth}
                    containerScroll=${containerScroll}
                    editingRowIdx=${editingRowIdx}
                    setEditingRowIdx=${setEditingRowIdx}
                    confirmDeleteRowIdx=${confirmDeleteRowIdx}
                    setConfirmDeleteRowIdx=${setConfirmDeleteRowIdx}
                    updateRowLabel=${updateRowLabel}
                    swimlaneMenuOpen=${swimlaneMenuOpen}
                    setSwimlaneMenuOpen=${setSwimlaneMenuOpen}
                    setSwimlaneInfoOpen=${setSwimlaneInfoOpen}
                    setCreateGapModal=${setCreateGapModal}
                    setGapAfterTaskId=${setGapAfterTaskId}
                    setGapDate=${setGapDate}
                    finalizeSwimlaneMove=${finalizeSwimlaneMove}
                    swimlaneColors=${swimlaneColors}
                    updateSwimlaneColor=${updateSwimlaneColor}
                />

                <div class="flex-1 overflow-visible relative bg-white" onScroll=${(e) => setContainerScroll({ left: e.target.scrollLeft, top: e.target.scrollTop })}>
                    <${TimelineHeader}
                        monthGroups=${monthGroups}
                        businessDays=${businessDays}
                        dayWidth=${dayWidth}
                        currentDay=${currentDay}
                        getDayTooltip=${getDayTooltip}
                    />

                    <${GanttGridEpic}
                        tasks=${tasks}
                        dayWidth=${dayWidth}
                        rowLabelsLength=${rowLabels.length}
                        totalDaysCount=${totalDaysCount}
                        currentDay=${currentDay}
                        containerScroll=${containerScroll}
                        sidebarWidth=${sidebarWidth}
                        finalizeMove=${finalizeMove}
                        onDelete=${(task) => setTasks(tasks.filter(t => t.id !== task.id))}
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
                        swimlaneColors=${swimlaneColors}
                    />
                </div>
            </div>

            <${Footer}
                tasksLength=${tasks.length}
                projectEndDay=${projectEndDay}
                setIsHelpOpen=${setIsHelpOpen}
            />

            <${Modals}
                isHelpOpen=${isHelpOpen}
                setIsHelpOpen=${setIsHelpOpen}
                isSettingsOpen=${isSettingsOpen}
                setIsSettingsOpen=${setIsSettingsOpen}
                settings=${settings}
                setSettings=${setSettings}
                swimlaneInfoOpen=${swimlaneInfoOpen}
                setSwimlaneInfoOpen=${setSwimlaneInfoOpen}
                rowLabels=${rowLabels}
                tasks=${tasks}
                businessDays=${businessDays}
                confirmRemoveGaps=${confirmRemoveGaps}
                setConfirmRemoveGaps=${setConfirmRemoveGaps}
                createGapModal=${createGapModal}
                setCreateGapModal=${setCreateGapModal}
                gapAfterTaskId=${gapAfterTaskId}
                setGapAfterTaskId=${setGapAfterTaskId}
                gapDate=${gapDate}
                setGapDate=${setGapDate}
                confirmPivot=${confirmPivot}
                setConfirmPivot=${setConfirmPivot}
                applyPivot=${() => {}}
            />
        </div>
    `;
};

render(html`<${App} />`, document.getElementById('app'));