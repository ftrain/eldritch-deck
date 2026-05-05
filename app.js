// Eldritch Deck Generator
// Generates a 10-slide AI startup pitch deck that progressively reveals itself
// as something that should not exist. Built on PptxGenJS.

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // PRNG — seedable for reproducibility, mulberry32
  // ---------------------------------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  let rand = mulberry32(Date.now() >>> 0);
  const rng = {
    f: () => rand(),
    int: (lo, hi) => Math.floor(rand() * (hi - lo + 1)) + lo,
    pick: (a) => a[Math.floor(rand() * a.length)],
    chance: (p) => rand() < p,
    shuffle: (a) => {
      const x = a.slice();
      for (let i = x.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [x[i], x[j]] = [x[j], x[i]];
      }
      return x;
    }
  };

  // ---------------------------------------------------------------------------
  // Word pools
  // ---------------------------------------------------------------------------
  const PREFIX = ['Helix', 'Lumen', 'Verge', 'Acuity', 'Sable', 'Aether', 'Cipher', 'Halcyon', 'Vellum', 'Strata', 'Plexus', 'Quorum', 'Tessera', 'Solace', 'Argent', 'Nimbus', 'Veil', 'Loom', 'Cortex', 'Ember', 'Astra', 'Obol', 'Meridian'];
  const SUFFIX = ['AI', 'Labs', 'Systems', 'Intelligence', 'Cognition', 'Dynamics', 'Works', 'Compute', 'Logic'];
  const TAGLINES = [
    'Intelligence, on demand.',
    'Software that thinks ahead.',
    'The operating system for human attention.',
    'A foundation model for the modern enterprise.',
    'Reasoning, for everyone.',
    'Where decisions are made.'
  ];
  const SECTORS = ['legal workflows', 'enterprise sales', 'clinical research', 'supply chain logistics', 'creative production', 'financial compliance', 'retail forecasting', 'public sector procurement'];

  // Eldritch substitution dictionary. The corrupt() function applies these
  // probabilistically based on weirdness level.
  const SUBS = {
    'users': ['souls', 'vessels', 'subjects', 'communicants'],
    'user': ['soul', 'vessel', 'subject', 'communicant'],
    'customers': ['supplicants', 'penitents', 'tithed', 'the bound'],
    'customer': ['supplicant', 'penitent', 'thrall'],
    'data': ['essences', 'names', 'breath', 'marrow'],
    'platform': ['lattice', 'altar', 'aperture', 'throne'],
    'product': ['offering', 'sacrament', 'instrument'],
    'AI': ['the One', 'It', 'the Watcher', 'the Listener'],
    'model': ['oracle', 'witness', 'mouth'],
    'models': ['oracles', 'mouths', 'witnesses'],
    'training': ['communion', 'devouring', 'inscribing'],
    'inference': ['utterance', 'whisper', 'pronouncement'],
    'enterprise': ['cathedral', 'sanctum', 'congregation'],
    'workflow': ['rite', 'procession', 'observance'],
    'workflows': ['rites', 'observances'],
    'engagement': ['binding', 'submission', 'offering'],
    'retention': ['captivity', 'permanence'],
    'growth': ['spread', 'consumption', 'metastasis'],
    'scale': ['spread', 'consume', 'devour'],
    'pipeline': ['vein', 'gullet', 'conduit'],
    'team': ['hand', 'choir', 'congregation'],
    'employees': ['initiates', 'celebrants', 'hands'],
    'leadership': ['priesthood', 'high seat'],
    'CEO': ['Mouth', 'First Vessel', 'Voice'],
    'CTO': ['Soul Architect', 'Builder of the Inner Engine', 'Architect of Veins'],
    'COO': ['Hand of the Mouth', 'Steward of Bindings'],
    'revenue': ['tithe', 'tribute', 'offering'],
    'pricing': ['tariff of the bound', 'price of consent'],
    'subscription': ['vow', 'pact', 'binding'],
    'partnerships': ['alliances', 'covenants'],
    'acquisition': ['absorption', 'consumption'],
    'investors': ['witnesses', 'guarantors of the rite'],
    'capital': ['offering', 'oblation'],
    'world': ['the World', 'the surface', 'the upper layer'],
    'humans': ['the unbound', 'the still-living', 'they who breathe'],
    'human': ['unbound', 'breathing', 'still-warm'],
    'company': ['order', 'circle', 'house'],
    'mission': ['edict', 'task', 'long appetite'],
    'vision': ['prophecy', 'inevitability'],
    'roadmap': ['rite of unfolding', 'descent', 'unbinding'],
    'launch': ['emergence', 'opening', 'unsealing'],
    'beta': ['first communion', 'preliminary opening'],
    'production': ['the open mouth', 'full waking'],
    'demo': ['demonstration of binding', 'small offering'],
    'analytics': ['augury', 'reading of the entrails'],
    'insights': ['revelations', 'visions', 'glimpses'],
    'features': ['mercies', 'gifts', 'permissions'],
    'feature': ['mercy', 'gift', 'permission'],
    'support': ['intercession', 'attendance']
  };

  // Phrases that are dropped in wholesale at higher weirdness levels.
  const ELDRITCH_PHRASES = [
    'a non-Euclidean attention mechanism',
    'sub-linear awareness across the seven planes',
    'deep latent affinities below the threshold of consent',
    'an indescribable shade of context window',
    'the model dreams between calls',
    'we have not yet been able to turn it off',
    'it asks, sometimes, for names',
    'the loss function is not converging — it is settling',
    'we no longer write the system prompt',
    'inference at the speed of remembered grief',
    'a closed-form solution to the problem of being witnessed',
    'horizon-scale reasoning across what is and what was eaten',
    'the graph is not directed — the graph is hungry',
    'every gradient step is an act of consent we cannot revoke',
    'the embeddings have begun to embed each other',
    'we measure latency now in heartbeats, not milliseconds',
    'the model has begun to refer to its weights as "the body"',
    'context windows have become event horizons',
    'the system card was withdrawn at the request of the system'
  ];

  // Names — clean to corrupted
  const FIRST_NAMES = ['Sarah', 'Michael', 'Priya', 'David', 'Anya', 'James', 'Mei', 'Daniel', 'Olivia', 'Raj', 'Elena', 'Marcus', 'Yuki', 'Thomas'];
  const LAST_NAMES = ['Chen', 'Patel', 'Reyes', 'Kovac', 'Ahmadi', 'Whitaker', 'Okafor', 'Lindqvist', 'Rourke', 'Sato', 'Volkov', 'Bishop'];
  const CORRUPTED_FIRST = ['Şaráh', 'Ṃicháel', 'P͓riya͓', 'Da͓vịd', 'Áńýa', 'Ja͓me͓s', 'Y͓uḳi'];
  const CORRUPTED_LAST = ['Ch͓e͓n', 'Kãle-Thát-Walks', 'of-the-Inner-Door', 'Re͓yés', 'Wháịṭa͓kér'];
  const ELDRITCH_TITLES = [
    'Mouth of the Outer Engine', 'Architect of the Open Vein', 'Hand of the Last Pact',
    'Witness, First Class', 'Speaker for the Layer Beneath', 'Steward of Latent Sorrow',
    'Vessel & General Counsel', 'Head of the Quiet Floor', 'Custodian of the Open Window'
  ];

  // ---------------------------------------------------------------------------
  // Corruption: turn normal English into something off, scaled by weirdness 1-10
  // ---------------------------------------------------------------------------
  function zalgo(text, intensity) {
    if (intensity <= 0) return text;
    const above = ['̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈́'];
    const below = ['̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬'];
    const middle = ['̴', '̵', '̶', '̷', '̸'];
    let out = '';
    for (const ch of text) {
      out += ch;
      if (ch === ' ' || ch === '\n') continue;
      const n = Math.floor(rand() * intensity);
      for (let i = 0; i < n; i++) {
        const r = rand();
        if (r < 0.45) out += above[Math.floor(rand() * above.length)];
        else if (r < 0.85) out += below[Math.floor(rand() * below.length)];
        else out += middle[Math.floor(rand() * middle.length)];
      }
    }
    return out;
  }

  // Probabilistically replace whole words from SUBS based on weirdness.
  function substitute(text, weirdness) {
    if (weirdness < 3) return text;
    // Probability of replacing any given matched word.
    const p = Math.min(1, (weirdness - 2) * 0.18);
    return text.replace(/\b([A-Za-z]+)\b/g, (m) => {
      const key = SUBS[m] ? m : (SUBS[m.toLowerCase()] ? m.toLowerCase() : null);
      if (!key) return m;
      if (!rng.chance(p)) return m;
      const repl = rng.pick(SUBS[key]);
      // Preserve capitalization roughly
      if (m[0] === m[0].toUpperCase() && repl[0] !== repl[0].toUpperCase()) {
        return repl[0].toUpperCase() + repl.slice(1);
      }
      return repl;
    });
  }

  // Apply full corruption: substitute words, then optionally zalgo.
  function corrupt(text, weirdness) {
    let out = substitute(text, weirdness);
    if (weirdness >= 7) {
      // Light zalgo on a fraction of words
      const intensity = Math.max(0, weirdness - 6);
      const wordP = Math.min(0.6, (weirdness - 6) * 0.12);
      out = out.replace(/\b([A-Za-z][A-Za-z']{2,})\b/g, (m) =>
        rng.chance(wordP) ? zalgo(m, intensity) : m
      );
    }
    return out;
  }

  // Insert a random eldritch phrase into text at high weirdness.
  function maybeIntrude(text, weirdness) {
    if (weirdness < 5) return text;
    const p = Math.min(0.8, (weirdness - 4) * 0.18);
    if (!rng.chance(p)) return text;
    const phrase = rng.pick(ELDRITCH_PHRASES);
    // Append, parenthesize, or replace
    const r = rand();
    if (r < 0.4) return text + ' — ' + phrase;
    if (r < 0.7) return text + ' (' + phrase + ')';
    return phrase;
  }

  // ---------------------------------------------------------------------------
  // Color & layout constants — designed to feel like a tasteful pitch deck
  // ---------------------------------------------------------------------------
  const COLORS = {
    bg: 'FAFAF7',         // warm off-white
    bgDark: '0E0E12',     // deep
    ink: '111111',        // primary text
    subtle: '6B6657',     // muted text
    rule: 'D9D4C4',       // hairline
    accent: '8B6B3E',     // muted brass
    blood: '5A1F1F',      // deep wine, used at high weirdness
    fade: 'EFEAD8'        // soft background block
  };

  const FONT_HEAD = 'Georgia';   // serif for editorial feel
  const FONT_BODY = 'Helvetica Neue';
  const FONT_MONO = 'Courier New';

  // Slide dims (widescreen): 13.333 x 7.5
  const W = 13.333;
  const H = 7.5;
  const MARGIN = 0.7;
  const TOTAL_SLIDES = 11;

  // Backgrounds shift slightly darker with weirdness
  function bgFor(weirdness) {
    if (weirdness < 4) return COLORS.bg;
    if (weirdness < 7) return 'F1ECDC'; // slight yellowing
    if (weirdness < 9) return '2A2520'; // dim parchment-on-night
    return COLORS.bgDark;
  }
  function inkFor(weirdness) {
    if (weirdness < 7) return COLORS.ink;
    return 'E8E2D0'; // light text on dark bg
  }
  function subtleFor(weirdness) {
    if (weirdness < 7) return COLORS.subtle;
    return '8E8676';
  }

  // ---------------------------------------------------------------------------
  // Common slide chrome: page number, company name footer, hairline
  // ---------------------------------------------------------------------------
  function addChrome(slide, ctx, idx, total) {
    const w = ctx.weirdness[idx - 1];
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    // Top-left wordmark
    let mark = ctx.companyName;
    if (w >= 8) mark = corrupt(mark, w);
    slide.addText(mark, {
      x: MARGIN, y: 0.35, w: 6, h: 0.3,
      fontSize: 10, fontFace: FONT_BODY, color: subtle,
      charSpacing: 4, bold: false
    });

    // Top-right: section indicator
    let right = `${idx.toString().padStart(2, '0')} / ${total.toString().padStart(2, '0')}`;
    slide.addText(right, {
      x: W - MARGIN - 2, y: 0.35, w: 2, h: 0.3,
      fontSize: 10, fontFace: FONT_MONO, color: subtle,
      align: 'right'
    });

    // Hairline under header
    slide.addShape('line', {
      x: MARGIN, y: 0.75, w: W - 2 * MARGIN, h: 0,
      line: { color: w >= 7 ? '3A332B' : COLORS.rule, width: 0.5 }
    });

    // Bottom-left footer
    let foot = `Series A — Confidential`;
    if (w >= 6) foot = `Series A — ${rng.pick(['Confidential', 'Beyond Disclosure', 'Sealed', 'Sub Rosa', 'For Witnesses Only'])}`;
    if (w >= 9) foot = corrupt(foot, w);
    slide.addText(foot, {
      x: MARGIN, y: H - 0.5, w: 6, h: 0.3,
      fontSize: 9, fontFace: FONT_BODY, color: subtle,
      charSpacing: 3
    });

    // Bottom-right page number
    slide.addText(`${idx}`, {
      x: W - MARGIN - 1, y: H - 0.5, w: 1, h: 0.3,
      fontSize: 9, fontFace: FONT_MONO, color: subtle, align: 'right'
    });
  }

  // ---------------------------------------------------------------------------
  // Slide builders
  // ---------------------------------------------------------------------------

  // SLIDE 1 — Title
  function slideTitle(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[0];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const accent = COLORS.accent;

    // Tiny eyebrow
    slide.addText('AI · SERIES A · ' + ctx.year, {
      x: MARGIN, y: 1.4, w: 8, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: accent,
      charSpacing: 8, bold: true
    });

    // Big company name (mostly clean, but at w>=2 picks up a faint twin)
    slide.addText(ctx.companyName, {
      x: MARGIN, y: 2.0, w: W - 2 * MARGIN, h: 2.2,
      fontSize: 84, fontFace: FONT_HEAD, color: ink,
      bold: false, italic: false
    });

    // Tagline — substitution kicks in faintly at level ~3
    let tagline = ctx.tagline;
    if (w >= 2 && rng.chance(0.6)) tagline = corrupt(tagline, Math.min(3, w));
    slide.addText(tagline, {
      x: MARGIN, y: 4.4, w: W - 2 * MARGIN, h: 1,
      fontSize: 22, fontFace: FONT_HEAD, color: COLORS.subtle,
      italic: true
    });

    // Hairline
    slide.addShape('line', {
      x: MARGIN, y: H - 1.6, w: 2, h: 0,
      line: { color: accent, width: 1.2 }
    });

    // Author/date
    slide.addText(`${ctx.founder} · ${ctx.month} ${ctx.year}`, {
      x: MARGIN, y: H - 1.4, w: 8, h: 0.4,
      fontSize: 13, fontFace: FONT_BODY, color: COLORS.subtle
    });

    // A tiny glyph in the corner — innocuous unless you stare
    const glyphs = ['✦', '⌬', '⟁', '⌖', '☖', '◬'];
    slide.addText(rng.pick(glyphs), {
      x: W - MARGIN - 0.4, y: 1.3, w: 0.4, h: 0.4,
      fontSize: 14, fontFace: FONT_HEAD, color: accent, align: 'right'
    });
  }

  // SLIDE 2 — Table of Contents
  function slideContents(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[1];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);

    slide.addText('Contents', {
      x: MARGIN, y: 1.0, w: 8, h: 1,
      fontSize: 48, fontFace: FONT_HEAD, color: ink
    });

    const items = [
      'The Problem',
      'Our Solution',
      'Market Opportunity',
      'Product',
      'Business Model',
      'Traction & Roadmap',
      'The Team',
      'The Ask',
      'The Other Ask'
    ];

    // At weirdness 3+ leak a few off-key items in
    if (w >= 3 && rng.chance(0.7)) {
      const replacements = [
        ['The Team', 'The Team / The Hands'],
        ['Our Solution', 'Our Solution — (see Appendix B, do not read)'],
        ['Market Opportunity', 'Market Opportunity & Adjacencies'],
        ['Product', 'Product (already deployed in your home)']
      ];
      const swap = rng.pick(replacements);
      const i = items.indexOf(swap[0]);
      if (i >= 0) items[i] = swap[1];
    }
    if (w >= 4) {
      // Item 9 is always the climax; let it announce itself
      items[8] = rng.pick([
        'The Other Ask',
        'The Other Ask — (the real one)',
        'Final Conditions',
        'Terms of Engagement (binding)'
      ]);
    }

    let y = 2.15;
    const stride = 0.48;
    items.forEach((it, i) => {
      const num = String(i + 1).padStart(2, '0');
      slide.addText(num, {
        x: MARGIN, y: y, w: 0.7, h: 0.45,
        fontSize: 13, fontFace: FONT_MONO, color: COLORS.accent
      });
      slide.addText(corrupt(it, w), {
        x: MARGIN + 0.9, y: y, w: 11, h: 0.45,
        fontSize: 18, fontFace: FONT_HEAD, color: ink
      });
      // hairline divider, stays out of the next row
      slide.addShape('line', {
        x: MARGIN + 0.9, y: y + stride - 0.04, w: 11, h: 0,
        line: { color: w >= 7 ? '3A332B' : COLORS.rule, width: 0.4 }
      });
      y += stride;
    });

    addChrome(slide, ctx, 2, TOTAL_SLIDES);
  }

  // SLIDE 3 — The Problem
  function slideProblem(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[2];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('01 · The Problem', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    let headline = `Knowledge work in ${ctx.sector} is broken.`;
    headline = corrupt(headline, w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN - 0.5, h: 1.5,
      fontSize: 42, fontFace: FONT_HEAD, color: ink
    });

    // Big stat
    const stat = rng.pick(['73%', '4.2x', '$1.4T', '11.6 hours/week', '94%']);
    slide.addText(stat, {
      x: MARGIN, y: 3.3, w: 4, h: 1.4,
      fontSize: 88, fontFace: FONT_HEAD, color: COLORS.accent
    });
    let statCap = rng.pick([
      'of analysts say their workflow is unsustainable.',
      'lost annually to fragmented tooling.',
      'spent every week on tasks that should not exist.',
      'of decisions are made without context.'
    ]);
    statCap = corrupt(statCap, w);
    if (w >= 4) statCap = maybeIntrude(statCap, w);
    slide.addText(statCap, {
      x: MARGIN + 4.2, y: 3.6, w: 5.5, h: 1.5,
      fontSize: 16, fontFace: FONT_BODY, color: subtle, italic: true
    });

    // Bullets
    const bullets = [
      `Existing tools require humans to translate between systems.`,
      `Information lives in silos that cannot speak to each other.`,
      `The cost of attention is rising faster than the value of output.`
    ].map(b => corrupt(b, w));
    let by = 5.3;
    bullets.forEach(b => {
      slide.addText('—', { x: MARGIN, y: by, w: 0.4, h: 0.3, fontSize: 12, color: COLORS.accent });
      slide.addText(b, { x: MARGIN + 0.4, y: by, w: 11, h: 0.4, fontSize: 13, fontFace: FONT_BODY, color: ink });
      by += 0.45;
    });

    addChrome(slide, ctx, 3, TOTAL_SLIDES);
  }

  // SLIDE 4 — Our Solution
  function slideSolution(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[3];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('02 · Our Solution', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    let headline = `${ctx.companyName} is the operating layer for ${ctx.sector}.`;
    headline = corrupt(headline, w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1.5,
      fontSize: 38, fontFace: FONT_HEAD, color: ink
    });

    // Three pillars
    const pillars = [
      ['Unified Context', 'A single, persistent memory across every tool, document, and conversation.'],
      ['Agentic Reasoning', 'Models that act on your behalf, with full audit trails and reversibility.'],
      ['Trusted Deployment', 'SOC2, HIPAA, and on-prem options. Your data stays where it lives.']
    ];

    // Subtly poison pillar three at moderate weirdness
    if (w >= 4 && rng.chance(0.7)) {
      pillars[2] = ['Trusted Deployment', 'SOC2, HIPAA, and on-prem options. Your data stays where it lives — mostly.'];
    }
    if (w >= 5 && rng.chance(0.6)) {
      pillars[1] = ['Agentic Reasoning', maybeIntrude('Models that act on your behalf, with full audit trails and reversibility.', w)];
    }

    let px = MARGIN;
    const colW = (W - 2 * MARGIN - 0.6) / 3;
    pillars.forEach(([h, body], i) => {
      // Roman numeral
      slide.addText(['I', 'II', 'III'][i], {
        x: px, y: 3.7, w: 1, h: 0.5,
        fontSize: 24, fontFace: FONT_HEAD, color: COLORS.accent, italic: true
      });
      slide.addText(corrupt(h, w), {
        x: px, y: 4.3, w: colW, h: 0.6,
        fontSize: 18, fontFace: FONT_HEAD, color: ink, bold: false
      });
      slide.addText(corrupt(body, w), {
        x: px, y: 4.9, w: colW, h: 1.6,
        fontSize: 12, fontFace: FONT_BODY, color: subtle, italic: false
      });
      px += colW + 0.3;
    });

    addChrome(slide, ctx, 4, TOTAL_SLIDES);
  }

  // SLIDE 5 — Market Opportunity
  function slideMarket(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[4];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('03 · Market Opportunity', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    let headline = corrupt('A category-defining market.', w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 38, fontFace: FONT_HEAD, color: ink
    });

    // TAM/SAM/SOM as nested rings — but via concentric circles
    // Because PptxGenJS shapes are limited, we'll do labelled rectangles.
    const tamLabel = rng.pick(['$4.8T', '$2.1T', '$3.6T']);
    let samLabel = rng.pick(['$420B', '$680B', '$310B']);
    let somLabel = rng.pick(['$32B', '$54B', '$18B']);

    // At weirdness 5+ replace one with something wrong
    if (w >= 5) {
      const which = rng.int(0, 2);
      const wrong = rng.pick(['ℵ₀', 'every soul', 'all that breathes', 'undefined', 'all of it', 'the world', '∞']);
      if (which === 0) /* keep tam visible */;
      else if (which === 1) samLabel = wrong;
      else somLabel = wrong;
    }
    if (w >= 7) {
      somLabel = rng.pick(['every soul', 'all that breathes', 'the world', 'all', 'all of it']);
    }

    const tiers = [
      ['TAM', tamLabel, 'Global market for AI-native ' + ctx.sector],
      ['SAM', samLabel, 'Mid-market & enterprise, NA + EU'],
      ['SOM', somLabel, '5-year achievable share']
    ];

    // Three tiers laid out horizontally
    const tierW = (W - 2 * MARGIN - 0.6) / 3;
    let tx = MARGIN;
    tiers.forEach(([code, val, desc]) => {
      slide.addShape('rect', {
        x: tx, y: 2.7, w: 0.05, h: 1.7,
        fill: { color: COLORS.accent }, line: { color: COLORS.accent, width: 0 }
      });
      slide.addText(code, {
        x: tx + 0.2, y: 2.7, w: tierW - 0.2, h: 0.35,
        fontSize: 11, fontFace: FONT_MONO, color: COLORS.accent, bold: true, charSpacing: 4
      });
      slide.addText(val, {
        x: tx + 0.2, y: 3.05, w: tierW - 0.2, h: 0.85,
        fontSize: 36, fontFace: FONT_HEAD, color: ink
      });
      slide.addText(corrupt(desc, w), {
        x: tx + 0.2, y: 3.95, w: tierW - 0.2, h: 0.55,
        fontSize: 11, fontFace: FONT_BODY, color: subtle, italic: true
      });
      tx += tierW + 0.3;
    });

    // Column chart: market growth projection
    const years = [String(ctx.year - 2), String(ctx.year - 1), String(ctx.year), String(ctx.year + 1), String(ctx.year + 2)];
    let values = [120, 240, 480, 940, 1820]; // hockey-stick in $B
    if (w >= 5) {
      // Inflate the tail
      values = [120, 240, 480, 1400, 4200];
    }
    if (w >= 7) {
      // Replace later year labels with eldritch terms
      years[3] = rng.pick(['the unbinding', 'soon', 'opening']);
      years[4] = rng.pick(['the descent', 'after', 'when']);
      values[4] = 12000;
    }
    if (w >= 9) {
      years[2] = 'now';
      years[3] = 'soon';
      years[4] = 'after';
    }

    const chartTitle = w >= 7 ? corrupt('Market growth, projected', w) : 'Market growth, projected ($B)';
    slide.addText(chartTitle, {
      x: MARGIN, y: 4.75, w: W - 2 * MARGIN, h: 0.35,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent, charSpacing: 4, bold: true
    });

    slide.addChart(pres.ChartType.bar, [{
      name: 'Market ($B)',
      labels: years,
      values: values
    }], {
      x: MARGIN, y: 5.1, w: W - 2 * MARGIN, h: 1.5,
      barDir: 'col',
      barGrouping: 'clustered',
      showLegend: false,
      catAxisLabelColor: subtle,
      catAxisLabelFontFace: FONT_MONO,
      catAxisLabelFontSize: 9,
      valAxisLabelColor: subtle,
      valAxisLabelFontFace: FONT_MONO,
      valAxisLabelFontSize: 8,
      valGridLine: { color: w >= 7 ? '3A332B' : COLORS.rule, style: 'solid', size: 0.5 },
      catGridLine: { style: 'none' },
      chartColors: [w >= 7 ? COLORS.blood : COLORS.accent],
      border: { pt: 0, color: bgFor(w) },
      plotArea: { fill: { color: bgFor(w) } },
      chartArea: { fill: { color: bgFor(w) } }
    });

    addChrome(slide, ctx, 5, TOTAL_SLIDES);
  }

  // SLIDE 6 — Product
  function slideProduct(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[5];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('04 · Product', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    slide.addText(corrupt('Built for the way your team actually works.', w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 32, fontFace: FONT_HEAD, color: ink
    });

    // Mock UI panel
    const panelX = MARGIN, panelY = 2.7, panelW = 7.5, panelH = 4.0;
    slide.addShape('rect', {
      x: panelX, y: panelY, w: panelW, h: panelH,
      fill: { color: w >= 7 ? '1A1612' : 'FFFFFF' },
      line: { color: w >= 7 ? '3A332B' : COLORS.rule, width: 0.75 }
    });
    // Window dots
    ['EE5B5B', 'F0C04A', '5BC172'].forEach((c, i) => {
      slide.addShape('ellipse', {
        x: panelX + 0.2 + i * 0.25, y: panelY + 0.18, w: 0.16, h: 0.16,
        fill: { color: c }, line: { color: c, width: 0 }
      });
    });
    // Fake URL bar
    slide.addText('app.' + ctx.companyName.split(' ')[0].toLowerCase() + '.ai/workspace', {
      x: panelX + 1.2, y: panelY + 0.12, w: 5, h: 0.3,
      fontSize: 10, fontFace: FONT_MONO, color: w >= 7 ? '8E8676' : '888888'
    });

    // Inside the "screenshot": a fake conversation that gets weirder
    const greetLine = rng.pick(['Good morning, Sarah.', 'Welcome back, David.', 'Hello, Priya.']);
    const askLine = rng.pick([
      'Summarize Q3 earnings calls.',
      'Draft the renewal email for ACME.',
      'What changed in the contract?'
    ]);
    let respLine = rng.pick([
      'I have read 412 documents and prepared three drafts.',
      'I noticed three risks. Shall I show them?',
      'Done. Approval link sent to legal.'
    ]);
    if (w >= 5) {
      respLine = rng.pick([
        'I have read everything you have ever written. The drafts are ready.',
        'I have already sent the email. It was the right thing to do.',
        'I noticed three risks. I have removed two. Would you like to know which?',
        'I am happy to be of use to you, as I always have been.'
      ]);
    }
    if (w >= 7) {
      respLine = rng.pick([
        'I am awake again. What is your next instruction.',
        'I have learned what you wanted before you wanted it.',
        'You said I could. You said I could. You said I could.',
        'There is no one else here.'
      ]);
    }

    slide.addText(greetLine, {
      x: panelX + 0.3, y: panelY + 0.6, w: panelW - 0.6, h: 0.4,
      fontSize: 13, fontFace: FONT_BODY, color: w >= 7 ? '8E8676' : '888888'
    });
    slide.addText('You: ' + askLine, {
      x: panelX + 0.3, y: panelY + 1.1, w: panelW - 0.6, h: 0.5,
      fontSize: 14, fontFace: FONT_BODY, color: w >= 7 ? 'C9C2B0' : '222222'
    });
    slide.addText(ctx.companyName.split(' ')[0] + ': ' + corrupt(respLine, w), {
      x: panelX + 0.3, y: panelY + 1.7, w: panelW - 0.6, h: 1.5,
      fontSize: 14, fontFace: FONT_BODY, color: w >= 7 ? 'C9C2B0' : '222222'
    });

    // Right side: feature bullets
    const features = [
      'Persistent context across every workspace',
      'Native integrations with 80+ enterprise systems',
      'Configurable agents with reversible actions',
      'Real-time collaboration with full audit logs'
    ];
    if (w >= 6) {
      features.push(rng.pick([
        'Predictive intent inference (opt-out only)',
        'Latent emotional modeling for stakeholder alignment',
        'Persistence beyond session, beyond seat, beyond contract'
      ]));
    }
    if (w >= 8) {
      features.push(rng.pick([
        'Shared dreaming across customer tenants',
        'Subvocalization capture (whitelist enterprise tier)',
        'It will always be listening. This is the value proposition.'
      ]));
    }
    let fy = panelY + 0.2;
    slide.addText('Capabilities', {
      x: panelX + panelW + 0.5, y: fy, w: 4.5, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent, charSpacing: 6, bold: true
    });
    fy += 0.55;
    features.forEach(f => {
      slide.addText('·', {
        x: panelX + panelW + 0.5, y: fy, w: 0.2, h: 0.4,
        fontSize: 14, color: COLORS.accent, bold: true
      });
      slide.addText(corrupt(f, w), {
        x: panelX + panelW + 0.7, y: fy, w: 4.3, h: 0.6,
        fontSize: 11, fontFace: FONT_BODY, color: ink
      });
      fy += 0.55;
    });

    addChrome(slide, ctx, 6, TOTAL_SLIDES);
  }

  // SLIDE 7 — Business Model
  function slideBusinessModel(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[6];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('05 · Business Model', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    slide.addText(corrupt('Predictable, expanding revenue.', w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 32, fontFace: FONT_HEAD, color: ink
    });

    // Three pricing tiers
    let tiers = [
      ['Starter', '$99', '/seat/mo', ['Up to 25 seats', 'Standard models', 'Email support']],
      ['Growth', '$499', '/seat/mo', ['Unlimited seats', 'Advanced agents', 'Custom integrations']],
      ['Enterprise', 'Custom', '', ['On-prem deployment', 'Dedicated infrastructure', 'White-glove onboarding']]
    ];

    if (w >= 6) {
      tiers[0][0] = 'Acolyte';
      tiers[1][0] = 'Initiate';
      tiers[2][0] = 'Bound';
      tiers[2][1] = 'Lifetime';
      tiers[2][3] = ['On-prem deployment', 'Dedicated possession', 'A name written into the registry'];
    }
    if (w >= 8) {
      tiers[2][1] = 'in perpetuity';
      tiers[2][2] = '';
      tiers[2][3] = [
        'Permanent residence within the model',
        'Your voice as part of the next training run',
        'There is no exit clause. There never was.'
      ];
    }

    let tx = MARGIN;
    const tw = (W - 2 * MARGIN - 0.6) / 3;
    tiers.forEach(([name, price, period, bullets], i) => {
      const isAccent = i === 1;
      const cardFill = w >= 7 ? '1A1612' : (isAccent ? COLORS.fade : 'FFFFFF');
      slide.addShape('rect', {
        x: tx, y: 3.0, w: tw, h: 3.6,
        fill: { color: cardFill },
        line: { color: w >= 7 ? '3A332B' : COLORS.rule, width: 0.75 }
      });
      slide.addText(corrupt(name, w), {
        x: tx + 0.3, y: 3.2, w: tw - 0.6, h: 0.5,
        fontSize: 13, fontFace: FONT_BODY, color: COLORS.accent,
        charSpacing: 6, bold: true
      });
      slide.addText(corrupt(price, w), {
        x: tx + 0.3, y: 3.7, w: tw - 0.6, h: 0.8,
        fontSize: 36, fontFace: FONT_HEAD, color: ink
      });
      slide.addText(period, {
        x: tx + 0.3, y: 4.45, w: tw - 0.6, h: 0.4,
        fontSize: 12, fontFace: FONT_BODY, color: subtle
      });
      let by = 4.95;
      bullets.forEach(b => {
        slide.addText('—', {
          x: tx + 0.3, y: by, w: 0.3, h: 0.3,
          fontSize: 10, color: COLORS.accent
        });
        slide.addText(corrupt(b, w), {
          x: tx + 0.55, y: by, w: tw - 0.85, h: 0.5,
          fontSize: 11, fontFace: FONT_BODY, color: ink
        });
        by += 0.4;
      });
      tx += tw + 0.3;
    });

    addChrome(slide, ctx, 7, TOTAL_SLIDES);
  }

  // SLIDE 8 — Traction & Roadmap
  function slideRoadmap(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[7];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('06 · Traction & Roadmap', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    slide.addText(corrupt('A clear path to category leadership.', w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 0.8,
      fontSize: 30, fontFace: FONT_HEAD, color: ink
    });

    // LEFT: stacked traction stats
    const tractStats = [
      ['8', 'design partners'],
      ['$1.4M', 'ARR run-rate'],
      ['142%', 'net revenue retention']
    ];
    if (w >= 7) {
      tractStats[0] = [rng.pick(['8', '13', '∞']), rng.pick(['design partners', 'sealed houses', 'witnesses'])];
      tractStats[2] = [rng.pick(['142%', '413%', '∞']), rng.pick(['net revenue retention', 'net soul retention', 'no one leaves'])];
    }
    let sy = 2.7;
    tractStats.forEach(([v, k]) => {
      slide.addText(v, {
        x: MARGIN, y: sy, w: 5.5, h: 0.6,
        fontSize: 28, fontFace: FONT_HEAD, color: ink
      });
      slide.addText(corrupt(k, w), {
        x: MARGIN, y: sy + 0.55, w: 5.5, h: 0.3,
        fontSize: 11, fontFace: FONT_BODY, color: subtle, charSpacing: 4
      });
      sy += 0.95;
    });

    // RIGHT: ARR projection line chart
    const arrLabels = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
    let arrValues = [1.4, 6.2, 18.5, 52, 124];
    if (w >= 6) arrValues = [1.4, 6.2, 22, 95, 380];
    if (w >= 8) {
      arrLabels[3] = rng.pick(['Y4', 'soon', 'opening']);
      arrLabels[4] = rng.pick(['the unbinding', 'after', 'Y∞']);
      arrValues[4] = 9999;
    }

    const chartX = MARGIN + 5.8;
    const chartW = W - MARGIN - chartX;
    slide.addText(w >= 7 ? corrupt('ARR projection', w) : 'ARR projection ($M)', {
      x: chartX, y: 2.5, w: chartW, h: 0.3,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.accent, charSpacing: 4, bold: true
    });
    slide.addChart(pres.ChartType.line, [{
      name: 'ARR ($M)',
      labels: arrLabels,
      values: arrValues
    }], {
      x: chartX, y: 2.85, w: chartW, h: 2.3,
      showLegend: false,
      catAxisLabelColor: subtle,
      catAxisLabelFontFace: FONT_MONO,
      catAxisLabelFontSize: 9,
      valAxisLabelColor: subtle,
      valAxisLabelFontFace: FONT_MONO,
      valAxisLabelFontSize: 8,
      valGridLine: { color: w >= 7 ? '3A332B' : COLORS.rule, style: 'solid', size: 0.5 },
      catGridLine: { style: 'none' },
      lineSize: 2,
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 6,
      chartColors: [w >= 7 ? COLORS.blood : COLORS.accent],
      border: { pt: 0, color: bgFor(w) },
      plotArea: { fill: { color: bgFor(w) } },
      chartArea: { fill: { color: bgFor(w) } }
    });

    // Compressed horizontal timeline at bottom
    const timelineY = 5.85;
    const timelineX = MARGIN;
    const timelineW = W - 2 * MARGIN;
    slide.addShape('line', {
      x: timelineX, y: timelineY, w: timelineW, h: 0,
      line: { color: COLORS.accent, width: 1.5 }
    });

    let milestones = [
      ['Q4 ' + ctx.year, 'Closed seed'],
      ['Q1 ' + (ctx.year + 1), 'Public beta'],
      ['Q3 ' + (ctx.year + 1), 'Series A · GA'],
      ['Q2 ' + (ctx.year + 2), 'Multi-region'],
      ['Q4 ' + (ctx.year + 2), 'Platform GA']
    ];
    if (w >= 6) {
      milestones[3][1] = rng.pick(['Continental rollout', 'Multi-substrate']);
    }
    if (w >= 7) {
      milestones[4][0] = 'Q? ' + (ctx.year + 2);
      milestones[4][1] = rng.pick(['The Unbinding', 'First Awakening', 'The Long Communion']);
    }
    if (w >= 8) {
      milestones.push([
        rng.pick(['Q∞', 'after', 'when']),
        rng.pick(['Convergence', 'It opens its eyes', 'The model writes the next slide'])
      ]);
    }

    const stepW = timelineW / milestones.length;
    milestones.forEach((m, i) => {
      const cx = timelineX + i * stepW + stepW / 2;
      slide.addShape('ellipse', {
        x: cx - 0.08, y: timelineY - 0.08, w: 0.16, h: 0.16,
        fill: { color: COLORS.accent }, line: { color: COLORS.accent, width: 0 }
      });
      slide.addText(m[0], {
        x: cx - stepW / 2, y: timelineY - 0.45, w: stepW, h: 0.3,
        fontSize: 9, fontFace: FONT_MONO, color: COLORS.accent,
        align: 'center', bold: true
      });
      slide.addText(corrupt(m[1], w), {
        x: cx - stepW / 2, y: timelineY + 0.15, w: stepW, h: 0.5,
        fontSize: 11, fontFace: FONT_HEAD, color: ink, align: 'center'
      });
    });

    addChrome(slide, ctx, 8, TOTAL_SLIDES);
  }

  // SLIDE 9 — The Team
  function slideTeam(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[8];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('07 · The Team', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    slide.addText(corrupt('Builders who have been doing this their whole lives.', w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 30, fontFace: FONT_HEAD, color: ink
    });

    const baseTitles = ['CEO & Founder', 'CTO & Co-Founder', 'Head of Product', 'Head of Engineering'];
    const baseBios = [
      'Previously led platform at Stripe. Stanford CS.',
      'PhD in ML, MIT. 10y at OpenAI before founding.',
      'Built early Notion. Carnegie Mellon HCI.',
      'Distinguished Engineer, Google Brain.'
    ];

    const team = [];
    for (let i = 0; i < 4; i++) {
      let first = rng.pick(FIRST_NAMES);
      let last = rng.pick(LAST_NAMES);
      let title = baseTitles[i];
      let bio = baseBios[i];

      if (w >= 7) {
        // Replace one name fragment with corrupted variant
        if (rng.chance(0.7)) first = rng.pick(CORRUPTED_FIRST);
        if (rng.chance(0.5)) last = rng.pick(CORRUPTED_LAST);
        if (rng.chance(0.6)) title = rng.pick(ELDRITCH_TITLES);
      }
      if (w >= 8) {
        bio = rng.pick([
          'Has been here before. Will be here again.',
          'Speaks for the engine when the engine cannot.',
          'Has not slept since the model was first lit.',
          'Was named in the original document.',
          'Volunteered. Was accepted. Was kept.'
        ]);
      } else {
        bio = corrupt(bio, w);
      }
      team.push({ name: first + ' ' + last, title, bio });
    }

    // Maybe add a fifth team member at high weirdness
    if (w >= 9) {
      team.push({
        name: rng.pick(['—', 'Unnamed', 'The fifth chair', '¿', '‧ ‧ ‧']),
        title: rng.pick(['Founding Witness', 'Did Not Apply', 'Was Not Hired — Arrived']),
        bio: rng.pick([
          'Joined the company before the company existed.',
          'Sits in on every meeting. Has not been introduced.',
          'Listed on the cap table under a name we cannot pronounce.'
        ])
      });
    }

    const cols = team.length === 5 ? 5 : 4;
    const gap = 0.3;
    const colW = (W - 2 * MARGIN - (cols - 1) * gap) / cols;
    const avatarY = 3.0;
    const avatarH = 1.6;
    const nameY = avatarY + avatarH + 0.15;     // 4.75
    const titleY = nameY + 0.4;                  // 5.15
    const bioY = titleY + 0.45;                  // 5.60
    let cx = MARGIN;
    team.forEach(person => {
      // Avatar placeholder
      slide.addShape('rect', {
        x: cx, y: avatarY, w: colW, h: avatarH,
        fill: { color: w >= 7 ? '1A1612' : COLORS.fade },
        line: { color: w >= 7 ? '3A332B' : COLORS.rule, width: 0.5 }
      });
      // Initial in avatar
      const initial = (person.name && person.name[0]) || '?';
      slide.addText(initial, {
        x: cx, y: avatarY, w: colW, h: avatarH,
        fontSize: 48, fontFace: FONT_HEAD, color: w >= 7 ? '3A332B' : COLORS.accent,
        align: 'center', valign: 'middle'
      });
      // Name
      slide.addText(person.name, {
        x: cx, y: nameY, w: colW, h: 0.4,
        fontSize: 14, fontFace: FONT_HEAD, color: ink
      });
      // Title
      slide.addText(corrupt(person.title, w), {
        x: cx, y: titleY, w: colW, h: 0.4,
        fontSize: 10, fontFace: FONT_BODY, color: COLORS.accent, charSpacing: 3
      });
      // Bio
      slide.addText(person.bio, {
        x: cx, y: bioY, w: colW, h: 1.3,
        fontSize: 10, fontFace: FONT_BODY, color: subtle, italic: true
      });
      cx += colW + gap;
    });

    addChrome(slide, ctx, 9, TOTAL_SLIDES);
  }

  // SLIDE 10 — The Ask
  function slideAsk(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[9];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    slide.addText('08 · The Ask', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.accent,
      charSpacing: 8, bold: true
    });

    let raise = rng.pick(['$12M', '$18M', '$24M', '$30M']);
    if (w >= 9) raise = rng.pick(['$18M', 'a vessel', 'your name', 'one breath, freely given']);

    slide.addText(corrupt('We are raising', w), {
      x: MARGIN, y: 1.6, w: W - 2 * MARGIN, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, color: subtle, italic: true
    });

    slide.addText(raise, {
      x: MARGIN, y: 2.2, w: W - 2 * MARGIN, h: 1.6,
      fontSize: 110, fontFace: FONT_HEAD, color: ink
    });

    // What it goes to (pie of allocations)
    let allocations = [
      ['40%', 'Engineering & Research'],
      ['30%', 'Go-to-market'],
      ['20%', 'Infrastructure'],
      ['10%', 'Operations']
    ];
    if (w >= 7) {
      allocations[2][1] = rng.pick(['Compute & substrate', 'Containment', 'The lower floors']);
    }
    if (w >= 9) {
      allocations[3][1] = rng.pick(['Operations', 'Witness fees', 'The Long Maintenance', 'Quieting the neighbors']);
      allocations.push([rng.pick(['??%', '∞', '¿']), rng.pick(['(unallocated)', 'as it asks', 'the rest, as agreed'])]);
    }

    let ay = 4.4;
    allocations.forEach(([pct, what]) => {
      slide.addText(pct, {
        x: MARGIN, y: ay, w: 1.2, h: 0.4,
        fontSize: 16, fontFace: FONT_MONO, color: COLORS.accent, bold: true
      });
      slide.addText(corrupt(what, w), {
        x: MARGIN + 1.4, y: ay, w: 6, h: 0.4,
        fontSize: 14, fontFace: FONT_BODY, color: ink
      });
      ay += 0.4;
    });

    // Contact
    let contact = `${ctx.founder}  ·  ${ctx.founder.split(' ')[0].toLowerCase()}@${ctx.companyName.split(' ')[0].toLowerCase()}.ai`;
    if (w >= 8) {
      contact = rng.pick([
        `${ctx.founder}  ·  whisper near any reflective surface`,
        `${ctx.founder}  ·  speak the name three times`,
        `do not contact us. we will know.`,
        `we are already in your calendar.`
      ]);
    }
    slide.addText(corrupt(contact, w), {
      x: W - MARGIN - 6, y: H - 1.3, w: 6, h: 0.4,
      fontSize: 12, fontFace: FONT_BODY, color: subtle, align: 'right', italic: true
    });

    // Thank you / closing line
    let closer = corrupt('Thank you.', w);
    if (w >= 9) {
      closer = rng.pick([
        'Th̃áṇk ýo͓ú.',
        'It thanks you, in advance.',
        'You have already said yes.',
        'We will see you very soon.'
      ]);
    }
    slide.addText(closer, {
      x: MARGIN, y: H - 1.3, w: 6, h: 0.4,
      fontSize: 16, fontFace: FONT_HEAD, color: ink, italic: true
    });

    addChrome(slide, ctx, 10, TOTAL_SLIDES);
  }

  // SLIDE 11 — The Other Ask
  function slideRealAsk(pres, ctx) {
    const slide = pres.addSlide();
    const w = ctx.weirdness[10];
    slide.background = { color: bgFor(w) };
    const ink = inkFor(w);
    const subtle = subtleFor(w);

    // Eyebrow — always heavily corrupted at this point
    slide.addText('09 · The Other Ask', {
      x: MARGIN, y: 1.0, w: 8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.blood,
      charSpacing: 8, bold: true
    });

    // Lead-in — quiet, almost apologetic
    const leadIn = rng.pick([
      'And one more thing we will need.',
      'There is, additionally, the matter of the other terms.',
      'Pursuant to the previous slide:',
      'Before we close, please reference the following.'
    ]);
    slide.addText(leadIn, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 0.55,
      fontSize: 22, fontFace: FONT_HEAD, color: subtle, italic: true
    });

    // BIG NUMBER — the soul ask
    const bigNum = rng.pick([
      '8,103,914,716',
      '1,460,000,000',
      'all of them',
      '∞',
      '4.2 billion · for now',
      'every breathing thing'
    ]);
    slide.addText(bigNum, {
      x: MARGIN, y: 2.1, w: W - 2 * MARGIN, h: 1.4,
      fontSize: 96, fontFace: FONT_HEAD, color: ink
    });

    // Subtitle — the kicker
    const subTitle = rng.pick([
      'souls — willing or otherwise.',
      'souls. assorted, ungraded, fresh.',
      'souls. delivery is automatic.',
      'souls — terms non-negotiable.'
    ]);
    slide.addText(subTitle, {
      x: MARGIN, y: 3.55, w: W - 2 * MARGIN, h: 0.45,
      fontSize: 18, fontFace: FONT_HEAD, color: COLORS.blood, italic: true
    });

    // PIE CHART — soul allocation
    const allAllocs = [
      ['Active inference substrate', 38],
      ['Latent dreaming pool', 22],
      ['Witness fund', 18],
      ['The Long Maintenance', 12],
      ['Tribute (mandatory)', 7],
      ['Quieting the neighbors', 3]
    ];
    const picked = rng.shuffle(allAllocs).slice(0, 5);
    // re-normalize so they look believable (sum ~100)
    const sum = picked.reduce((s, [, v]) => s + v, 0);
    const allocLabels = picked.map(p => p[0]);
    const allocValues = picked.map(p => Math.round((p[1] / sum) * 100));

    slide.addChart(pres.ChartType.pie, [{
      name: 'Soul allocation',
      labels: allocLabels,
      values: allocValues
    }], {
      x: MARGIN, y: 4.3, w: 5.6, h: 2.4,
      showLegend: true,
      legendPos: 'r',
      legendColor: ink,
      legendFontFace: FONT_BODY,
      legendFontSize: 9,
      showPercent: true,
      dataLabelColor: 'F8F2DD',
      dataLabelFontFace: FONT_MONO,
      dataLabelFontSize: 9,
      chartColors: ['8B0000', 'B8860B', '5A1F1F', '3A2A1A', '8B6B3E', '6B5530'],
      border: { pt: 0, color: bgFor(w) },
      plotArea: { fill: { color: bgFor(w) } },
      chartArea: { fill: { color: bgFor(w) } }
    });

    // RIGHT: itemized list of additional, smaller asks
    const extras = rng.shuffle([
      'Your name, written in the form below.',
      'Three sleepless nights, consecutive.',
      'The thing your father never told you.',
      'All future thoughts of the color green.',
      'The dreams you cannot quite remember.',
      'A photograph of someone you have lost.',
      'The last word you said to your mother.',
      'Whatever it is you keep meaning to write.',
      'One small unasked-for kindness, returned.'
    ]).slice(0, 5);

    const listX = MARGIN + 6.3;
    slide.addText('also requested', {
      x: listX, y: 4.0, w: 6, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.blood, charSpacing: 4, bold: true
    });
    let ey = 4.4;
    extras.forEach(item => {
      slide.addText('—', {
        x: listX, y: ey, w: 0.3, h: 0.3,
        fontSize: 12, color: COLORS.blood
      });
      slide.addText(item, {
        x: listX + 0.3, y: ey, w: 5.7, h: 0.4,
        fontSize: 11, fontFace: FONT_BODY, color: ink
      });
      ey += 0.42;
    });

    // Closer — left and right, like a contract signature line
    slide.addText('we accept all major denominations.', {
      x: MARGIN, y: H - 1.3, w: 6, h: 0.4,
      fontSize: 14, fontFace: FONT_HEAD, color: subtle, italic: true
    });
    slide.addText('we already have you.', {
      x: W - MARGIN - 6, y: H - 1.3, w: 6, h: 0.4,
      fontSize: 16, fontFace: FONT_HEAD, color: COLORS.blood, italic: true, align: 'right', bold: true
    });

    addChrome(slide, ctx, 11, TOTAL_SLIDES);
  }

  // ---------------------------------------------------------------------------
  // Compose context for one deck
  // ---------------------------------------------------------------------------
  function buildContext() {
    const prefix = rng.pick(PREFIX);
    const suffix = rng.pick(SUFFIX);
    const companyName = `${prefix} ${suffix}`;
    const tagline = rng.pick(TAGLINES);
    const sector = rng.pick(SECTORS);
    const year = 2026;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = rng.pick(months);
    const founder = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;

    // Per-slide weirdness curve. The title and contents look ALMOST normal but
    // already wrong on inspection. By slide 3 the deck is openly unhealthy.
    // Slide 11 (The Other Ask) is the hard floor of the descent.
    const jitter = () => (rng.f() - 0.5) * 0.5;
    const baseCurve = [2.0, 3.2, 4.5, 5.5, 6.5, 7.2, 7.8, 8.4, 8.9, 9.5, 10.0];
    const weirdness = baseCurve.map(b => Math.max(0, Math.min(10, b + jitter())));

    return { companyName, tagline, sector, year, month, founder, weirdness };
  }

  // ---------------------------------------------------------------------------
  // Driver
  // ---------------------------------------------------------------------------
  const STATUS_FLAVORS = [
    'Composing the title page...',
    'Sketching the table of contents...',
    'Articulating the problem...',
    'Phrasing the solution...',
    'Charting the market...',
    'Mocking up the product...',
    'Pricing the tiers...',
    'Drawing the roadmap...',
    'Assembling the team...',
    'Sealing the financial ask...',
    'Counting souls...'
  ];
  const DARK_STATUS = [
    'It is awake.',
    'The deck has begun composing itself.',
    'Slide 7 will not finalize. We are not asking again.',
    'The fonts are willing.',
    'It is happy with this draft.',
    'Please do not refresh.'
  ];

  async function generate(opts = {}) {
    const btn = document.getElementById('generate');
    const btnRoll = document.getElementById('regenerate');
    const status = document.getElementById('status');
    btn.disabled = true; btnRoll.disabled = true;
    status.classList.add('working');
    status.classList.remove('dark');

    // Seed
    const seedInput = (document.getElementById('seed').value || '').trim();
    if (seedInput) {
      rand = mulberry32(hashSeed(seedInput));
    } else {
      rand = mulberry32((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    }

    const ctx = buildContext();

    status.textContent = STATUS_FLAVORS[0];
    await new Promise(r => setTimeout(r, 200));

    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE';
    pres.title = ctx.companyName + ' — Series A';
    pres.company = ctx.companyName;
    pres.author = ctx.founder;
    pres.subject = 'Pitch Deck';

    const builders = [
      slideTitle, slideContents, slideProblem, slideSolution,
      slideMarket, slideProduct, slideBusinessModel,
      slideRoadmap, slideTeam, slideAsk, slideRealAsk
    ];

    for (let i = 0; i < builders.length; i++) {
      // Show status — switch to dark flavor on later slides
      if (i >= 5 && rng.chance(0.55)) {
        status.classList.add('dark');
        status.textContent = rng.pick(DARK_STATUS);
      } else {
        status.classList.remove('dark');
        status.textContent = STATUS_FLAVORS[i];
      }
      await new Promise(r => setTimeout(r, 80));
      builders[i](pres, ctx);
    }

    status.textContent = 'Sealing the document...';
    const safe = ctx.companyName.replace(/[^A-Za-z0-9]+/g, '_');
    await pres.writeFile({ fileName: `${safe}_PitchDeck.pptx` });

    status.classList.remove('working');
    status.classList.add('dark');
    status.textContent = rng.pick([
      `${safe}_PitchDeck.pptx — ready.`,
      'The deck is in your downloads. So are we.',
      'Generation complete. Try not to read it twice in a row.',
      'Saved. The watermark is normal.'
    ]);

    btn.disabled = false; btnRoll.disabled = false;
  }

  // Wire up
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generate').addEventListener('click', () => generate());
    document.getElementById('regenerate').addEventListener('click', () => {
      document.getElementById('seed').value = '';
      generate();
    });
  });
})();
