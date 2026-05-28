// app.jsx — main wiring, language state, hero variant
const { useState, useEffect } = React;

function App() {
  const [lang, setLang] = useState("de");
  const [heroVariant, setHeroVariant] = useState("split");
  const [showTicker, setShowTicker] = useState(true);

  const strings = window.STRINGS[lang] || window.STRINGS.de;

  const heroVariants = {
    cards: HeroCardStack,
    constellation: HeroConstellation,
    depth: HeroDepthType,
    split: HeroSplit,
  };
  const HeroVariant = heroVariants[heroVariant] || HeroSplit;

  return (
    <React.Fragment>
      <Nav
        t={strings}
        lang={lang}
        setLang={setLang}
        heroVariant={heroVariant}
        setHeroVariant={setHeroVariant}
      />
      <main>
        <section className="hero-wrap" data-section="hero" data-screen-label="Hero">
          <HeroVariant t={strings} lang={lang} key={heroVariant} />
          {showTicker && <HeroTicker items={strings.hero.ticker} />}
        </section>
        <About t={strings} />
        <Projects t={strings} lang={lang} />
        <Process t={strings} />
        <Experience t={strings} />
        <Skills t={strings} />
        <Writing t={strings} lang={lang} />
        <Playground t={strings} lang={lang} />
        <Contact t={strings} />
      </main>

      <TweaksPanel title="Tweaks · T">
        <TweakSection label={lang === "de" ? "Hero" : "Hero"} />
        <TweakRadio
          label={lang === "de" ? "Variante" : "Variant"}
          value={heroVariant}
          options={[
            { value: "split", label: lang === "de" ? "Split" : "Split" },
            { value: "cards", label: lang === "de" ? "Karten" : "Cards" },
            { value: "constellation", label: lang === "de" ? "Konst." : "Const." },
            { value: "depth", label: lang === "de" ? "Tiefe" : "Depth" },
          ]}
          onChange={(v) => setHeroVariant(v)}
        />
        <TweakToggle
          label={lang === "de" ? "Lauftext" : "Ticker"}
          value={showTicker}
          onChange={(v) => setShowTicker(v)}
        />

        <TweakSection label={lang === "de" ? "Sprache" : "Language"} />
        <TweakRadio
          label={lang === "de" ? "Sprache" : "Language"}
          value={lang}
          options={[
            { value: "de", label: "Deutsch" },
            { value: "en", label: "English" },
          ]}
          onChange={(v) => setLang(v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
