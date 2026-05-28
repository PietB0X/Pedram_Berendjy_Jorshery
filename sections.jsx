// sections.jsx — all sections after hero
const { useEffect, useRef, useState } = React;

// ────────────────────────────────────────────────────────────────────────
// Reveal-on-scroll wrapper
// ────────────────────────────────────────────────────────────────────────
function Reveal({ children, as: As = "div", className = "", delay = 0, style = {}, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <As
      ref={ref}
      className={`reveal ${shown ? "reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </As>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Section header
// ────────────────────────────────────────────────────────────────────────
function SectionHeader({ kicker, heading, em, sub, id, breakBeforeEm }) {
  let pre = heading;
  let post = "";
  let emInline = false;
  if (em) {
    const idx = heading.indexOf(em);
    if (idx >= 0) {
      pre = heading.slice(0, idx);
      post = heading.slice(idx + em.length);
      emInline = true;
    }
  }
  return (
    <header className="sec-head" id={id}>
      <Reveal className="sec-kicker tc-mono">{kicker}</Reveal>
      <Reveal as="h2" className="sec-heading" delay={80}>
        {pre}
        {em && breakBeforeEm && emInline && <br />}
        {em && (
          <em className={`display-italic${emInline && !breakBeforeEm ? "" : !emInline ? " sec-heading-em--lead" : ""}`}>{em}</em>
        )}
        {post}
      </Reveal>
      {sub && <Reveal className="sec-sub" delay={160}>{sub}</Reveal>}
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────
// About
// ────────────────────────────────────────────────────────────────────────
function About({ t }) {
  return (
    <section className="sec sec-about" data-section="about" data-screen-label="About">
      <SectionHeader
        kicker={t.about.kicker}
        heading={t.about.heading}
        em={t.about.headingEm}
      />
      <div className="about-body">
        <Reveal as="p" className="about-text">
          {t.about.bodyBefore}
          <strong className="about-project">{t.about.bodyMaster}</strong>
          {t.about.bodyMiddle}
          <strong className="about-project">{t.about.bodyBachelor}</strong>
          {t.about.bodyAfter}
        </Reveal>
        <Reveal as="p" className="about-text" delay={80}>
          {t.about.body2Before}
          <strong className="about-project">{t.about.body2Project}</strong>
          {t.about.body2After}
        </Reveal>
      </div>
      <div className="about-grid">
        {t.about.cards.map((c, i) => (
          <Reveal key={i} className="about-card" delay={i * 90}>
            <div className="about-card-n tc-mono">0{i + 1}</div>
            <h3 className="about-card-t">{c.t}</h3>
            <p className="about-card-b">{c.b}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Projects — draggable horizontal scroller w/ case study cards
// ────────────────────────────────────────────────────────────────────────
function Projects({ t, lang }) {
  const scrollerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const dragState = useRef({ down: false, x0: 0, scroll0: 0, moved: false });

  function onDown(e) {
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = {
      down: true,
      x0: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      scroll0: el.scrollLeft,
      moved: false,
    };
    el.classList.add("is-dragging");
  }
  function onMove(e) {
    if (!dragState.current.down) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const dx = x - dragState.current.x0;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    scrollerRef.current.scrollLeft = dragState.current.scroll0 - dx;
  }
  function onUp() {
    dragState.current.down = false;
    scrollerRef.current?.classList.remove("is-dragging");
  }
  function jumpTo(i) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelectorAll(".proj-card")[i];
    if (card) {
      el.scrollTo({ left: card.offsetLeft - 32, behavior: "smooth" });
    }
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function onScroll() {
      const cards = el.querySelectorAll(".proj-card");
      let best = 0, bestDist = Infinity;
      const center = el.scrollLeft + el.clientWidth / 2;
      cards.forEach((c, i) => {
        const cardCenter = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(center - cardCenter);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActiveIdx(best);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e) {
      const el = scrollerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.7 || rect.bottom < window.innerHeight * 0.3) return;
      if (e.key === "ArrowRight") jumpTo(Math.min(activeIdx + 1, t.work.items.length - 1));
      if (e.key === "ArrowLeft") jumpTo(Math.max(activeIdx - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx, t.work.items.length]);

  return (
    <section className="sec sec-work" data-section="work" data-screen-label="Work">
      <SectionHeader
        kicker={t.work.kicker}
        heading={t.work.heading}
        em={t.work.headingEm}
      />

      <div className="proj-meta">
        <div className="proj-meta-l tc-mono">{t.work.drag}</div>
        <div className="proj-dots">
          {t.work.items.map((_, i) => (
            <button
              key={i}
              className={`proj-dot ${i === activeIdx ? "proj-dot--on" : ""}`}
              onClick={() => jumpTo(i)}
              aria-label={`Project ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="proj-scroller"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div className="proj-track">
          {t.work.items.map((p, i) => (
            <ProjectCard key={p.slug} p={p} lang={lang} idx={i} />
          ))}
          <div className="proj-end tc-mono">
            ↳ {lang === "de" ? "Ende. Mehr auf Anfrage." : "End. More on request."}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ p, lang, idx }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x, y });
  }
  function onLeave() { setTilt({ x: 0, y: 0 }); }

  return (
    <article
      ref={cardRef}
      className="proj-card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.y * -3}deg) rotateY(${tilt.x * 4}deg)`,
      }}
    >
      <div className="proj-cover">
        <div className="proj-cover-num tc-mono">P / 0{idx + 1}</div>
        <ProjectCover idx={idx} />
        <div className="proj-cover-year tc-mono">{p.year}</div>
      </div>
      <div className="proj-body">
        <div className="proj-head">
          <h3 className="proj-name">{p.name}</h3>
          <p className="proj-tag display-italic">{p.tag}</p>
        </div>

        <div className="proj-row">
          <div className="proj-col">
            <div className="proj-mini tc-mono">{lang === "de" ? "ROLLE" : "ROLE"}</div>
            <div className="proj-text">{p.role}</div>
          </div>
          <div className="proj-col">
            <div className="proj-mini tc-mono">STACK</div>
            <div className="proj-chips">
              {p.stack.map((s, i) => <span className="chip tc-mono" key={i}>{s}</span>)}
            </div>
          </div>
        </div>

        <p className="proj-one">{p.one}</p>

        <div className="proj-blocks">
          <div className="proj-block">
            <div className="proj-mini tc-mono">{lang === "de" ? "PROBLEM" : "PROBLEM"}</div>
            <p>{p.problem}</p>
          </div>
          <div className="proj-block">
            <div className="proj-mini tc-mono">{lang === "de" ? "PROZESS" : "PROCESS"}</div>
            <p>{p.process}</p>
          </div>
          <div className="proj-block">
            <div className="proj-mini tc-mono">{lang === "de" ? "ERGEBNIS" : "OUTCOME"}</div>
            <p>{p.outcome}</p>
          </div>
        </div>

        <div className="proj-metrics">
          {p.metrics.map((m, i) => (
            <div className="metric" key={i}>
              <div className="metric-n">{m.n}</div>
              <div className="metric-l tc-mono">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ProjectCover({ idx }) {
  if (idx === 0) {
    return (
      <svg className="cover-svg" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dotsL" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.2" fill="var(--ink)" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="400" height="260" fill="url(#dotsL)" />
        <g transform="translate(60 60)">
          <polygon points="60,0 74,40 116,40 82,66 96,108 60,82 24,108 38,66 4,40 46,40" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="2.5" />
        </g>
        <g transform="translate(220 40)">
          <rect width="120" height="78" rx="8" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2.5" />
          <rect x="10" y="12" width="56" height="6" rx="3" fill="var(--ink)" />
          <rect x="10" y="26" width="100" height="4" rx="2" fill="var(--ink)" opacity="0.4" />
          <rect x="10" y="36" width="80" height="4" rx="2" fill="var(--ink)" opacity="0.4" />
          <rect x="10" y="54" width="46" height="14" rx="7" fill="var(--accent)" />
        </g>
        <g transform="translate(140 150)">
          <circle r="38" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.5" />
          <text textAnchor="middle" dy="8" fontFamily="'JetBrains Mono', monospace" fontSize="22" fontWeight="700" fill="var(--cream)">+50</text>
        </g>
        <g transform="translate(280 180)">
          <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="var(--coral)" stroke="var(--ink)" strokeWidth="2.5" />
        </g>
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg className="cover-svg" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="260" fill="var(--ink)" />
        <g stroke="var(--accent)" strokeWidth="2" fill="none">
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 40 + i * 24;
            const d = `M0,${y} ` + Array.from({ length: 40 }).map((_, k) => {
              const x = k * 10;
              const amp = 8 + Math.sin(k * 0.6 + i) * 6 + (i === 4 ? 18 : 0);
              return `L${x},${y + Math.sin(k * 0.8 + i * 1.2) * amp}`;
            }).join(" ");
            return <path key={i} d={d} opacity={i === 4 ? 1 : 0.18} stroke={i === 4 ? "var(--coral)" : "var(--accent)"} />;
          })}
        </g>
        <g transform="translate(200 130)">
          <circle r="30" fill="none" stroke="var(--yellow)" strokeWidth="2" />
          <circle r="44" fill="none" stroke="var(--yellow)" strokeWidth="1" opacity="0.6" />
          <text textAnchor="middle" dy="-2" fontFamily="'Instrument Serif', serif" fontSize="22" fontStyle="italic" fill="var(--yellow)">tilt</text>
          <text textAnchor="middle" dy="14" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="var(--cream)" opacity="0.7">DETECTED</text>
        </g>
      </svg>
    );
  }
  return (
    <svg className="cover-svg" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" fill="var(--coral)" />
      <g fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity="0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 28 + 20} x2="400" y2={i * 28 + 20 - 30} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={i * 36} y1="0" x2={i * 36 - 20} y2="260" />
        ))}
      </g>
      <g transform="translate(110 140)">
        <circle r="32" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2.5" />
        <circle cx="-10" cy="-4" r="4" fill="var(--ink)" />
        <circle cx="10" cy="-4" r="4" fill="var(--ink)" />
        <path d="M-12 12 Q 0 22 12 12" stroke="var(--ink)" strokeWidth="2" fill="none" />
      </g>
      <g transform="translate(270 110)">
        <circle r="32" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="2.5" />
        <circle cx="-10" cy="-4" r="4" fill="var(--ink)" />
        <circle cx="10" cy="-4" r="4" fill="var(--ink)" />
        <path d="M-10 14 Q 0 6 10 14" stroke="var(--ink)" strokeWidth="2" fill="none" />
      </g>
      <line x1="110" y1="140" x2="270" y2="110" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 6" />
      <g transform="translate(200 200)">
        <text textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="var(--ink)">SHARED PERSPECTIVE</text>
      </g>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Process — 4 steps in a loop
