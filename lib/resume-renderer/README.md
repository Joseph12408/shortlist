# HTML/CSS → PDF Resume Renderer

A lightweight, production-ready pipeline for generating ATS-safe, professional resumes using Node.js, Puppeteer, and plain HTML/CSS.

## 📂 Project Structure

```
resume-renderer/
├── templates/
│   └── base.html       # Single-column, ATS-safe HTML structure
├── styles/
│   └── base.css        # CSS variables & typography
├── render.js           # Main script (injects data -> generates PDF)
├── package.json        # Dependencies (puppeteer)
└── README.md           # Documentation
```

## 🚀 How to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate PDF**
   ```bash
   node render.js
   ```

   This will create a `resume.pdf` file in the root directory.

## 🎨 Design System & Customization

The design is controlled entirely by CSS variables in `styles/base.css`.

**To change the look (e.g., via AI tokens):**
Simply update the `:root` variables.

```css
:root {
    --heading-font: 'Inter', sans-serif;
    --accent-color: #0F766E; /* Teal */
    --section-spacing: 32px;
}
```

## 🤖 AI Integration Strategy

To connect this with an AI Design Engine:

1. **Generate Tokens**: Have the AI output JSON like `{ "accentColor": "#...", "font": "..." }`.
2. **Inject Tokens**: In `render.js`, before setting the content, produce a `<style>:root { ... }</style>` block dynamically based on the AI response.
3. **Render**: The HTML structure structure remains exactly the same; only the tokens change.

## 📄 ATS Safety Features

- **Single Column Layout**: Ensures correct parsing order by older ATS parsers.
- **Text-Based**: No crucial information locked in images or complex grids.
- **Standard Headings**: Uses semantic `<h1>`, `<h2>` tags for sections.
