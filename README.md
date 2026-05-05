# eldritch-deck

> Procedurally-generated AI-startup pitch decks. Eleven slides. By slide eleven they are no longer pretending.

A static webpage that produces real, openable `.pptx` files entirely in your browser, using
[PptxGenJS](https://gitbrent.github.io/PptxGenJS/). Each deck begins as an exemplary, well-spaced
Series A document &mdash; clean serif type, brass accent rule, hockey-stick chart, the works.
Around slide three something is already wrong with the language. By slide eleven the deck is asking
for things that are not yours to give.

## Use

Visit **[ftrain.github.io/eldritch-deck](https://ftrain.github.io/eldritch-deck/)**. Click
*Generate Deck*. A `.pptx` falls into your downloads. Open it in Keynote, PowerPoint, or Google
Slides. Try not to read it twice in a row.

To get the same deck twice, type any string into the **seed** field. Two decks generated from the
same seed are bit-for-bit identical. Two decks generated from different seeds are not, although
they sometimes appear related in ways neither of them would prefer to discuss.

## Run it locally

```bash
git clone git@github.com:ftrain/eldritch-deck.git
cd eldritch-deck
python3 -m http.server 8000
# http://localhost:8000
```

Two files. No build step. No bundler. No tracking. Nothing leaves the machine. *(The decks know
where they came from. We cannot help that.)*

## What is in there

Each deck has the same fixed structure &mdash; that is the point.

| # | Section | Tone |
| - | --- | --- |
| 1 | Title | Almost normal |
| 2 | Contents | One item is a little off |
| 3 | The Problem | The numbers are real |
| 4 | Our Solution | Three pillars. The third is concerning |
| 5 | Market Opportunity | TAM, SAM, SOM. Column chart of growth |
| 6 | Product | Mock UI. The chatbot has begun to volunteer |
| 7 | Business Model | Acolyte / Initiate / Bound. Lifetime tier |
| 8 | Traction & Roadmap | ARR line chart. Final milestone unlabeled |
| 9 | The Team | Four founders. Sometimes a fifth |
| 10 | The Ask (financial) | A reasonable number of dollars |
| 11 | **The Other Ask** | Souls. Pie chart. Itemized |

A seedable mulberry32 PRNG drives a per-slide weirdness curve. Higher weirdness means:
word substitution from the standard MBA lexicon to its truer equivalents
(`users → souls`, `revenue → tithe`, `roadmap → unbinding`); occasional wholesale phrases the
model would prefer you not read aloud; light combining-mark zalgo on a fraction of words; and a
gradual shift of the page palette from warm parchment toward something darker. The slide layout
does not change. That is the point.

## Caveats

Do not generate decks at four in the morning. Do not present a deck you have not first read.
Do not seed with a name belonging to someone you have lost. Do not present these decks to actual
investors &mdash; not because they would say no, but because some of them would say yes.

## License

MIT. The decks remain whatever they have always been.
