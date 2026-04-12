import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

const Footer = ({ tasksLength, projectEndDay, setIsHelpOpen }) => {
    return html`
        <footer class="bg-white border-t px-6 py-2 text-[12px] text-slate-400 flex justify-between uppercase tracking-widest font-bold" style="position: sticky; bottom: 0; left: 0; z-index: 50;">
            <div class="flex gap-8 items-center">
                <span>Tasks: <span class="text-slate-900">${tasksLength}</span></span>
                <span>Project Span: <span class="text-slate-900">${projectEndDay} Days</span></span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-emerald-500 font-black">● Auto-Saving</span>
                <button onClick=${() => setIsHelpOpen(true)} class="bg-slate-800 text-white px-3 py-1 rounded hover:bg-black transition-colors">Help</button>
            </div>
        </footer>
    `;
};

export default Footer;