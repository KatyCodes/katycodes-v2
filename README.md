# KatyCodes v2.0

Katy Henning's terminal-inspired portfolio, built as a lightweight static site for DreamHost. It uses semantic HTML, accessible CSS, and dependency-free TypeScript—no server, database, framework runtime, or build tooling is needed on the host.

## Highlights

- Authentic interactive terminal with history, tab completion, keyboard shortcuts, typed output, and commands such as `man katy`, `uname -a`, and `git log --oneline`
- Portfolio, full résumé, downloadable PDF/DOCX, contact details, and GitHub links
- Light and midnight themes with WCAG AA contrast, reduced-motion support, visible focus states, and screen-reader announcements
- Responsive layout, optimized WebP project images, social preview metadata, sitemap, robots file, custom 404, and no-JavaScript fallback
- A few understated Easter eggs—including the classic Konami code

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Vite prints the local URL. To run the automated checks and create the production site:

```bash
npm test
npm run build
```

The finished static site is written to `dist/`.

## Terminal commands

Start with `help`. Core commands include `about`, `projects`, `resume`, `contact`, `clear`, `history`, `pwd`, `theme`, `man katy`, `uname -a`, and `git log --oneline`. Use Tab to complete a command, Up/Down for history, Ctrl+L to clear, and Ctrl+C to cancel.

## DreamHost deployment

Upload the **contents** of `dist/` to the web directory configured for `katycodes.com`. The build copies `.htaccess` into `dist/`; make sure the upload includes that hidden file. It provides the custom 404, an HTTPS fallback redirect, and a permanent `www` → apex-domain redirect.

Enable a certificate and HTTPS redirect in DreamHost's panel as the primary SSL configuration. The site is entirely static, so DreamHost does not need Node.js or TypeScript—the browser receives compiled HTML, CSS, JavaScript, images, and documents only.

## Project structure

- `index.html` — page structure, metadata, and no-JavaScript fallback
- `app/client.ts` — terminal and theme interactions
- `app/terminal.ts` — command content
- `app/shell.ts` — history, completion, and Konami sequence logic
- `app/globals.css` — responsive and accessible visual design
- `public/` — production assets, résumé files, SEO files, 404, and DreamHost configuration
- `tests/` — Node-based behavior and accessibility checks
