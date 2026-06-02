// heroes.jsx — four hero variants with parallax/tilt
// Hero1: Trading-card stack with 3D tilt
// Hero2: Floating constellation of geometric objects
// Hero3: Massive depth typography with parallax layers
// Hero4: Compact card stack + depth name (split layout)

const { useEffect, useRef, useState, useMemo } = React;

// ────────────────────────────────────────────────────────────────────────
// Shared: mouse tracker normalized to [-0.5, 0.5] from element center
// ────────────────────────────────────────────────────────────────────────
function useMousePosition(ref) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function onMove(e) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setPos({ x, y });
    }
    function onLeave() { setPos({ x: 0, y: 0 }); }
    const el = ref.current;
    if (!el) return;
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
  return pos;
}

const DEPTH_LAYERS = [
  { d: 1.8, c: "var(--accent)", blur: 0, op: 0.18, scale: 1.18 },
  { d: 1.2, c: "var(--coral)", blur: 0, op: 0.28, scale: 1.10 },
  { d: 0.6, c: "var(--yellow)", blur: 0, op: 0.55, scale: 1.04 },
  { d: 0, c: "var(--ink)", blur: 0, op: 1.0, scale: 1.0 },
];

function buildHeroCards(t, lang) {
  const labels = t.hero.cardLabels;
  return [
    {
      key: "role",
      kicker: labels.role,
      title: t.meta.role,
      sub: t.meta.sub,
      tint: "var(--paper)",
      ink: "var(--ink)",
      accent: "var(--accent)",
      glyph: "✦",
    },
    {
      key: "based",
      kicker: labels.based,
      title: "Hamburg",
      sub: t.meta.based,
      tint: "var(--accent)",
      ink: "var(--cream)",
      accent: "var(--yellow)",
      glyph: "◉",
    },
    {
      key: "focus",
      kicker: labels.focus,
      title: "XR · AI · UX",
      sub: t.meta.currentlyMaster,
      tint: "var(--ink)",
      ink: "var(--cream)",
      accent: "var(--coral)",
      glyph: "◇",
    },
    {
      key: "pubs",
      kicker: labels.publications,
      title: "ACM × IEEE",
      sub: "MuC '20 · ACIIW '23",
      tint: "var(--yellow)",
      ink: "var(--ink)",
      accent: "var(--accent)",
      glyph: "✱",
    },
  ];
}

function cycleCardOrder(setOrder) {
  setOrder((o) => {
    const n = [...o];
    n.push(n.shift());
    return n;
  });
}

function CardStack({ cards, order, setOrder, m, lang, compact }) {
  const stackClass = compact ? "card-stack card-stack--compact" : "card-stack";
  const offsetMul = compact ? 0.72 : 1;
  const tiltMul = compact ? 0.85 : 1;

  return (
    <div className={stackClass} onClick={() => cycleCardOrder(setOrder)}>
      {cards.map((c, i) => {
        const pos = order.indexOf(i);
        const isTop = pos === 0;
        const rx = isTop ? m.y * -14 * tiltMul : 0;
        const ry = isTop ? m.x * 18 * tiltMul : 0;
        const tx = pos * 22 * offsetMul + (isTop ? m.x * 18 * tiltMul : 0);
        const ty = pos * -14 * offsetMul + (isTop ? m.y * 10 * tiltMul : 0);
        const rz = (pos - 1.5) * 4;
        const depthZ = compact ? -pos * 28 : -pos * 40;
        return (
          <article
            key={c.key}
            className="trading-card"
            style={{
              background: c.tint,
              color: c.ink,
              zIndex: 100 - pos,
              transform: `translate3d(${tx}px, ${ty}px, ${depthZ}px) rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg)`,
              pointerEvents: isTop ? "auto" : "none",
              opacity: isTop ? 1 : 0.92,
            }}
          >
            <div className="tc-corner tc-corner--tl">
              <span className="tc-glyph" style={{ color: c.accent }}>{c.glyph}</span>
              <span className="tc-corner-num">0{i + 1}</span>
            </div>
            <div className="tc-corner tc-corner--br">
              <span className="tc-corner-num">0{i + 1}</span>
              <span className="tc-glyph" style={{ color: c.accent }}>{c.glyph}</span>
            </div>

            <div className="tc-body">
              <div className="tc-kicker">{c.kicker}</div>
              <div className="tc-title">{c.title}</div>
              <div className="tc-sub">{c.sub}</div>
            </div>

            <div className="tc-frame" style={{ borderColor: c.ink }}>
              <div className="tc-rays" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, k) => (
                  <span key={k} style={{ transform: `rotate(${(k * 360) / 14}deg)`, background: c.accent }} />
                ))}
              </div>
              <div className="tc-disk" style={{ background: c.accent, color: c.tint }}>
                <span>P</span>
                <span>B</span>
                <span>J</span>
              </div>
            </div>

            <div className="tc-footer" style={{ borderTopColor: c.ink }}>
              <span className="tc-mono">PORTFOLIO/2026</span>
              <span className="tc-mono">{i + 1}/4 · PBJ</span>
            </div>
          </article>
        );
      })}
      <div className="card-stack-hint tc-mono">
        {lang === "de" ? "↳ Klicken zum Mischen" : "↳ click to shuffle"}
      </div>
    </div>
  );
}

