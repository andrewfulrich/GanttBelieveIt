# Gantt Believe It!

A simple, lightweight Gantt chart application that runs entirely in your browser. Plan projects with drag-and-drop task management, multiple swimlanes, and intuitive scheduling.

Check it out at https://andrewfulrich.github.io/GanttBelieveIt/

## Features

- **Drag & Drop Tasks**: Easily move and resize tasks on the timeline
- **Multiple Swimlanes**: Organize tasks into different categories or teams
- **Zoom Controls**: Adjust timeline zoom from 40% to 250%
- **Import/Export**: Save and load project data as JSON files
- **Local Storage**: Automatic saving to your browser's local storage
- **Responsive Design**: Clean, modern interface that works on desktop and mobile

## Privacy & Security

This app stores **zero data server-side**. Everything runs locally in your browser:

- Project data is saved to your browser's `localStorage`
- No account required
- No data sent to any servers
- No need to trust any company with your project information

## Performance

Built with performance in mind:
- Lightweight bundle using Preact (minimal React alternative)
- No heavy dependencies or frameworks
- Fast rendering even with large projects
- Minimal memory footprint

## Hosting

This is a static site that can be hosted anywhere:
- GitHub Pages (configured to serve from `docs/` folder)
- Netlify, Vercel, or any static hosting service
- Even locally by opening `docs/index.html` in your browser

## Local Development

If you want to run a local server (optional):

```bash
npm install
npm start
```

Then visit `http://localhost:3000`

## Usage

1. **Add Tasks**: Click the "+ Add Task" button
2. **Edit Tasks**: Click on any task to rename it or change its color
3. **Move Tasks**: Drag the middle of a task bar to reposition
4. **Resize Tasks**: Drag the edges of a task bar to change duration
5. **Add Swimlanes**: Use the "+ Add Swimlane" button to create new categories
6. **Zoom**: Use the zoom controls in the header
7. **Import/Export**: Use the buttons to save/load project data

## Data Format

Projects are stored as JSON with this schema:

```json
{
  "tasks": [
    {
      "id": "string",
      "name": "string",
      "start": "number",
      "duration": "number",
      "row": "number",
      "color": "string"
    }
  ],
  "rowLabels": ["string"]
}
```

## License

ISC License