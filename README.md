# Jing Cold Drinks

A responsive, 3D animated marketing site for Jing Cold Drinks, built with [Three.js](https://threejs.org/) and Vite.

Features: 3D aluminium can (generated in code) that follows scroll and mouse, rising bubbles, floating ice cubes, flavor picker that recolors the can, about and contact sections. Respects `prefers-reduced-motion`.

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # preview the production build
```

Requires Node.js 18+. Brand colors and flavors are placeholders — edit `FLAVORS` in `src/main.js` and CSS variables in `src/style.css`. The contact form is a demo; connect it to a backend or form service.
