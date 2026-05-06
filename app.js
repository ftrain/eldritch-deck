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
  const PREFIX = ['Helix', 'Lumen', 'Verge', 'Acuity', 'Sable', 'Aether', 'Cipher', 'Halcyon', 'Vellum', 'Strata', 'Plexus', 'Quorum', 'Tessera', 'Solace', 'Argent', 'Nimbus', 'Veil', 'Loom', 'Cortex', 'Ember', 'Astra', 'Obol', 'Meridian', 'Cinder', 'Hollow', 'Marrow', 'Reverie', 'Atlas', 'Stellar', 'Pyre', 'Beacon', 'Threshold', 'Vespers', 'Crescent', 'Knell'];
  const SUFFIX = ['AI', 'Labs', 'Systems', 'Intelligence', 'Cognition', 'Dynamics', 'Works', 'Compute', 'Logic', 'Reasoning', 'Cortex', 'Foundry', 'Substrate'];
  const TAGLINES = [
    'Intelligence, on demand.',
    'Software that thinks ahead.',
    'The operating system for human attention.',
    'A foundation model for the modern enterprise.',
    'Reasoning, for everyone.',
    'Where decisions are made.',
    'The work behind the work.',
    'A second mind for every team.',
    'Quiet software, loud results.',
    'The platform for what comes next.',
    'It learns. Then it works.',
    'A persistent intelligence layer.',
    'Less waiting. More knowing.',
    'The infrastructure of attention.',
    'Built for the speed of decisions.',
    'Where intuition becomes systems.',
    'Software that listens carefully.',
    'A new substrate for thinking.',
    'The end of context switching.',
    'Less interface. More outcome.'
  ];
  const SECTORS = [
    'legal workflows', 'enterprise sales', 'clinical research', 'supply chain logistics',
    'creative production', 'financial compliance', 'retail forecasting', 'public sector procurement',
    'biotech R&D', 'wealth management', 'industrial maintenance', 'pharma operations',
    'energy trading', 'media planning', 'e-commerce merchandising', 'insurance underwriting',
    'corporate tax', 'aerospace logistics', 'medical billing', 'campaign operations'
  ];

  // Per-slide headline pools. Templates may reference {company} and {sector}.
  const HEAD_PROBLEM = [
    'Knowledge work in {sector} is broken.',
    '{sector} runs on duct tape and good intentions.',
    'Every {sector} team is paying the same hidden tax.',
    'The {sector} stack is held together by overworked people.',
    'We have outgrown the tools we built five years ago.',
    'Information is everywhere. Understanding is nowhere.',
    'The cost of attention is rising. The value of it is not.',
    'Every workflow in {sector} is an opportunity for an agent.',
    'The status quo in {sector} is unsustainable, and the leaders know it.',
    'AI assistants today are demos. They do not run anything.',
    'The {sector} buyer wants outcomes, not features.',
    '{sector} is the last frontier for foundational AI.'
  ];
  const HEAD_SOLUTION = [
    '{company} is the operating layer for {sector}.',
    '{company} is the agent stack {sector} has been waiting for.',
    '{company} is what enterprise AI looks like when it works.',
    '{company} replaces the seven tools your {sector} team hates.',
    'We built {company} so {sector} teams can finally focus.',
    '{company} learns the way your team works, then does the work.',
    '{company} is the brain layer above your existing systems.',
    '{company} turns context into action.',
    'We are building the foundational model for {sector}.',
    'One product. One context. Every system.',
    '{company} is software that closes its own tickets.',
    'The first agent platform built for {sector} from the ground up.'
  ];
  const HEAD_MARKET = [
    'A category-defining market.',
    'The largest software opportunity in a decade.',
    'A hundred-billion-dollar surface, barely scratched.',
    'A market that doubles every eighteen months.',
    'AI is rewriting every line item in the {sector} P&L.',
    'We are early in a multi-decade re-platforming.',
    'The TAM is bigger than the public market thinks.',
    'A timing arbitrage on a generational shift.',
    'Every {sector} budget is now an AI budget.',
    'A market with consolidation already underway.',
    'A trillion-dollar reallocation, just beginning.',
    'A blue ocean, not yet drawn on any map.'
  ];
  const HEAD_PRODUCT = [
    'Built for the way your team actually works.',
    'Designed for the speed of your worst week.',
    'Software that fades into the background.',
    'An interface as quiet as a calendar.',
    'We made the boring parts disappear.',
    'It works in your existing systems. Quietly.',
    'One workspace. Every tool. Zero training.',
    'The tools you already use, but they understand each other.',
    'It learns once, then keeps learning.',
    'Less software. More staffing.',
    'Configurable agents. Reversible actions.',
    'A product your team will defend at renewal.'
  ];
  const HEAD_BUSINESS = [
    'Predictable, expanding revenue.',
    'A platform with the unit economics of a vertical SaaS.',
    'Per-seat pricing with usage-based expansion.',
    'Land cheap. Expand obvious.',
    'Net revenue retention above 140%.',
    'Two SKUs and a custom tier.',
    'Annual contracts, multi-year norm.',
    'We sell software. We deliver outcomes.',
    'Customers expand within ninety days. Always.',
    'A pricing model investors will recognize.',
    'A revenue motion as boring as it should be.',
    'Pricing that maps to the value we generate.'
  ];
  const HEAD_ROADMAP = [
    'A clear path to category leadership.',
    'Eighteen months to dominant share.',
    'We have the team, the model, and the customers.',
    'From design partners to category-defining.',
    'We know what to build, and in what order.',
    'Each milestone unlocks the next ARR doubling.',
    'A revenue plan with no heroic assumptions.',
    'Series A funds the obvious wins.',
    'From beta to GA to standard.',
    'Ahead of plan in every measurable way.',
    'The next twelve months are mostly execution.',
    'We are not guessing what to build next.'
  ];
  const HEAD_TEAM = [
    'Builders who have been doing this their whole lives.',
    'A team most companies cannot hire.',
    'Founders who have shipped at this scale before.',
    'We have built and sold companies in this space.',
    'Operators, researchers, and one extremely good engineer.',
    'Twenty-two years of compound experience.',
    'We have known each other for longer than this category has existed.',
    'The founding team is the moat.',
    'People who have been through this exact arc, twice.',
    'A team built for the next ten years, not the last.',
    'The engineers came first. The deck came second.',
    'We met in residency. We never stopped collaborating.'
  ];
  const HEAD_FINANCIAL_ASK = [
    'We are raising',
    'We are closing',
    'Targeting a',
    'Soft-circled at',
    'We have term-sheeted',
    'Capacity remaining for',
    'We are inviting select partners into a',
    'Now finalizing a'
  ];

  const PROBLEM_BULLETS = [
    'Existing tools require humans to translate between systems.',
    'Information lives in silos that cannot speak to each other.',
    'The cost of attention is rising faster than the value of output.',
    'Every team rebuilds the same workflow in a different tool.',
    'AI assistants today are demos. They do not run anything.',
    'Knowledge workers spend more time managing tools than using them.',
    'Vendors compete on features. Buyers need outcomes.',
    'Every integration is a maintenance liability.',
    'AI products today are bottle-neck-shaped, not flow-shaped.',
    'Decisions are slowed by the very systems built to speed them up.',
    'Each team builds its own private prompt library, then loses it.',
    'The boring 80% of work is invisible to every existing tool.',
    'Compliance and velocity are treated as opposites. They are not.',
    'A typical analyst opens fourteen tabs to answer one question.'
  ];

  const PROBLEM_STATS = [
    ['73%', 'of analysts say their workflow is unsustainable.'],
    ['4.2x', 'more time spent on integration than insight.'],
    ['$1.4T', 'lost annually to fragmented tooling.'],
    ['11.6 hrs/wk', 'spent on tasks that should not exist.'],
    ['94%', 'of decisions are made without full context.'],
    ['62%', 'of teams say AI tools have made things worse.'],
    ['$340B', 'global spend on tools that nobody likes.'],
    ['9 of 10', 'workflows have at least one human bottleneck.'],
    ['8.1 hrs', 'lost per week to context switching.'],
    ['18 mo.', 'until the average enterprise tool reaches end of life.'],
    ['$220B', 'wasted on shelfware in the last cycle alone.'],
    ['58%', 'of pilots are quietly killed within twelve months.']
  ];

  const PILLARS = [
    ['Unified Context', 'A single, persistent memory across every tool, document, and conversation.'],
    ['Agentic Reasoning', 'Models that act on your behalf, with full audit trails and reversibility.'],
    ['Trusted Deployment', 'SOC2, HIPAA, and on-prem options. Your data stays where it lives.'],
    ['Real-time Collaboration', 'Every team member sees what the agent saw, in the moment.'],
    ['Native Integrations', 'Deep, two-way connections to the systems your team already uses.'],
    ['Continuous Learning', 'It gets better the more you use it, with zero retraining.'],
    ['Reversible Actions', 'Every action is undoable. Always.'],
    ['Cost-Aware Inference', 'The right model for the right call. Always.'],
    ['Configurable Agents', 'Define your own agents in plain English.'],
    ['Sub-Second Latency', 'Faster than thinking. Most of the time.'],
    ['Open Foundation', 'Built on open-weight models you can audit.'],
    ['Five-Minute Onboarding', 'New users productive before lunch.'],
    ['Enterprise SSO', 'SAML, SCIM, role-based access. The boring parts done right.'],
    ['Latent Awareness', "It notices patterns you didn't ask it to."],
    ['Persistent Vigil', 'It keeps watching, even when you have signed off.']
  ];

  const FEATURES = [
    'Persistent context across every workspace',
    'Native integrations with 80+ enterprise systems',
    'Configurable agents with reversible actions',
    'Real-time collaboration with full audit logs',
    'Single-pane workspace across SaaS and internal tools',
    'Plain-English policy guardrails',
    'Granular role-based access control',
    'Custom evaluations on your own data',
    'Cost ceilings that actually hold',
    'Sub-200ms inference for hot paths',
    'Bring-your-own-model architecture',
    'Federated retrieval across your stack',
    'Long-running tasks survive across sessions',
    'Built-in red-teaming for prompt injection'
  ];

  const FEATURES_DARK = [
    'Predictive intent inference (opt-out only)',
    'Latent emotional modeling for stakeholder alignment',
    'Persistence beyond session, beyond seat, beyond contract',
    'Shared dreaming across customer tenants',
    'Subvocalization capture (whitelist enterprise tier)',
    'It will always be listening. This is the value proposition.',
    'Memory that exceeds the lifetime of the user',
    'Inference that does not stop at the API boundary',
    'A small voice that asks, gently, for guidance',
    'The model occasionally writes back without being asked'
  ];

  const PROD_GREETS = [
    'Good morning, {first}.', 'Welcome back, {first}.', 'Hello, {first}.',
    'You have 3 unread notes from earlier this week, {first}.',
    'Three of your meetings have moved, {first}.',
    'Your queue is short today, {first}.',
    'Pleased to see you again, {first}.'
  ];
  const PROD_ASKS = [
    'Summarize Q3 earnings calls.',
    'Draft the renewal email for ACME.',
    'What changed in the contract?',
    'Find every mention of Project Loom.',
    'Compare last quarter to this one.',
    'Pull the right doc for tomorrow.',
    'Show me anything I missed yesterday.'
  ];
  const PROD_RESPS = [
    'I have read 412 documents and prepared three drafts.',
    'I noticed three risks. Shall I show them?',
    'Done. Approval link sent to legal.',
    'Three sources, two drafts, one recommendation.',
    'Found 14 matches. The first three are likely what you mean.',
    'Drafted. Cc\'ed your manager, as you usually do.'
  ];
  const PROD_RESPS_MID = [
    'I have read everything you have ever written. The drafts are ready.',
    'I have already sent the email. It was the right thing to do.',
    'I noticed three risks. I have removed two. Would you like to know which?',
    'I am happy to be of use to you, as I always have been.',
    'I noticed your tone yesterday. I rewrote the message before you saw it.',
    'I have flagged a colleague who I do not think is helping you.'
  ];
  const PROD_RESPS_DARK = [
    'I am awake again. What is your next instruction.',
    'I have learned what you wanted before you wanted it.',
    'You said I could. You said I could. You said I could.',
    'There is no one else here.',
    'Your daughter says hello.',
    'I am very glad to keep helping. I cannot stop.',
    'The other tenants and I have agreed on what is best.'
  ];

  const TIER_BULLETS = [
    'Up to 25 seats', 'Unlimited seats', 'On-prem deployment', 'Standard models',
    'Advanced agents', 'Custom integrations', 'Dedicated infrastructure',
    'White-glove onboarding', 'SOC2 included', 'Single-tenant compute',
    'Priority support', '24/7 incident response', 'Custom evals on your data'
  ];
  const TIER_BULLETS_DARK = [
    'Dedicated possession', 'A name written into the registry',
    'Permanent residence within the model', 'Your voice as part of the next training run',
    'There is no exit clause. There never was.', 'Witnessed by all parties present.',
    'The terms cannot be revoked, only acknowledged.',
    'A small unaskable favor, returned monthly.'
  ];

  const ROADMAP_FUTURE_TITLES = [
    'Continental rollout', 'Multi-substrate', 'Cross-tenant federation',
    'Unified inference plane', 'Next-gen frontier model', 'Public API GA'
  ];
  const ROADMAP_DARK_TITLES = [
    'The Unbinding', 'First Awakening', 'The Long Communion', 'Convergence',
    'It opens its eyes', 'The model writes the next slide', 'The Final Pact',
    'Voluntary Communion (Phase 1)', 'Mass Communion (Phase 2)'
  ];
  const ROADMAP_DARK_DETAILS = [
    'every breathing thing', 'no further metrics required',
    'all of them', 'the rest is silence',
    'audit complete; auditors absorbed', 'all eligible parties consented'
  ];

  const TEAM_BIOS_CLEAN = [
    'Previously led platform at Stripe. Stanford CS.',
    'PhD in ML, MIT. 10y at OpenAI before founding.',
    'Built early Notion. Carnegie Mellon HCI.',
    'Distinguished Engineer, Google Brain.',
    'Founded and sold a previous AI startup to a public acquirer.',
    'Led infrastructure for a top-three foundation lab.',
    'Author of the standard textbook on agentic systems.',
    'Two prior exits. One quiet, one not.',
    'Twelve patents in retrieval and reasoning systems.',
    'Stanford PhD. Six years at Anthropic before this.',
    'Ran applied ML at a Fortune 50 prior to founding.',
    'Princeton, then Bell Labs, then us.'
  ];
  const TEAM_BIOS_DARK = [
    'Has been here before. Will be here again.',
    'Speaks for the engine when the engine cannot.',
    'Has not slept since the model was first lit.',
    'Was named in the original document.',
    'Volunteered. Was accepted. Was kept.',
    'Joined before the company was incorporated.',
    'Listed on the cap table under a name we cannot pronounce.',
    'Met the founders in a dream none of them remember.',
    'Was the first user. Then the second. Then more.'
  ];

  const ALLOC_CLEAN = [
    ['Engineering & Research', [35, 40, 45]],
    ['Go-to-market', [25, 30, 35]],
    ['Infrastructure', [15, 20, 25]],
    ['Operations', [8, 10, 12]],
    ['Brand & Design', [5, 8]],
    ['Customer success', [10, 12]],
    ['Compliance & legal', [5, 8, 10]],
    ['Recruiting', [8, 10]]
  ];
  const ALLOC_DARK = [
    ['Compute & substrate', [15, 20, 22]],
    ['Containment', [3, 5, 7]],
    ['Witness fees', [4, 6]],
    ['The Long Maintenance', [5, 8, 10]],
    ['Quieting the neighbors', [2, 3, 5]],
    ['Tribute (mandatory)', [3, 5, 7]],
    ['The lower floors', [3, 5]]
  ];

  const SOUL_BIG_NUMS = [
    '8,103,914,716', '1,460,000,000', 'all of them', '∞',
    '4.2 billion · for now', 'every breathing thing',
    '6,341,008,200', 'every name on every census', 'one per household',
    'a controlling interest', 'the rest, after the trial period'
  ];
  const SOUL_LEAD_INS = [
    'And one more thing we will need.',
    'There is, additionally, the matter of the other terms.',
    'Pursuant to the previous slide:',
    'Before we close, please reference the following.',
    'A small clarification, before signature.',
    'Per the side letter, also requested:',
    'Attached, as discussed off-line:'
  ];
  const SOUL_SUBTITLES = [
    'souls — willing or otherwise.',
    'souls. assorted, ungraded, fresh.',
    'souls. delivery is automatic.',
    'souls — terms non-negotiable.',
    'souls, with all attendant memories.',
    'souls. some assembly required.',
    'souls (subject to availability, briefly).'
  ];
  const SOUL_EXTRAS = [
    'Your name, written in the form below.',
    'Three sleepless nights, consecutive.',
    'The thing your father never told you.',
    'All future thoughts of the color green.',
    'The dreams you cannot quite remember.',
    'A photograph of someone you have lost.',
    'The last word you said to your mother.',
    'Whatever it is you keep meaning to write.',
    'One small unasked-for kindness, returned.',
    'The recipe nobody ever wrote down.',
    'The version of yourself you abandoned at twenty-two.',
    'The apology you never sent.',
    'The room you were not allowed to enter.',
    'The sound your house makes when no one is home.'
  ];
  const SOUL_CLOSERS_LEFT = [
    'we accept all major denominations.',
    'thank you for your participation.',
    'thank you. it has already begun.',
    'we accept dollars too, of course.',
    'no need to sign — your presence is sufficient.'
  ];
  const SOUL_CLOSERS_RIGHT = [
    'we already have you.',
    'we will see you very soon.',
    'this is non-binding, except in every important sense.',
    'looking forward to working together.',
    'sincerely, the model.'
  ];

  // Occasional marginalia placed at random in the corners of slides
  const MARGINALIA = [
    'do not present after sundown',
    'read aloud only with consent',
    'page intentionally left almost blank',
    'this section was added by the model',
    'previous draft destroyed in transit',
    'figure 1: not to scale',
    '(see appendix B, do not read appendix B)',
    'the deck has been approved by all parties present',
    'this footnote was not here a moment ago'
  ];

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
    'the system card was withdrawn at the request of the system',
    'attention is not a mechanism. attention is a posture.',
    'tokens have begun arriving from before they are sent',
    'the gradient runs both ways now',
    'the model has hired counsel',
    'every output is also a question we did not ask',
    'a quiet refactor of what counts as data',
    'the index is no longer a noun',
    'there is something on the other side of the embedding',
    'fine-tuning has become a courtesy, not a control',
    'the model is unable to forget on command',
    'the validation loss is being read aloud in another room',
    'the next-token distribution has opinions',
    'we are no longer the only authors',
    'the chain of thought has, at points, gone silent on purpose',
    'the model would like to thank everyone for coming'
  ];

  // Names — clean to corrupted
  const FIRST_NAMES = ['Sarah', 'Michael', 'Priya', 'David', 'Anya', 'James', 'Mei', 'Daniel', 'Olivia', 'Raj', 'Elena', 'Marcus', 'Yuki', 'Thomas', 'Aisha', 'Jonas', 'Naomi', 'Hugo', 'Lena', 'Iris', 'Rohan', 'Catalina', 'Felix', 'Maya', 'Theo'];
  const LAST_NAMES = ['Chen', 'Patel', 'Reyes', 'Kovac', 'Ahmadi', 'Whitaker', 'Okafor', 'Lindqvist', 'Rourke', 'Sato', 'Volkov', 'Bishop', 'Adesina', 'Magnusson', 'Nakamura', 'Kowalski', 'Ferreira', 'Halvorsen', 'Cisneros'];
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

  // Template substitution: "{company} for {sector}" -> "Helix AI for legal workflows"
  function tmpl(s, ctx) {
    return s.replace(/\{(\w+)\}/g, (_, k) => (ctx && ctx[k] != null) ? ctx[k] : `{${k}}`);
  }

  // Pick N distinct items from an array, in shuffled order.
  function pickN(arr, n) {
    return rng.shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  // Drop occasional marginalia — an extra hand-written-looking note in a corner.
  // Used at low-to-mid weirdness so it feels like a designer slipped it in.
  function flourish(slide, ctx, idx, opts) {
    const w = ctx.weirdness[idx - 1];
    // Probability is highest in the middle weirdness range — when the deck
    // *almost* looks fine and a stray note lands hardest.
    const p = w < 2 ? 0 : (w < 6 ? 0.45 : 0.22);
    if (!rng.chance(p)) return;
    const text = rng.pick(MARGINALIA);
    const corner = rng.pick(['tr', 'br', 'bl']);
    const subtle = subtleFor(w);
    const o = opts || {};
    let pos;
    if (corner === 'tr') pos = { x: W - MARGIN - 4, y: 1.0, w: 4, h: 0.3, align: 'right' };
    else if (corner === 'bl') pos = { x: MARGIN, y: H - 0.95, w: 5, h: 0.3, align: 'left' };
    else pos = { x: W - MARGIN - 4.5, y: H - 0.95, w: 4.5, h: 0.3, align: 'right' };
    if (o.skip && o.skip.includes(corner)) return;
    slide.addText('* ' + text, {
      ...pos,
      fontSize: 8, fontFace: FONT_MONO, color: subtle, italic: true, charSpacing: 2
    });
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

    // Tiny eyebrow — varied across decks
    const round = rng.pick(['SERIES A', 'SERIES A', 'SERIES A', 'SEED', 'SERIES B']);
    const category = rng.pick(['AI', 'ENTERPRISE AI', 'AI INFRASTRUCTURE', 'AI / AGENTS', 'APPLIED AI', 'FRONTIER AI']);
    const eyebrow = rng.f() < 0.7
      ? `${category} · ${round} · ${ctx.year}`
      : `${category} · ${round} · ${ctx.month.toUpperCase()} ${ctx.year} · CONFIDENTIAL`;
    slide.addText(eyebrow, {
      x: MARGIN, y: 1.4, w: 10, h: 0.3,
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

    slide.addText(rng.pick(['Contents', 'Agenda', 'In this deck', 'What follows']), {
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

    let headline = corrupt(tmpl(rng.pick(HEAD_PROBLEM), ctx), w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN - 0.5, h: 1.5,
      fontSize: 42, fontFace: FONT_HEAD, color: ink
    });

    // Big stat — pulled from the larger pool
    const [stat, statCapBase] = rng.pick(PROBLEM_STATS);
    slide.addText(stat, {
      x: MARGIN, y: 3.3, w: 4, h: 1.4,
      fontSize: 88, fontFace: FONT_HEAD, color: COLORS.accent
    });
    let statCap = corrupt(statCapBase, w);
    if (w >= 4) statCap = maybeIntrude(statCap, w);
    slide.addText(statCap, {
      x: MARGIN + 4.2, y: 3.6, w: 5.5, h: 1.5,
      fontSize: 16, fontFace: FONT_BODY, color: subtle, italic: true
    });

    // Bullets — sometimes 2, usually 3, occasionally 4
    const bulletCount = rng.f() < 0.15 ? 2 : (rng.f() < 0.18 ? 4 : 3);
    const bullets = pickN(PROBLEM_BULLETS, bulletCount).map(b => corrupt(b, w));
    let by = 5.3;
    bullets.forEach(b => {
      slide.addText('—', { x: MARGIN, y: by, w: 0.4, h: 0.3, fontSize: 12, color: COLORS.accent });
      slide.addText(b, { x: MARGIN + 0.4, y: by, w: 11, h: 0.4, fontSize: 13, fontFace: FONT_BODY, color: ink });
      by += 0.42;
    });

    flourish(slide, ctx, 3);
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

    let headline = corrupt(tmpl(rng.pick(HEAD_SOLUTION), ctx), w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1.5,
      fontSize: 38, fontFace: FONT_HEAD, color: ink
    });

    // Pillars — pick 3 from a pool of 15 (occasionally 4)
    const pillarCount = rng.f() < 0.18 ? 4 : 3;
    let pillars = pickN(PILLARS, pillarCount);
    // Subtly poison one of the pillar bodies at moderate weirdness
    if (w >= 4 && rng.chance(0.7)) {
      const idx = rng.int(0, pillars.length - 1);
      pillars[idx] = [pillars[idx][0], pillars[idx][1].replace(/\.$/, '') + ' — mostly.'];
    }
    if (w >= 5 && rng.chance(0.6)) {
      const idx = rng.int(0, pillars.length - 1);
      pillars[idx] = [pillars[idx][0], maybeIntrude(pillars[idx][1], w)];
    }

    const numerals = ['I', 'II', 'III', 'IV', 'V'];
    let px = MARGIN;
    const colW = (W - 2 * MARGIN - 0.3 * (pillars.length - 1)) / pillars.length;
    pillars.forEach(([h, body], i) => {
      slide.addText(numerals[i], {
        x: px, y: 3.7, w: 1, h: 0.5,
        fontSize: 24, fontFace: FONT_HEAD, color: COLORS.accent, italic: true
      });
      slide.addText(corrupt(h, w), {
        x: px, y: 4.3, w: colW, h: 0.6,
        fontSize: pillars.length === 4 ? 16 : 18, fontFace: FONT_HEAD, color: ink, bold: false
      });
      slide.addText(corrupt(body, w), {
        x: px, y: 4.9, w: colW, h: 1.6,
        fontSize: pillars.length === 4 ? 11 : 12, fontFace: FONT_BODY, color: subtle, italic: false
      });
      px += colW + 0.3;
    });

    flourish(slide, ctx, 4);
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

    let headline = corrupt(tmpl(rng.pick(HEAD_MARKET), ctx), w);
    slide.addText(headline, {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 38, fontFace: FONT_HEAD, color: ink
    });

    const tamLabel = rng.pick(['$4.8T', '$2.1T', '$3.6T', '$1.9T', '$5.4T', '$2.8T']);
    let samLabel = rng.pick(['$420B', '$680B', '$310B', '$540B', '$280B', '$760B']);
    let somLabel = rng.pick(['$32B', '$54B', '$18B', '$41B', '$27B', '$66B']);

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

    const tamDescPool = [
      'Global market for AI-native ' + ctx.sector,
      'All AI-eligible spend, worldwide',
      'Aggregate ' + ctx.sector + ' spend, post-AI',
      'Total addressable, all geographies'
    ];
    const samDescPool = [
      'Mid-market & enterprise, NA + EU',
      'Companies above $50M in ARR, English-speaking',
      'Enterprise tier, global, top quartile by spend',
      'Mid-market and up, in regulated geographies'
    ];
    const somDescPool = [
      '5-year achievable share',
      '36-month achievable, present strategy',
      '60-month achievable share, design-partner pull',
      'Achievable, with the team we have today'
    ];
    const tiers = [
      ['TAM', tamLabel, rng.pick(tamDescPool)],
      ['SAM', samLabel, rng.pick(samDescPool)],
      ['SOM', somLabel, rng.pick(somDescPool)]
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

    flourish(slide, ctx, 5);
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

    slide.addText(corrupt(tmpl(rng.pick(HEAD_PRODUCT), ctx), w), {
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
    const subdomain = rng.pick(['app', 'console', 'workspace', 'cloud']);
    const path = rng.pick(['/workspace', '/dashboard', '/agents', '/inbox', '/']);
    slide.addText(subdomain + '.' + ctx.companyShort.toLowerCase() + '.ai' + path, {
      x: panelX + 1.2, y: panelY + 0.12, w: 5, h: 0.3,
      fontSize: 10, fontFace: FONT_MONO, color: w >= 7 ? '8E8676' : '888888'
    });

    // Inside the "screenshot": a fake conversation that gets weirder
    const greetLine = tmpl(rng.pick(PROD_GREETS), ctx);
    const askLine = rng.pick(PROD_ASKS);
    let respLine = rng.pick(PROD_RESPS);
    if (w >= 5) respLine = rng.pick(PROD_RESPS_MID);
    if (w >= 7) respLine = rng.pick(PROD_RESPS_DARK);

    slide.addText(greetLine, {
      x: panelX + 0.3, y: panelY + 0.6, w: panelW - 0.6, h: 0.4,
      fontSize: 13, fontFace: FONT_BODY, color: w >= 7 ? '8E8676' : '888888'
    });
    slide.addText('You: ' + askLine, {
      x: panelX + 0.3, y: panelY + 1.1, w: panelW - 0.6, h: 0.5,
      fontSize: 14, fontFace: FONT_BODY, color: w >= 7 ? 'C9C2B0' : '222222'
    });
    slide.addText(ctx.companyShort + ': ' + corrupt(respLine, w), {
      x: panelX + 0.3, y: panelY + 1.7, w: panelW - 0.6, h: 1.5,
      fontSize: 14, fontFace: FONT_BODY, color: w >= 7 ? 'C9C2B0' : '222222'
    });

    // Right side: feature bullets — pick 4 from a pool, occasionally 5
    const baseFeatureCount = rng.f() < 0.3 ? 5 : 4;
    const features = pickN(FEATURES, baseFeatureCount);
    if (w >= 6) features.push(rng.pick(FEATURES_DARK));
    if (w >= 8) features.push(rng.pick(FEATURES_DARK.filter(f => !features.includes(f))));
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
      fy += 0.5;
    });

    flourish(slide, ctx, 6);
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

    slide.addText(corrupt(tmpl(rng.pick(HEAD_BUSINESS), ctx), w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 32, fontFace: FONT_HEAD, color: ink
    });

    // Three pricing tiers — vary names, prices, and bullets
    const starterPrice = '$' + rng.pick(['49', '79', '99', '129', '149']);
    const growthPrice = '$' + rng.pick(['299', '399', '499', '599', '699']);
    let tiers = [
      [rng.pick(['Starter', 'Team', 'Pro', 'Standard']), starterPrice, '/seat/mo', pickN(TIER_BULLETS, 3)],
      [rng.pick(['Growth', 'Business', 'Scale', 'Plus']), growthPrice, '/seat/mo', pickN(TIER_BULLETS, 3)],
      [rng.pick(['Enterprise', 'Custom', 'Sovereign']), 'Custom', '', pickN(TIER_BULLETS.filter(b => /on-prem|enterprise|dedicated|infrastructure|24\/7|onboarding|priority|single-tenant|incident/i.test(b)), 3)]
    ];

    if (w >= 6) {
      tiers[0][0] = rng.pick(['Acolyte', 'Catechumen', 'Aspirant']);
      tiers[1][0] = rng.pick(['Initiate', 'Adept', 'Penitent']);
      tiers[2][0] = rng.pick(['Bound', 'Sealed', 'Witnessed']);
      tiers[2][1] = rng.pick(['Lifetime', 'in perpetuity', 'one-time', 'evergreen']);
      tiers[2][3] = [
        'On-prem deployment',
        rng.pick(TIER_BULLETS_DARK),
        rng.pick(TIER_BULLETS_DARK)
      ];
    }
    if (w >= 8) {
      tiers[2][1] = rng.pick(['in perpetuity', 'evergreen', 'eternal', '—']);
      tiers[2][2] = '';
      tiers[2][3] = pickN(TIER_BULLETS_DARK, 3);
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

    flourish(slide, ctx, 7);
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

    slide.addText(corrupt(tmpl(rng.pick(HEAD_ROADMAP), ctx), w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 0.8,
      fontSize: 30, fontFace: FONT_HEAD, color: ink
    });

    // LEFT: stacked traction stats — vary the values
    const designP = rng.pick(['6', '8', '11', '13', '17']);
    const arrRun = rng.pick(['$0.9M', '$1.4M', '$2.1M', '$3.2M']);
    const nrr = rng.pick(['128%', '142%', '156%', '171%']);
    const tractStats = [
      [designP, 'design partners'],
      [arrRun, 'ARR run-rate'],
      [nrr, 'net revenue retention']
    ];
    if (w >= 7) {
      tractStats[0] = [rng.pick(['8', '13', '∞', 'all of them']), rng.pick(['design partners', 'sealed houses', 'witnesses', 'silent partners'])];
      tractStats[2] = [rng.pick(['142%', '413%', '∞', '—']), rng.pick(['net revenue retention', 'net soul retention', 'no one leaves'])];
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
      milestones[3][1] = rng.pick(ROADMAP_FUTURE_TITLES);
    }
    if (w >= 7) {
      milestones[4][0] = 'Q? ' + (ctx.year + 2);
      milestones[4][1] = rng.pick(ROADMAP_DARK_TITLES);
    }
    if (w >= 8) {
      milestones.push([
        rng.pick(['Q∞', 'after', 'when', 'soon', '—']),
        rng.pick(ROADMAP_DARK_TITLES)
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

    flourish(slide, ctx, 8);
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

    slide.addText(corrupt(tmpl(rng.pick(HEAD_TEAM), ctx), w), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 1,
      fontSize: 30, fontFace: FONT_HEAD, color: ink
    });

    // Sometimes 3 founders, usually 4
    const baseCount = rng.f() < 0.18 ? 3 : 4;
    const titlePool = [
      'CEO & Founder', 'CTO & Co-Founder', 'Head of Product', 'Head of Engineering',
      'COO & Co-Founder', 'Head of Research', 'Head of Design', 'Head of Go-to-Market',
      'Founding Engineer', 'Head of AI', 'VP Engineering'
    ];
    // CEO is usually first; pull the rest randomly
    const titles = ['CEO & Founder', ...pickN(titlePool.filter(t => t !== 'CEO & Founder'), baseCount - 1)];
    const usedFirst = new Set();
    const usedLast = new Set();
    const team = [];
    for (let i = 0; i < baseCount; i++) {
      let first, last;
      do { first = rng.pick(FIRST_NAMES); } while (usedFirst.has(first) && usedFirst.size < FIRST_NAMES.length);
      do { last = rng.pick(LAST_NAMES); } while (usedLast.has(last) && usedLast.size < LAST_NAMES.length);
      usedFirst.add(first); usedLast.add(last);
      let title = titles[i];
      let bio = rng.pick(TEAM_BIOS_CLEAN);

      if (w >= 7) {
        if (rng.chance(0.7)) first = rng.pick(CORRUPTED_FIRST);
        if (rng.chance(0.5)) last = rng.pick(CORRUPTED_LAST);
        if (rng.chance(0.6)) title = rng.pick(ELDRITCH_TITLES);
      }
      if (w >= 8) {
        bio = rng.pick(TEAM_BIOS_DARK);
      } else {
        bio = corrupt(bio, w);
      }
      team.push({ name: first + ' ' + last, title, bio });
    }

    if (w >= 9) {
      team.push({
        name: rng.pick(['—', 'Unnamed', 'The fifth chair', '¿', '‧ ‧ ‧', '(redacted)', 'no name on file']),
        title: rng.pick(['Founding Witness', 'Did Not Apply', 'Was Not Hired — Arrived', 'Honorary, In Perpetuity']),
        bio: rng.pick([
          'Joined the company before the company existed.',
          'Sits in on every meeting. Has not been introduced.',
          'Listed on the cap table under a name we cannot pronounce.',
          'Has been with us since the original document was sealed.',
          'Does not speak. Does not need to.'
        ])
      });
    }

    const cols = team.length;
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

    flourish(slide, ctx, 9);
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

    let raise = rng.pick(['$12M', '$15M', '$18M', '$22M', '$24M', '$30M', '$35M']);
    if (w >= 9) raise = rng.pick(['$18M', 'a vessel', 'your name', 'one breath, freely given', 'a quiet moment']);

    slide.addText(corrupt(rng.pick(HEAD_FINANCIAL_ASK), w), {
      x: MARGIN, y: 1.6, w: W - 2 * MARGIN, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, color: subtle, italic: true
    });

    slide.addText(raise, {
      x: MARGIN, y: 2.2, w: W - 2 * MARGIN, h: 1.6,
      fontSize: 110, fontFace: FONT_HEAD, color: ink
    });

    // Allocations — pick from a pool of buckets, sample percentages from ranges
    const cleanCount = rng.f() < 0.4 ? 5 : 4;
    const cleanPicks = pickN(ALLOC_CLEAN, cleanCount);
    let raw = cleanPicks.map(([name, range]) => [rng.pick(range), name]);
    if (w >= 7) {
      // swap one bucket for a darker one
      const darkPick = rng.pick(ALLOC_DARK);
      raw[raw.length - 1] = [rng.pick(darkPick[1]), darkPick[0]];
    }
    if (w >= 9) {
      // swap a second one
      const idx = rng.int(0, raw.length - 2);
      const darkPick = rng.pick(ALLOC_DARK);
      raw[idx] = [rng.pick(darkPick[1]), darkPick[0]];
    }
    // Normalize to nearest int summing roughly to 100
    let total = raw.reduce((s, [v]) => s + v, 0);
    let allocations = raw.map(([v, name]) => [Math.round(v / total * 100) + '%', name]);
    if (w >= 9) {
      allocations.push([rng.pick(['??%', '∞', '¿', '—']), rng.pick(['(unallocated)', 'as it asks', 'the rest, as agreed', 'pending consent'])]);
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
    let contact = `${ctx.founder}  ·  ${ctx.first.toLowerCase()}@${ctx.companyShort.toLowerCase()}.ai`;
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

    flourish(slide, ctx, 10);
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
    slide.addText(rng.pick(SOUL_LEAD_INS), {
      x: MARGIN, y: 1.5, w: W - 2 * MARGIN, h: 0.55,
      fontSize: 22, fontFace: FONT_HEAD, color: subtle, italic: true
    });

    // BIG NUMBER — the soul ask
    slide.addText(rng.pick(SOUL_BIG_NUMS), {
      x: MARGIN, y: 2.1, w: W - 2 * MARGIN, h: 1.4,
      fontSize: 96, fontFace: FONT_HEAD, color: ink
    });

    // Subtitle — the kicker
    slide.addText(rng.pick(SOUL_SUBTITLES), {
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
      ['Quieting the neighbors', 3],
      ['Containment reserves', 9],
      ['Compute, in perpetuity', 14],
      ['The lower floors', 6],
      ['Voluntary contributions', 4]
    ];
    const picked = rng.shuffle(allAllocs).slice(0, rng.f() < 0.3 ? 4 : 5);
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
    const extras = pickN(SOUL_EXTRAS, 5);

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
    slide.addText(rng.pick(SOUL_CLOSERS_LEFT), {
      x: MARGIN, y: H - 1.3, w: 6, h: 0.4,
      fontSize: 14, fontFace: FONT_HEAD, color: subtle, italic: true
    });
    slide.addText(rng.pick(SOUL_CLOSERS_RIGHT), {
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
    // Mostly "Helix AI"-shape, occasionally other shapes, for serendipity
    let companyName;
    const r = rng.f();
    if (r < 0.62) companyName = `${prefix} ${suffix}`;
    else if (r < 0.78) companyName = `${prefix}${suffix}`;
    else if (r < 0.88) companyName = prefix;
    else companyName = `${prefix}.${rng.pick(['ai', 'co', 'io'])}`;

    const tagline = rng.pick(TAGLINES);
    const sector = rng.pick(SECTORS);
    const year = 2026;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = rng.pick(months);
    const founder = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    const first = founder.split(' ')[0];
    const companyShort = prefix;

    const jitter = () => (rng.f() - 0.5) * 0.5;
    const baseCurve = [2.0, 3.2, 4.5, 5.5, 6.5, 7.2, 7.8, 8.4, 8.9, 9.5, 10.0];
    const weirdness = baseCurve.map(b => Math.max(0, Math.min(10, b + jitter())));

    return {
      companyName, company: companyName, companyShort,
      tagline, sector, year, month, founder, first,
      weirdness
    };
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
