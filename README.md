# Full Registration Presentation

Keran Li · PhD Full Registration  
*A Complex Adaptive System Framework for Multi-Objective Generative Design*

**Live Demo:** https://krli3.github.io/Full-Registration-Presentation/

## Run locally

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Deck navigation

| key | action |
| --- | --- |
| `→` `Space` `PageDown` | next slide |
| `←` `PageUp` | previous slide |
| `Home` | first slide |
| `End` | last slide |
| `O` | toggle overview grid |
| `F` | toggle full-screen |
| `Esc` | close overview |

URL hash (`#3`) syncs with the current slide, so refresh / share keeps position.

## Structure

- `index.html` — deck shell
- `assets/deck.{css,js}` — deck navigation + overview
- `assets/slide-base.{css,js}` — design system shared by every slide
- `pages/<slide>/index.html` — one full-canvas (1920 × 1080) page per slide

Each `pages/*` is self-contained HTML. Open it directly in a browser to view in isolation; the deck shell loads it inside an `<iframe>` for navigation.