function DepthName({ t, m, alignRight }) {
  const depthClass = alignRight ? "depth-type depth-type--split" : "depth-type";
  return (
    <div className={depthClass}>
      {[t.hero.nameLine1, t.hero.nameLine2, t.hero.nameLine3].map((word, wi) => (
        <div className="dt-row" key={wi}>
          {DEPTH_LAYERS.map((L, i) => (
            <span
              key={i}
              className="dt-layer"
              style={{
                color: L.c,
                opacity: L.op,
                transform: `translate3d(${-m.x * 30 * L.d}px, ${-m.y * 20 * L.d}px, 0) scale(${L.scale})`,
                zIndex: 10 + i,
                WebkitTextStroke: L.d > 0 ? `1px ${L.c}` : "0",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      ))}

      <div className="dt-floaters" aria-hidden="true">
        <span className="dt-flt dt-flt--1" style={{ transform: `translate3d(${m.x * 60}px, ${m.y * 40}px, 0) rotate(${m.x * 20 - 12}deg)` }}>✦</span>
        <span className="dt-flt dt-flt--2" style={{ transform: `translate3d(${m.x * -90}px, ${m.y * -60}px, 0) rotate(${m.x * -20 + 18}deg)` }}>◇</span>
        <span className="dt-flt dt-flt--3" style={{ transform: `translate3d(${m.x * 40}px, ${m.y * -70}px, 0) rotate(${m.x * 15 + 6}deg)` }}>◉</span>
        <span className="dt-flt dt-flt--4" style={{ transform: `translate3d(${m.x * -70}px, ${m.y * 50}px, 0) rotate(${m.x * -10 - 24}deg)` }}>✱</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Hero 1: Trading Card Stack
// ────────────────────────────────────────────────────────────────────────
function HeroCardStack({ t, lang }) {
  const stageRef = useRef(null);
  const m = useMousePosition(stageRef);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const cards = buildHeroCards(t, lang);

  return (
    <div ref={stageRef} className="hero-stage hero-stage--cards">
      <HeroMeta t={t} />
      <CardStack cards={cards} order={order} setOrder={setOrder} m={m} lang={lang} compact={false} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Hero 2: Floating Constellation of geometric skill-objects
// ────────────────────────────────────────────────────────────────────────
function HeroConstellation({ t, lang }) {
  const stageRef = useRef(null);
  const m = useMousePosition(stageRef);

  const objects = useMemo(() => ([
    { id: "react",    shape: "ring",     label: "React",    x: 12, y: 22, depth: 0.9, size: 130, fill: "var(--accent)", spin: -4 },
    { id: "ts",       shape: "square",   label: "TypeScript", x: 78, y: 18, depth: 1.4, size: 96,  fill: "var(--ink)",    spin: 10 },
    { id: "node",     shape: "hex",      label: "Node",     x: 88, y: 56, depth: 1.1, size: 110, fill: "var(--yellow)", spin: -8 },
    { id: "unity",    shape: "triangle", label: "Unity",    x: 18, y: 72, depth: 1.6, size: 120, fill: "var(--coral)",  spin: 14 },
    { id: "unreal",   shape: "blob",     label: "Unreal",   x: 70, y: 78, depth: 0.7, size: 140, fill: "var(--ink)",    spin: -6 },
    { id: "figma",    shape: "circle",   label: "Figma",    x: 38, y: 14, depth: 0.5, size: 70,  fill: "var(--yellow)", spin: 0 },
    { id: "hcd",      shape: "x",        label: "HCD",      x: 6,  y: 48, depth: 1.2, size: 70,  fill: "var(--accent)", spin: 0 },
    { id: "ml",       shape: "diamond",  label: "ML",       x: 52, y: 88, depth: 0.9, size: 80,  fill: "var(--accent)", spin: 4 },
    { id: "xr",       shape: "ring",     label: "XR",       x: 60, y: 38, depth: 1.8, size: 60,  fill: "var(--ink)",    spin: -10 },
  ]), []);

  return (
    <div ref={stageRef} className="hero-stage hero-stage--constellation">
      <HeroMeta t={t} />

      <div className="constellation">
        {objects.map((o) => {
          const tx = -m.x * 80 * o.depth;
          const ty = -m.y * 60 * o.depth;
          const rz = m.x * 8 * o.depth + o.spin;
          return (
            <div
              key={o.id}
              className="cn-obj"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: o.size,
                height: o.size,
                transform: `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) rotate(${rz}deg)`,
                zIndex: Math.round(o.depth * 10),
              }}
            >
              <Shape kind={o.shape} fill={o.fill} />
              <span className="cn-label tc-mono">{o.label}</span>
            </div>
          );
        })}
        <div className="constellation-center">
          <div className="cn-title-row">
            <span className="cn-tilde">~</span>
            <span className="cn-name">Pedram</span>
          </div>
          <div className="cn-sub tc-mono">{t.meta.role.toUpperCase()} · HUMAN-CENTERED DESIGN</div>
        </div>
      </div>
    </div>
  );
}

function Shape({ kind, fill }) {
  const stroke = "var(--ink)";
  switch (kind) {
    case "ring":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <circle cx="50" cy="50" r="42" fill="none" stroke={fill} strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <rect x="10" y="10" width="80" height="80" fill={fill} stroke={stroke} strokeWidth="2" />
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="var(--cream)" strokeWidth="2" />
        </svg>
      );
    case "hex":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <polygon points="50,10 92,86 8,86" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="62" r="10" fill="var(--cream)" />
        </svg>
      );
    case "blob":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <path d="M50 6 C 78 6 96 28 92 56 C 88 84 60 96 38 90 C 14 84 4 60 12 38 C 18 18 32 6 50 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <circle cx="50" cy="50" r="44" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <line x1="14" y1="14" x2="86" y2="86" stroke={fill} strokeWidth="14" strokeLinecap="round" />
          <line x1="86" y1="14" x2="14" y2="86" stroke={fill} strokeWidth="14" strokeLinecap="round" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 100 100" className="cn-svg">
          <polygon points="50,8 92,50 50,92 8,50" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

// ────────────────────────────────────────────────────────────────────────
// Hero 3: Depth Typography
// ────────────────────────────────────────────────────────────────────────
function HeroDepthType({ t }) {
  const stageRef = useRef(null);
  const m = useMousePosition(stageRef);

  return (
    <div ref={stageRef} className="hero-stage hero-stage--depth">
      <HeroMeta t={t} />
      <DepthName t={t} m={m} alignRight={false} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Hero 4: Split — compact cards + depth name
// ────────────────────────────────────────────────────────────────────────
function HeroSplit({ t, lang }) {
  const stageRef = useRef(null);
  const m = useMousePosition(stageRef);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const cards = buildHeroCards(t, lang);

  return (
    <div ref={stageRef} className="hero-stage hero-stage--split">
      <HeroMeta t={t} />
      <div className="hero-split">
        <div className="hero-split__name">
          <DepthName t={t} m={m} alignRight />
        </div>
        <div className="hero-split__cards">
          <div className="card-stack--compact-wrap">
            <CardStack cards={cards} order={order} setOrder={setOrder} m={m} lang={lang} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Shared meta corners (used in all hero variants)
// ────────────────────────────────────────────────────────────────────────
function HeroMeta({ t }) {
  return (
    <React.Fragment>
      <div className="hero-meta hero-meta--tl">
        <span className="meta-dot" />
        <span className="tc-mono">{t.meta.available}</span>
      </div>
      <div className="hero-meta hero-meta--tr tc-mono">
        {t.hero.eyebrow}
      </div>
      <div className="hero-tagline">
        <span>{t.hero.tag}</span>
        <span>{t.hero.tag2}<em>{t.hero.tag2em}</em></span>
        <span>{t.hero.tag3}</span>
      </div>
      <div className="hero-meta hero-meta--bl tc-mono">
        ↓ {t.hero.scroll}
      </div>
      <div className="hero-meta hero-meta--br tc-mono">
        {t.meta.based}
      </div>
    </React.Fragment>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Ticker (below hero in all variants)
// ────────────────────────────────────────────────────────────────────────
function HeroTicker({ items }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((s, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-text">{s}</span>
            <span className="ticker-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  HeroCardStack,
  HeroConstellation,
  HeroDepthType,
  HeroSplit,
  HeroTicker,
});
