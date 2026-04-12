import { h } from 'https://esm.sh/preact';
import { useRef, useCallback } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const ROW_HEIGHT = 60;

const SidebarEpic = ({
    rowLabels,
    tasks,
    businessDays,
    sidebarWidth,
    setSidebarWidth,
    containerScroll,
    editingRowIdx,
    setEditingRowIdx,
    confirmDeleteRowIdx,
    setConfirmDeleteRowIdx,
    updateRowLabel,
    swimlaneMenuOpen,
    setSwimlaneMenuOpen,
    setSwimlaneInfoOpen,
    setCreateGapModal,
    setGapAfterTaskId,
    setGapDate,
    finalizeSwimlaneMove,
    swimlaneColors,
    updateSwimlaneColor
}) => {
    const swimlaneDragInfo = useRef({
        index: null, startY: 0, offsetY: 0, hasMoved: false, newIndex: null
    });

    const handleSwimlaneMouseMove = useCallback((e) => {
        if (swimlaneDragInfo.current.index === null) return;
        const dy = Math.abs(e.clientY - swimlaneDragInfo.current.startY);
        if (dy > 3) swimlaneDragInfo.current.hasMoved = true;
        if (!swimlaneDragInfo.current.hasMoved) return;

        const sidebarRect = document.querySelector('.bg-white.border-r').getBoundingClientRect();
        const mouseY = e.clientY - sidebarRect.top + containerScroll.top;
        const newIndex = Math.max(0, Math.min(rowLabels.length - 1, Math.floor(mouseY / ROW_HEIGHT)));
        swimlaneDragInfo.current.newIndex = newIndex;
        // Note: No setDraggingSwimlane here, as it's localized
    }, [rowLabels.length, containerScroll.top]);

    const handleSwimlaneMouseUp = useCallback(() => {
        if (swimlaneDragInfo.current.index !== null) {
            if (swimlaneDragInfo.current.hasMoved && swimlaneDragInfo.current.newIndex !== null) {
                finalizeSwimlaneMove(swimlaneDragInfo.current.index, swimlaneDragInfo.current.newIndex);
            }
        }
        swimlaneDragInfo.current.index = null;
        swimlaneDragInfo.current.hasMoved = false;
        swimlaneDragInfo.current.newIndex = null;
        window.removeEventListener('mousemove', handleSwimlaneMouseMove);
        window.removeEventListener('mouseup', handleSwimlaneMouseUp);
    }, [handleSwimlaneMouseMove, finalizeSwimlaneMove]);

    const onSwimlaneMouseDown = (e, index) => {
        if (e.target.closest('.swimlane-menu')) return; // Don't start drag if clicking menu
        swimlaneDragInfo.current = {
            index, startY: e.clientY, offsetY: e.clientY - e.currentTarget.getBoundingClientRect().top, hasMoved: false
        };
        window.addEventListener('mousemove', handleSwimlaneMouseMove);
        window.addEventListener('mouseup', handleSwimlaneMouseUp);
    };

    const startSidebarResize = (e) => {
        setIsResizingSidebar(true);
        document.body.style.userSelect = 'none';
        const handleResize = (e) => {
            const newWidth = Math.max(150, Math.min(600, e.clientX));
            setSidebarWidth(newWidth);
        };
        const stopResize = () => {
            setIsResizingSidebar(false);
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResize);
        };
        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResize);
    };

    return html`
        <div class="bg-white border-r flex-shrink-0 flex flex-col shadow-xl relative" style="position: sticky; left: 0; z-index: 12000; width: ${sidebarWidth}px;">
            <div class="h-12 border-b bg-slate-50 flex items-center px-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">Swimlanes</div>
            <div class="flex-1 overflow-y-auto overflow-x-hidden relative">
                <div onMouseDown=${startSidebarResize} class="absolute right-0 top-0 bottom-0 w-4 bg-gray-100 cursor-ew-resize z-10"></div>
                <div style="transform: translateY(${-containerScroll.top}px)">
                    ${rowLabels.map((label, i) => {
                        const laneTasks = tasks.filter(t => t.row === i);
                        const hasTasks = laneTasks.length > 0;
                        const taskStartDate = hasTasks ? businessDays[Math.min(...laneTasks.map(t => t.start))] : null;
                        const taskEndDate = hasTasks ? businessDays[Math.max(...laneTasks.map(t => t.start + t.duration - 1))] : null;
                        return html`
                            <div key=${i} data-row-idx=${i} onMouseDown=${(e) => onSwimlaneMouseDown(e, i)} class="h-[60px] border-b flex flex-col justify-center px-4 group hover:bg-indigo-50/50 transition-colors relative cursor-move">
                                ${editingRowIdx === i
                                    ? html`<div class="flex flex-col w-full">
                                        <input autoFocus onFocus=${e => e.target.select()} class="editable-input text-sm font-bold mb-1" value=${label} onInput=${(e) => updateRowLabel(i, e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && setEditingRowIdx(null)} />
                                        <button onMouseDown=${(e) => { e.stopPropagation(); setConfirmDeleteRowIdx(i); }} class="text-[9px] text-rose-500 font-bold hover:underline w-fit">🗑️ Delete Lane</button>
                                    </div>`
                                    : html`<div class="swimlane-container flex-1 flex items-center justify-between cursor-pointer select-none py-1">
                                        <div onClick=${() => setEditingRowIdx(i)} class="swimlane-inner flex flex-col">
                                            <span class="swimlane-label text-sm font-bold text-slate-700 truncate">${label}</span>
                                            <span class="swimlane-days text-[12px] text-slate-400 font-medium bg-none">${hasTasks ? `${taskStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${taskEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No tasks scheduled'}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <input type="color" value=${swimlaneColors[i] || '#4b5563'} onChange=${(e) => updateSwimlaneColor(i, e.target.value)} class="native-color-picker" />
                                            <button onClick=${(e) => { e.stopPropagation(); setSwimlaneMenuOpen(i); }} class="swimlane-button font-bold text-slate-400 hover:text-slate-600 p-1 rounded">...</button>
                                        </div>
                                    </div>`
                                }
                                ${confirmDeleteRowIdx === i && html`<div class="swimlane-confirm absolute inset-0 bg-white/95 z-50 flex items-center justify-center gap-2 px-2">
                                    <span class="text-[12px] font-bold text-slate-500 uppercase">Delete?</span>
                                    <button onMouseDown=${() => {
                                        const newLabels = rowLabels.filter((_, idx) => idx !== i);
                                        setRowLabels(newLabels);
                                        setTasks(tasks.filter(t => t.row !== i).map(t => t.row > i ? { ...t, row: t.row - 1 } : t));
                                        setConfirmDeleteRowIdx(null);
                                        setEditingRowIdx(null);
                                    }} class="bg-rose-600 text-white text-[12px] px-2 py-1 rounded">Yes</button>
                                    <button onMouseDown=${() => setConfirmDeleteRowIdx(null)} class="bg-slate-200 text-slate-700 text-[12px] px-2 py-1 rounded">No</button>
                                </div>`}
                                ${swimlaneMenuOpen === i && html`<div class="swimlane-menu absolute right-2 top-2 bg-white border shadow rounded p-1 z-10">
                                    <button onClick=${() => { setSwimlaneMenuOpen(null); setSwimlaneInfoOpen(i); }} class="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100">Info</button>
<button onClick=${() => { setSwimlaneMenuOpen(null); setCreateGapModal(i); setGapAfterTaskId(null); setGapDate(''); }} class="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100">Push Tasks in Swimlane</button>
                                    <button onClick=${() => { setSwimlaneMenuOpen(null); setConfirmRemoveGaps(i); }} class="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100">Remove Gaps in Swimlane</button>
                                </div>`}
                            </div>`;
                    })}
                    <button onClick=${() => { const l = `New Lane ${rowLabels.length+1}`; setRowLabels([...rowLabels, l]); setEditingRowIdx(rowLabels.length); }} class="w-full h-[60px] flex items-center justify-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors gap-2"><span class="text-lg">+</span> Add Swimlane</button>
                </div>
            </div>
        </div>
    `;
};

export default SidebarEpic;