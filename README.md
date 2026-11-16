# Global Pathways Foundation — website

A static, multi-page site for Global Pathways Foundation. No build step.

## Run it

Open `index.html` in a browser, or serve the folder with any static server.

## Publish on GitHub Pages

1. Push these files to the root of a repository.
2. In the repository: Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/<repository>/`.

## Structure

- `index.html` — all eight pages (Home, About, Academy, GPBible, Immersion, Task Force, Give, Contact), switched by hash routes such as `#about`
- `styles.css` — design tokens and layout
- `app.js` — routing, page transitions, scroll animation
- `academy/` — the Global Pathways Academy site (seven pages), sharing `styles.css` and `vendor/` with the main site
- `img/` — board and team portraits
- `vendor/` — GSAP 3.15.1 (core, ScrollTrigger, SplitText), used under the GSAP standard license: https://gsap.com/standard-license

## Notes

- The forms prepare a message to copy or open in a mail app. They do not send anything on their own.
- The Give page links to the Foundation's own giving page and does not process payments.
- Fonts (Fraunces, Geist) load from Google Fonts.
