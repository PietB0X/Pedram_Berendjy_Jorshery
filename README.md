# Portfolio · Pedram Berendjy Jorshery

Postmoderne, editoriale Portfolio-Website. Cream + Vermillion + Coral + Yellow + tiefes Ink-Braun.

## Starten

```bash
npx serve .
# oder
python3 -m http.server 3000
```

Dann: **http://localhost:3000**

---

## Dateistruktur

```
index.html          — HTML-Entry, lädt React 18 + Babel via CDN
styles.css          — Gesamtes Design-System (CSS-Variablen, alle Komponenten)
i18n.js             — Alle Texte in DE + EN (window.STRINGS)
tweaks-panel.jsx    — Floating-Panel, Tastenkürzel: T
heroes.jsx          — 3 Hero-Varianten (Cards, Constellation, Depth)
sections.jsx        — Alle 8 Sektionen + Nav-Komponente
app.jsx             — Root-Komponente, State für Sprache + Hero-Variante
```

## Tech-Stack

- **React 18** via CDN (kein Build-Schritt)
- **Babel Standalone** für JSX-Transpilierung im Browser
- **Kein Framework, kein Bundler** — reines HTML/CSS/JSX
- **Schriften**: Instrument Serif (Display, italic) · Geist (Sans) · JetBrains Mono (Labels)

> **Achtung:** Wegen Babel-Fetch-Calls funktioniert `file://` nicht — immer über einen lokalen Server öffnen.

---

## Design-System

### CSS-Variablen (`styles.css`)

```css
--cream:     #f1e6cf   /* Haupthintergrund */
--paper:     #fbf5e7   /* Cards, erhöhte Flächen */
--ink:       #1a0f08   /* Text, Borders */
--ink-soft:  #5a3e2a   /* Sekundärtext */
--accent:    #ee4814   /* Vermillion — CTAs, Highlights */
--coral:     #ff8a7a
--yellow:    #f4c430
```

### Schrift-Klassen

```css
.display-italic   → Instrument Serif italic (große Headlines)
.tc-mono          → JetBrains Mono, uppercase, 11px (Labels, Chips)
```

### Reveal-Animation

Alle Sektionselemente nutzen die `<Reveal>`-Komponente in `sections.jsx`:
- Startet unsichtbar (`opacity: 0, translateY: 28px`)
- Blendet ein, sobald im Viewport (IntersectionObserver)
- `delay`-Prop für gestaffeltes Einblenden

---

## Komponenten-Übersicht

### Hero-Varianten (`heroes.jsx`)

Alle drei teilen `<HeroMeta>` (4 Ecken mit Availability, Eyebrow, Tagline, Location).

| Variante | Klasse | Interaktion |
|---|---|---|
| `cards` | `.hero-stage--cards` | 3D-Tilt folgt Maus, Klick mischt Stapel |
| `constellation` | `.hero-stage--constellation` | Geometrische Shapes mit Parallax |
| `depth` | `.hero-stage--depth` | Große Italic-Typo mit Tiefenlagen |

Wechsel: Nav-Button oben rechts oder Tweaks-Panel (Taste `T`).

### Sektionen (`sections.jsx`)

```
Nav              — Fixed, blur backdrop, Sprach-Toggle + Hero-Wechsel
About            — Fließtext + 4 Karten-Grid
Projects         — Drag-Galerie (3 Case Studies), Keyboard: ← →
Process          — 4-Schritt-Grid (colorcodiert)
Experience       — Timeline-Liste
Skills           — 6-Spalten-Grid (gruppiert)
Writing          — Listenansicht mit Hover-Effekt
Playground       — 2×2 Karten-Grid mit 3D-Tilt
Contact          — Email-Link + Footer
```

### i18n (`i18n.js`)

Alle Strings in `window.STRINGS.de` und `window.STRINGS.en`. Sprache per State in `app.jsx`, Toggle im Nav.

---

## Inhalte anpassen

### Texte ändern
→ `i18n.js` — Strings direkt in `window.STRINGS.de` / `.en` editieren.

### Projekte hinzufügen/ändern
→ `i18n.js`, Key `work.items[]` — Array-Eintrag mit diesen Feldern:
```js
{ slug, name, tag, year, role, stack[], one, problem, process, outcome, metrics[] }
```
SVG-Cover: `ProjectCover`-Funktion in `sections.jsx` per `idx`.

### Farben ändern
→ `styles.css`, `:root`-Block, CSS-Variablen.

### Neue Sektion hinzufügen
1. Strings in `i18n.js` ergänzen (DE + EN)
2. Komponente in `sections.jsx` erstellen (nutzt `<Reveal>` + `<SectionHeader>`)
3. In `app.jsx` einbinden
4. Nav-Item in `sections.jsx` → `Nav`-Komponente, `items`-Array

---

## Tweaks-Panel

Erreichbar via Taste **`T`** oder `postMessage({ type: '__activate_edit_mode' })`.

Aktuell steuerbar:
- Hero-Variante (Cards / Constellation / Depth)
- Ticker an/aus
- Sprache (DE / EN)

---

## Deployment

Da kein Build-Schritt nötig, reicht ein statischer Host:

- **Netlify / Vercel**: Ordner direkt deployen
- **GitHub Pages**: Branch pushen, Pages aktivieren
- **Eigener Server**: `npx serve .` oder nginx/apache

Für Produktion empfiehlt sich ein Vite-Build (JSX vorkompilieren, Babel-CDN entfernen) — aktuell ~3s Ladezeit durch Browser-Kompilierung.
