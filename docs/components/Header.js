import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const Header = ({ zoom, setZoom, confirmPivot, setIsSettingsOpen, exportData, fileInputRef, importData, takeSnapshot, addTask }) => {
    return html`
        <header class="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm" style="position: sticky; top: 0; left: 0; z-index: 50;">
            <div class="flex items-center gap-3">
                <div class="bg-indigo-600 p-2 rounded-lg shadow-inner">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h2a2 2 0 00-2 2"></path></svg>
                </div>
                <h1 class="text-xl font-bold tracking-tight text-slate-900 font-serif italic">Gantt Believe It!</h1>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button onClick=${() => setZoom(Math.max(0.4, zoom - 0.2))} class="px-3 py-1 hover:bg-white rounded-md transition-all text-xs font-bold active:scale-95">Zoom Out</button>
                    <span class="px-3 text-xs font-black text-indigo-600 w-16 text-center">${Math.round(zoom * 100)}%</span>
                    <button onClick=${() => setZoom(Math.min(2.5, zoom + 0.2))} class="px-3 py-1 hover:bg-white rounded-md transition-all text-xs font-bold active:scale-95">Zoom In</button>
                </div>
                <div class="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button onClick=${() => confirmPivot(true)} class="px-3 py-1 hover:bg-white rounded-md transition-all text-xs font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Pivot</button>
                </div>
                <button onClick=${() => setIsSettingsOpen(true)} class="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">⚙ Settings</button>
                <div class="h-8 w-px bg-slate-200 mx-1"></div>
                <div class="flex gap-2">
                    <button onClick=${exportData} class="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">Export</button>
                    <button onClick=${() => fileInputRef.current.click()} class="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">Import</button>
                    <input type="file" ref=${fileInputRef} style="display: none" accept=".json" onChange=${importData} />
                    <button onClick=${takeSnapshot} class="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">Snapshot</button>
                    <button onClick=${addTask} class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">+ Add Task</button>
                </div>
            </div>
        </header>
    `;
};

export default Header;