// ────────────────────────────────────────────────────────────────────────
function Process({ t }) {
  return (
    <section className="sec sec-process" data-section="process" data-screen-label="Process">
      <SectionHeader
        kicker={t.process.kicker}
        heading={t.process.heading}
        sub={t.process.sub}
      />
      <div className="proc-grid">
        {t.process.steps.map((s, i) => (
          <Reveal key={i} className="proc-step" delay={i * 80}>
            <div className="proc-n display-italic">{s.n}</div>
            <h3 className="proc-t">{s.t}</h3>
            <p className="proc-b">{s.b}</p>
            <div className="proc-arrow" aria-hidden="true">
              {i < 3 ? "→" : "↺"}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Experience
// ────────────────────────────────────────────────────────────────────────
function Experience({ t }) {
  return (
    <section className="sec sec-exp" data-section="exp" data-screen-label="Experience">
      <SectionHeader
        kicker={t.exp.kicker}
        heading={t.exp.heading}
      />
      <div className="exp-list">
        {t.exp.items.map((e, i) => (
          <Reveal key={i} className="exp-row" delay={i * 80}>
            <div className="exp-when display-italic">{e.when}</div>
            <div className="exp-body">
              <div className="exp-where tc-mono">{e.where}</div>
              <h3 className="exp-what">{e.what}</h3>
              <p className="exp-text">{e.body}</p>
              <div className="exp-tags">
                {e.tags.map((tag, k) => <span key={k} className="chip chip--ghost tc-mono">{tag}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Skills — grouped grid
// ────────────────────────────────────────────────────────────────────────
function Skills({ t }) {
  return (
    <section className="sec sec-skills" data-section="skills" data-screen-label="Skills">
      <SectionHeader
        kicker={t.skills.kicker}
        heading={t.skills.heading}
        em={t.skills.headingEm}
      />
      <div className="skills-grid">
        {t.skills.groups.map((g, i) => (
          <Reveal key={i} className="skill-group" delay={i * 60}>
            <div className="skill-group-t tc-mono">{g.t.toUpperCase()}</div>
            <ul className="skill-list">
              {g.items.map((s, k) => (
                <li key={k} className="skill-item">
                  <span className="skill-bullet">●</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Writing / Notes
// ────────────────────────────────────────────────────────────────────────
function Writing({ t, lang }) {
  return (
    <section className="sec sec-writing" data-section="writing" data-screen-label="Writing">
      <SectionHeader
        kicker={t.writing.kicker}
        heading={t.writing.heading}
        sub={t.writing.sub}
      />
      <div className="writing-list">
        {t.writing.posts.map((p, i) => (
          <Reveal key={i} className="writing-row" delay={i * 60}>
            <div className="writing-date tc-mono">{p.d}</div>
            <div className="writing-body">
              <h3 className="writing-t">{p.t}</h3>
              <p className="writing-e">{p.e}</p>
            </div>
            <div className="writing-arrow" aria-hidden="true">↗</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Playground
// ────────────────────────────────────────────────────────────────────────
function Playground({ t, lang }) {
  return (
    <section className="sec sec-play" data-section="play" data-screen-label="Playground">
      <SectionHeader
        kicker={t.play.kicker}
        heading={t.play.heading}
        sub={t.play.sub}
      />
      <div className="play-grid">
        {t.play.items.map((p, i) => (
          <PlayTile key={i} item={p} idx={i} />
        ))}
      </div>
    </section>
  );
}

function PlayTile({ item, idx }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }
  const tints = ["var(--paper)", "var(--accent)", "var(--yellow)", "var(--ink)"];
  const inks = ["var(--ink)", "var(--cream)", "var(--ink)", "var(--cream)"];
  return (
    <Reveal delay={idx * 70}>
      <div
        ref={ref}
        className="play-tile"
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          background: tints[idx % 4],
          color: inks[idx % 4],
          transform: `perspective(900px) rotateX(${tilt.y * -8}deg) rotateY(${tilt.x * 10}deg)`,
        }}
      >
        <div className="play-glyph" style={{ transform: `translate3d(${tilt.x * 24}px, ${tilt.y * 24}px, 0)` }}>
          {item.emoji}
        </div>
        <div className="play-t">{item.t}</div>
        <div className="play-b">{item.b}</div>
        <div className="play-corner tc-mono">EXP / 0{idx + 1}</div>
      </div>
    </Reveal>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Contact
// ────────────────────────────────────────────────────────────────────────
function ContactMail({ email, copyLabel, copiedLabel }) {
  const [copied, setCopied] = React.useState(false);

  function handleClick(e) {
    const mailtoWorked = window.open(`mailto:${email}`, "_self");
    setTimeout(() => {
      if (!document.hasFocus() || mailtoWorked === null) return;
      navigator.clipboard && navigator.clipboard.writeText(email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }, 500);
  }

  function handleCopy(e) {
    e.preventDefault();
    navigator.clipboard && navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="contact-mail-wrap">
      <a className="contact-mail display-italic" href={`mailto:${email}`} onClick={handleClick}>
        {email}
        <span className="contact-arrow">↗</span>
      </a>
      <button className="contact-copy tc-mono" onClick={handleCopy} aria-label="E-Mail kopieren">
        {copied ? (copiedLabel || "Kopiert ✓") : (copyLabel || "Kopieren")}
      </button>
    </div>
  );
}

function Contact({ t }) {
  return (
    <section className="sec sec-contact" data-section="contact" data-screen-label="Contact">
      <SectionHeader
        kicker={t.contact.kicker}
        heading={t.contact.heading}
        em={t.contact.headingEm}
        breakBeforeEm
      />
      <div className="contact-card">
        <div className="contact-card-inner">
          <div className="contact-card-body">
            <ContactMail email={t.contact.email} copyLabel={t.contact.copyLabel} copiedLabel={t.contact.copiedLabel} />
            <div className="contact-meta">
              <div>
                <div className="contact-mini tc-mono">{t.contact.ctaMini}</div>
                <div className="contact-line">{t.contact.cta}</div>
                <div className="contact-sub tc-mono">{t.contact.sub}</div>
              </div>
              <div>
                <div className="contact-mini tc-mono">TEL</div>
                <div className="contact-line">{t.contact.phone}</div>
              </div>
              <div>
                <div className="contact-mini tc-mono">{t.contact.whereMini}</div>
                <div className="contact-line">{t.contact.where}</div>
              </div>
            </div>
          </div>
          <div className="contact-portrait-wrap">
            <img src="pedram.jpg" alt="Pedram Berendjy Jorshery" className="contact-portrait" />
          </div>
        </div>
      </div>
      <footer className="footer">
        <span>{t.contact.footer}</span>
        <span className="tc-mono">{t.contact.colophon}</span>
      </footer>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Nav
// ────────────────────────────────────────────────────────────────────────
function Nav({ t, lang, setLang, heroVariant, setHeroVariant }) {
  const [open, setOpen] = useState(false);
  const variants = ["split", "cards", "constellation", "depth"];
  const variantLabels = { cards: "✦", constellation: "◉", depth: "◇", split: "⊞" };

  const items = [
    { id: "about", label: t.nav.about },
    { id: "work", label: t.nav.work },
    { id: "process", label: t.nav.process },
    { id: "exp", label: t.nav.experience },
    { id: "skills", label: t.nav.skills },
    { id: "writing", label: t.nav.writing },
    { id: "play", label: t.nav.playground },
    { id: "contact", label: t.nav.contact },
  ];

  function jump(id) {
    const el = document.querySelector(`[data-section="${id}"]`);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
    }
    setOpen(false);
  }

  function cycleVariant() {
    const idx = variants.indexOf(heroVariant);
    setHeroVariant(variants[(idx + 1) % variants.length]);
  }

  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <span className="logo-dot" />
        <span className="logo-text">Pedram <em className="display-italic">Berendjy Jorshery</em> </span>
      </button>
      <ul className={`nav-list ${open ? "nav-list--open" : ""}`}>
        {items.map((it) => (
          <li key={it.id}>
            <button className="nav-link" onClick={() => jump(it.id)}>
              {it.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        <button className="hero-variant-btn tc-mono" onClick={cycleVariant} title="Switch hero variant">
          {variantLabels[heroVariant]} Hero
        </button>
        <div className="lang-toggle tc-mono">
          <button className={lang === "de" ? "on" : ""} onClick={() => setLang("de")}>DE</button>
          <span>/</span>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="nav-menu" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

Object.assign(window, {
  Reveal, SectionHeader,
  About, Projects, Process, Experience, Skills, Writing, Playground, Contact, Nav,
});
