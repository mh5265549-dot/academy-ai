# High-Gen Runner

A standalone endless runner game — kept separate from the Academy AI (LMS) project in this repo, no shared code or dependencies.

Dodge obstacles as the run speeds up. Every 500 points you advance a **Generation**: the pace increases, obstacles get denser, flying obstacles start appearing, and the color palette shifts.

## Play it

No build step required — it's plain HTML/CSS/JS.

```bash
cd high-gen-runner
python3 -m http.server 8080
# open http://localhost:8080
```

Or just open `index.html` directly in a browser.

## Controls

- **Space** / **Arrow Up** — Jump
- **Arrow Down** — Duck (hold)
- **Touch**: on-screen Jump/Duck buttons, or tap the top half of the screen to jump and hold the bottom half to duck

Your best score is saved locally in the browser (`localStorage`).
