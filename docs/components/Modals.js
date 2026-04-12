import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const Modals = ({
    isHelpOpen,
    setIsHelpOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    setSettings,
    swimlaneInfoOpen,
    setSwimlaneInfoOpen,
    rowLabels,
    tasks,
    businessDays,
    confirmRemoveGaps,
    setConfirmRemoveGaps,
    createGapModal,
    setCreateGapModal,
    gapAfterTaskId,
    setGapAfterTaskId,
    gapDate,
    setGapDate,
    confirmPivot,
    setConfirmPivot,
    applyPivot
}) => {
    return html`
        ${isHelpOpen && html`
            <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setIsHelpOpen(false)}>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                    <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-900">User Guide & JSON Schema</h2>
                        <button onClick=${() => setIsHelpOpen(false)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                    </div>
                    <div class="p-6 overflow-y-auto space-y-6">
                        <section>
                            <h3 class="text-indigo-600 font-bold uppercase text-xs tracking-widest mb-2">Instructions</h3>
                            <ul class="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li><span class="font-bold">Move:</span> Drag the middle of a task bar.</li>
                                <li><span class="font-bold">Resize:</span> Drag the left or right edge of a task bar.</li>
                                <li><span class="font-bold">Reorder Swimlanes:</span> Drag swimlane labels in the sidebar to reorder them.</li>
                                <li><span class="font-bold">Pivot View:</span> Click the "Pivot" button to convert color labels to swimlanes and swimlanes to color labels.</li>
                                <li><span class="font-bold">Minimum Size:</span> Tasks cannot be smaller than 1 day.</li>
                                <li><span class="font-bold">Overlaps:</span> Tasks can now overlap, with smaller tasks appearing on top.</li>
                                <li><span class="font-bold">Management:</span> Add swimlanes or tasks, and click items to edit names.</li>
                            </ul>
                        </section>
                        <section><h3 class="text-indigo-600 font-bold uppercase text-xs tracking-widest mb-2">Repo can be found at <a href="https://github.com/andrewfulrich/GanttBelieveIt">github.com/andrewfulrich/GanttBelieveIt</a></h3></section>
                        <section>
                            <h3 class="text-indigo-600 font-bold uppercase text-xs tracking-widest mb-2">Import/Export JSON Format</h3>
                            <pre class="bg-slate-900 text-indigo-300 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed shadow-inner mt-4">
${JSON.stringify({
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
                    "colorLabel": { "type": "string", "description": "ColorLabel ID or empty string for none" }
                },
                "required": ["id", "name", "start", "duration", "row", "colorLabel"]
            }
        },
        "rowLabels": {
            "type": "array",
            "items": { "type": "string" }
        },
        "colorLabels": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "color": { "type": "string", "description": "Hex color string" }
                },
                "required": ["id", "name", "color"]
            }
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
    "required": ["tasks", "rowLabels", "colorLabels", "settings"]
}, null, 2)}
                            </pre>
                        </section>
                    </div>
                    <div class="px-6 py-4 border-t bg-slate-50 flex justify-end">
                        <button onClick=${() => setIsHelpOpen(false)} class="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">Got it</button>
                    </div>
                </div>
            </div>
        `}

        ${isSettingsOpen && html`
            <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setIsSettingsOpen(false)}>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                    <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-900">Settings</h2>
                        <button onClick=${() => setIsSettingsOpen(false)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" checked=${settings.showTitles} onChange=${(e) => setSettings({ ...settings, showTitles: e.target.checked })} />
                                <span class="text-sm font-bold text-slate-700">Show Task Titles</span>
                            </label>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Project Start Date</label>
                            <input type="date" value=${settings.projectStartDate} onChange=${(e) => setSettings({ ...settings, projectStartDate: e.target.value })} class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div class="px-6 py-4 border-t bg-slate-50 flex justify-end">
                        <button onClick=${() => setIsSettingsOpen(false)} class="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        `}

        ${swimlaneInfoOpen !== null && (() => {
            const laneTasks = tasks.filter(t => t.row === swimlaneInfoOpen).sort((a,b)=>a.start-b.start);
            const totalStories = laneTasks.length;
            const taskStartDate = totalStories > 0 ? businessDays[Math.min(...laneTasks.map(t => t.start))] : null;
            const taskEndDate = totalStories > 0 ? businessDays[Math.max(...laneTasks.map(t => t.start + t.duration - 1))] : null;
            const occupiedDays = new Set();
            laneTasks.forEach(t => {
                for(let d=t.start; d<t.start+t.duration; d++) occupiedDays.add(d);
            });
            const emptyRanges = [];
            let inGap = false;
            let gapStart = null;
            for(let d=0; d<businessDays.length; d++){
                if(!occupiedDays.has(d)){
                    if(!inGap){ gapStart = d; inGap=true; }
                }else{
                    if(inGap){
                        const start = businessDays[gapStart].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const end = businessDays[d-1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        emptyRanges.push(`${start}-${end}`);
                        inGap=false;
                    }
                }
            }
            if(inGap) {
                const start = businessDays[gapStart].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const end = businessDays[businessDays.length-1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                emptyRanges.push(`${start}-${end}`);
            }
            return html`
                <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setSwimlaneInfoOpen(null)}>
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                        <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h2 class="text-lg font-bold text-slate-900">Swimlane Info</h2>
                            <button onClick=${() => setSwimlaneInfoOpen(null)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div><strong>Swimlane:</strong> ${rowLabels[swimlaneInfoOpen]}</div>
                            <div><strong>Total Stories:</strong> ${totalStories}</div>
                            <div><strong>Start Day:</strong> ${taskStartDate ? taskStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                            <div><strong>End Day:</strong> ${taskEndDate ? taskEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                            <div><strong>Empty Day Ranges:</strong> ${emptyRanges.length > 0 ? emptyRanges.join(', ') : 'None'}</div>
                        </div>
                        <div class="px-6 py-4 border-t bg-slate-50 flex justify-end">
                            <button onClick=${() => setSwimlaneInfoOpen(null)} class="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            `;
        })()}

        ${confirmRemoveGaps !== null && html`
            <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setConfirmRemoveGaps(null)}>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                    <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-900">Confirm Action</h2>
                        <button onClick=${() => setConfirmRemoveGaps(null)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-slate-600">This action will move stories up in the swimlane to eliminate any 'gap days', or days that have no tasks. This will affect the entire swimlane. Are you sure you want to do this?</p>
                    </div>
                    <div class="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button onClick=${() => setConfirmRemoveGaps(null)} class="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                        <button onClick=${() => {
                            setTasks(prevTasks => {
                                console.log('what')
                                const laneTasks = prevTasks.filter(t => t.row === confirmRemoveGaps).sort((a,b)=>a.start-b.start);
                                if(laneTasks.length <=1) return prevTasks;
                                let prevEnd = laneTasks[0].start + laneTasks[0].duration;
                                console.log('laneTasks', laneTasks)
                                console.log('prevEnd',prevEnd)
                                console.log('prevTasks',prevTasks)
                                return prevTasks.map(t => {
                                    if(t.row !== confirmRemoveGaps) return t;
                                    const index = laneTasks.findIndex(lt => lt.id === t.id);
                                    if(index === 0) return t;
                                    const newStart = prevEnd;
                                    prevEnd = newStart + t.duration;
                                    return { ...t, start: newStart };
                                });
                            });
                            setConfirmRemoveGaps(null);
                        }} class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700">Yes, Remove Gaps</button>
                    </div>
                </div>
            </div>
        `}

        ${createGapModal !== null && (() => {
            const laneTasks = tasks.filter(t => t.row === createGapModal).sort((a,b)=>a.start-b.start);
            return html`
                <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setCreateGapModal(null)}>
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                        <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h2 class="text-lg font-bold text-slate-900">Push Tasks</h2>
                            <button onClick=${() => setCreateGapModal(null)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Push tasks starting with:</label>
                                <select value=${gapAfterTaskId || ''} onChange=${(e) => { setGapAfterTaskId(e.target.value); const task = laneTasks.find(t => t.id === e.target.value); if (task) { const nextDay = businessDays[task.start + 1]; setGapDate(nextDay ? nextDay.toISOString().split('T')[0] : ''); } else setGapDate(''); }} class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select a story...</option>
                                    ${laneTasks.map(task => html`<option value=${task.id}>${task.name} (ID: ${task.id})</option>`)}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Push to date:</label>
                                <input type="date" value=${gapDate} onChange=${(e) => setGapDate(e.target.value)} min=${gapAfterTaskId ? (() => { const task = laneTasks.find(t => t.id === gapAfterTaskId); const nextDay = businessDays[task.start + 1]; return nextDay ? nextDay.toISOString().split('T')[0] : ''; })() : ''} class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div class="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2">
                            <button onClick=${() => setCreateGapModal(null)} class="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                            <button onClick=${() => {
                                if (!gapAfterTaskId || !gapDate) return;
                                const selectedTask = tasks.find(t => t.id === gapAfterTaskId);
                                const selectedDayIndex = countBusinessDays(startDate, new Date(gapDate + 'T00:00:00')) - 1;
                                if (selectedDayIndex <= selectedTask.start) return; // prevent moving back
                                const offset = selectedDayIndex - selectedTask.start;
                                setTasks(prevTasks => {
                                    const rowTasks = prevTasks.filter(t => t.row === selectedTask.row).sort((a,b)=>a.start-b.start);
                                    const taskIndex = rowTasks.findIndex(t => t.id === gapAfterTaskId);
                                    return prevTasks.map(t => {
                                        if (t.row !== selectedTask.row) return t;
                                        const index = rowTasks.findIndex(rt => rt.id === t.id);
                                        if (index >= taskIndex) {
                                            return { ...t, start: t.start + offset };
                                        }
                                        return t;
                                    });
                                });
                                setCreateGapModal(null);
                            }} class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700" disabled=${!gapAfterTaskId || !gapDate}>Push Tasks</button>
                        </div>
                    </div>
                </div>
            `;
        })()}

        ${confirmPivot && html`
            <div class="fixed inset-0 z-[13000] flex items-center justify-center p-6 modal-overlay" onClick=${() => setConfirmPivot(false)}>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick=${e => e.stopPropagation()}>
                    <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-900">Confirm Pivot</h2>
                        <button onClick=${() => setConfirmPivot(false)} class="text-slate-400 hover:text-slate-600 text-2xl leading-none">✖</button>
                    </div>
                    <div class="p-6 space-y-4">
                        <p class="text-sm text-slate-600">
                            This action will convert color labels to swimlanes and swimlanes to color labels.
                        </p>
                        <p class="text-sm text-slate-600">
                            It is recommended to export your data first to preserve the current state.
                        </p>
                        <p class="text-sm font-bold text-rose-600">
                            Are you sure you want to proceed?
                        </p>
                    </div>
                    <div class="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button onClick=${() => setConfirmPivot(false)} class="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                        <button onClick=${() => {
                            applyPivot();
                            setConfirmPivot(false);
                        }} class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700">Confirm Pivot</button>
                    </div>
                </div>
            </div>
        `}
    `;
};

export default Modals;