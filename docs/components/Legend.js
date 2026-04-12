import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const Legend = ({ colorLabels, editingColorLabelId, setEditingColorLabelId, updateColorLabelName, updateColorLabelColor, setColorLabels, setTasks }) => {
    return html`
        <div class="fixed bottom-20 right-4 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-40 max-w-xs">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-bold text-slate-700">Color Labels</h3>
                <button onClick=${() => {
                    const newColorLabel = {
                        id: `colorLabel${Date.now()}`,
                        name: 'New Color Label',
                        color: '#6366f1'
                    };
                    setColorLabels([...colorLabels, newColorLabel]);
                }} class="text-indigo-600 hover:text-indigo-800 text-sm font-bold">+</button>
            </div>
            <div class="space-y-1 max-h-48 overflow-y-auto">
                ${colorLabels.map(colorLabel => html`
                    <div key=${colorLabel.id} class="flex items-center gap-2 group">
                        <input
                            type="color"
                            value=${colorLabel.color}
                            onInput=${(e) => updateColorLabelColor(colorLabel.id, e.target.value)}
                            class="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                            title="Change color label color"
                        />
                        ${editingColorLabelId === colorLabel.id
                            ? html`<input
                                autoFocus
                                class="text-xs border border-slate-300 rounded px-1 py-0.5 flex-1 min-w-0"
                                value=${colorLabel.name}
                                onInput=${(e) => updateColorLabelName(colorLabel.id, e.target.value)}
                                onKeyDown=${(e) => e.key === 'Enter' && setEditingColorLabelId(null)}
                                onBlur=${() => setEditingColorLabelId(null)}
                            />`
                            : html`<span
                                class="text-xs font-medium text-slate-700 flex-1 truncate cursor-pointer"
                                onClick=${() => setEditingColorLabelId(colorLabel.id)}
                                title="Click to edit color label name"
                            >${colorLabel.name}</span>`
                        }
                        <button onClick=${() => {
                            if (confirm('Delete this color label? Tasks using it will become "None".')) {
                                setColorLabels(colorLabels.filter(e => e.id !== colorLabel.id));
                                setTasks(tasks => tasks.map(t => t.colorLabel === colorLabel.id ? { ...t, colorLabel: '' } : t));
                            }
                        }} class="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 text-xs">×</button>
                    </div>
                `)}
                ${colorLabels.length === 0 && html`<div class="text-xs text-slate-500 italic">No color labels yet</div>`}
            </div>
        </div>
    `;
};

export default Legend;