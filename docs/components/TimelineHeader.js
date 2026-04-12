import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const TimelineHeader = ({ monthGroups, businessDays, dayWidth, currentDay, getDayTooltip }) => {
    return html`
        <div class="sticky top-0 bg-slate-50 border-b shadow-sm">
            <div class="flex border-b border-slate-200">
                ${monthGroups.map(group => html`
                    <div style="width: ${dayWidth * group.days}px" class="flex-shrink-0 border-r border-slate-200 flex items-center justify-center text-[9px] font-black text-indigo-600 uppercase tracking-widest h-5 bg-indigo-50/30">${group.month}</div>
                `)}
            </div>
            <div class="flex h-7">${Array.from({ length: businessDays.length }, (_, day) => {
                const date = businessDays[day];
                const formatted = date.toLocaleDateString('en-US', { day: 'numeric' });
                return html`<div key=${day} style="width: ${dayWidth}px" class="flex-shrink-0 border-r border-slate-200 flex flex-col items-center justify-center text-[9px] font-bold ${day < currentDay ? 'bg-slate-300 text-slate-500' : 'text-slate-400'}" title=${getDayTooltip(day)}><span>${formatted}</span></div>`;
            })}</div>
        </div>
    `;
};

export default TimelineHeader;