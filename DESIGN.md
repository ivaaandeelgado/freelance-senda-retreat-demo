---
name: Senda
description: A photographic escape guide with pine ink, citron accents and practical paper surfaces.
colors:
  pine: "#234b39"
  ink: "#253b30"
  lime: "#e5ed83"
  paper: "#f6f5ef"
  white: "#fffefa"
  muted: "#56675b"
  line: "#d2d8cd"
  error: "#9d3029"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(72px, 7.5vw, 96px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 52px)"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Public, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Public, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Public, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  action:
    fontFamily: "Public, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  flat: "0"
  control: "4px"
  media: "6px"
  masthead: "8px"
  dialog: "12px"
  sheet: "12px 0 0 12px"
  chip: "30px"
  circle: "50%"
spacing:
  space: "clamp(24px, 5vw, 80px)"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-citron:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.pine}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-plan:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.pine}"
    typography: "{typography.action}"
    rounded: "{rounded.masthead}"
    padding: "12px 18px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    padding: "8px 0"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px"
    width: "100%"
  navigation:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.white}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "10px 17px"
  filter-chip-selected:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.white}"
    rounded: "{rounded.chip}"
    padding: "10px 17px"
  stay-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.media}"
  itinerary-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    width: "600px"
    height: "100svh"
---

# Design System: Senda

## Overview

**Creative North Star: "The Unfolded Escape Guide"**

Senda pairs broad natural photography with heavy, compact headlines and quiet planning controls. Pine establishes the visual frame; citron marks emphasis and useful actions; warm paper supports reading and comparison. Its guide character comes from joined rectangles, thin rules and drawn route symbols rather than simulated paper texture.

The system is spacious around photography and section headings, then compact within filters, estimates and saved plans. This is a record of the completed, code-led implementation: the descriptive metaphor comes from its authored direction, not an approved visual comp or an aesthetic interview. Spanish copy, clear fictional-demo disclosures, visible keyboard focus and reduced-motion behavior are durable product constraints.

**Key Characteristics:**
- Large photographic fields and compact display typography.
- Pine framing, citron emphasis and warm paper surfaces.
- Open collection cards with ruled information rows.
- Rectangular joins, modest corners and a distinct itinerary sheet.
- Local fonts, drawn SVG icons and explicit interaction states.

## Colors

The palette reads as dark botanical ink on warm paper, with bright citron used for emphasis and panels.

### Primary
- **Pine** (`pine`): masthead, dark panels, primary buttons, selected controls, checkboxes and focus outlines.
- **Citron** (`lime`): emphasized display words, the masthead plan action, search action, disclosure panels and closing field. The source token remains named `lime`.

### Neutral
- **Forest Ink** (`ink`): default text and unfilled controls.
- **Warm Paper** (`paper`): page ground, dialogs and photograph labels.
- **Soft White** (`white`): the joined search strip, filled form fields and text on pine.
- **Muted Leaf** (`muted`): secondary descriptions, metadata and explanatory notes.
- **Rule Grey** (`line`): section dividers, card rows and control boundaries.
- **Clay Error** (`error`): validation copy, paired with a pale warm error surface.

**The Pine and Citron Rule.** Use pine for the stable frame and selected states; use citron for emphasis, actions on pine and clear informational panels. Citron is an intentional large-area color as well as an accent.

Only the eight root colors are promoted to reusable primitives. Literal hover, field-border, estimate and overlay colors stay with their component snippets in the sidecar. Its generated tonal ramps are swatch previews, not additional shipped color tokens.

## Typography

**Display Font:** Archivo Black, registered locally as `Archivo`, with `sans-serif` fallback. Its font file is declared at weight 400; the heavy appearance comes from the face itself.
**Body Font:** Public Sans, registered locally as `Public`, with `sans-serif` fallback. Local files supply weights 400, 500, 600 and 700.

The pairing combines wide, weighty display forms with readable, restrained interface text. Headings use balanced wrapping. Paragraphs generally use the body line-height; the document's `body` token describes recurring explanatory text, not a global root font-size declaration.

### Hierarchy
- **Display:** the large photographic headline; mobile overrides are 80px at widths up to 760px and 62px up to 360px.
- **Headline:** the general section-heading role. The forest editorial heading has a larger local scale, `clamp(42px, 4.4vw, 64px)`, then 46px and 40px at the same mobile thresholds.
- **Title:** stay names in the collection. Estimates and planner headings use Public at 18–23px according to hierarchy.
- **Body:** recurring 14px descriptions; narrow layouts commonly use 13px. Introductory paragraphs are capped at 400–420px where implemented.
- **Label:** compact field labels and supporting interface text. Metadata is commonly 12px at regular weight; navigation is 13px/500 on desktop and 12px on mobile.
- **Action:** standard button and text-action labels. Small masthead and itinerary actions use the component's 12–14px variants.

**The Two Voices Rule.** Keep Archivo for the wordmark and major headings; use Public for stay names, prices, forms, navigation and explanatory copy. Prices and estimate amounts use tabular numerals.

## Layout

The shared horizontal inset is the `space` token. Standard sections use the `section` inset vertically; the collection, FAQ and closing area have deliberate local spacing. The hero and photographic editorial panel sit in narrower outer gutters (28px desktop, 14px mobile), while their content aligns to the wider reading inset. At 1600px and above, reading regions use a 1440px alignment field and the photographic regions cap at 1536px.

The masthead has a 98px minimum height plus a separate 32px demo ribbon. Its wordmark is 44px on desktop and 34px on mobile. A paper gap separates the masthead from the hero: 28px on desktop and 18px up to 760px. The hero image and search strip share their outside corners and meet without a gap. Desktop search uses four fields plus an action; at 1100px the action spans the row; at 760px it becomes a two-column form with full-width landscape, guest and action rows.

Collection cards use three equal columns with 42px row and 26px column gaps. Up to 1100px those gaps become 36px and 20px. At 760px the default is one column with a 34px gap; the 560–760px interval uses two columns with 30px/18px gaps. The forest section and FAQ become single-column at 760px. Main mobile sections use 52px vertical and 24px horizontal padding; at 360px their horizontal inset becomes 20px. The page supports a 320px minimum width.

The stay calculator is a centered native dialog, 1060px wide with a `1.05fr 1fr` interior that stacks at 760px. General dialogs keep a 20px viewport margin on desktop and 10px on mobile. The saved itinerary instead attaches to the right viewport edge at full height; it becomes full-width with square corners at 760px. Its header remains sticky and its content scrolls within the sheet.

## Elevation & Depth

The page is predominantly flat: photography, tonal fields and thin rules establish separation. Soft shadows are reserved for controls over photographs, the masthead plan action on hover, temporary feedback and modal surfaces. Photographic headline legibility comes from directional dark overlays, not a gradient page background.

### Shadow Vocabulary
- **Photo control:** `0 3px 14px rgba(20, 40, 25, .12)` under favorite controls.
- **Dialog:** `0 28px 80px rgba(15, 35, 25, .28)` with a `rgba(14, 30, 22, .68)` backdrop.
- **Toast:** `0 8px 30px #15271c30` under temporary status feedback.
- **Masthead action hover:** `0 6px 16px #112c2330` beneath the lifted plan action.
- **Outline action:** `inset 0 0 0 1px var(--pine)` is a stroke treatment, not elevation.

**The Flat Collection Rule.** Collection content rests directly on the page. Keep shadows for overlay controls, the hovered masthead action, dialogs and temporary feedback.

## Shapes

Small rectangular controls use the control radius; photography and joined panels use the media radius. Masthead links and the plan action share the slightly larger masthead radius. Only the outside corners of a joined photograph/search unit are rounded. Dialogs have a larger radius, reduced to 10px on mobile; the itinerary keeps only its exposed left corners on desktop and has none when full-width. Filter chips are pill-shaped, while icon actions are circular. Thin single-pixel rules separate fields, metadata and totals.

Icons are inline SVG paths on a 24-unit viewBox, with a 1.6 stroke, rounded caps and rounded joins. The common rendered size is 22px, with 14–18px variants inside metadata, chips and compact controls. Use this drawn family for landscape, route and action symbols.

## Components

### Buttons

Compact and confident. Standard actions have a 52px minimum height, 24px icon gap and the frontmatter padding. Pine actions darken to `#143825`; citron actions to `#d7e465`; outline actions receive `#e9edde`. Text actions retain an underlining rule and turn `#52723a` on hover. Icon actions have a 44px minimum square target and use `#e4e8dd` on hover, or `#41654e` on the pine masthead. Small buttons use a 46px minimum height on desktop and 44px on mobile. Disabled buttons use 0.48 opacity and a not-allowed cursor.

Keyboard focus uses a 3px outline with a 5px offset, pine on light surfaces and citron in the masthead and dark editorial panel. Color transitions last 0.18s. Preserve real links for navigation and buttons for actions.

### Chips and Scene Controls

Landscape filter chips have a thin rule border, a 44px minimum height and Public 12px/500 labels. Selected chips fill with pine and expose `aria-pressed`; unselected hover uses the shared pale green surface. The photographic scene selector is a separate compact rectangular group: a paper enclosure, 2px-radius segments and 40px minimum segment height. Selection updates both the photographic scene and collection filter.

### Cards / Containers

Stay cards remain open on the paper ground. Photos use a 1.24 aspect ratio, changing to 1.2 on mobile; the linked photograph scales to 1.035 on hover over 0.5s. A small paper caption sits inside the image and a separate circular favorite action occupies its upper corner. Titles and prices share a row where space allows; metadata and a ruled footer complete the card. Favorite state fills the heart path without changing the icon family.

### Inputs / Fields

The joined search strip uses unboxed fields with labels above and thin separators between desktop columns. Planner fields use a soft-white fill, a `#a5b49e` border, 46px minimum height and 13px Public text. Native dates, selects, checkboxes and range controls remain recognizable. Checkbox and range accents are pine; checkbox boxes are 19px. Validation messages use clay text on `#fff1e8`, with 12px padding and the control radius.

### Navigation

Navigation is white on the substantial pine masthead, with a citron plan action. Links use 10px/14px padding and the masthead radius; hover adds `#385d48`, citron text and a 1px upward shift. The plan action lightens to `#f0f5a9`, rises 2px and receives its soft hover shadow. Both settle on press, and their state transitions last 0.2s. These header links use a background state rather than an underline; visible keyboard focus remains citron.

On mobile the navigation moves to a second full-width row, with 8px/4px link padding and a 4px gap. It remains visible instead of becoming an unimplemented menu. The wordmark keeps its diagonal route arrow. Reduced-motion preferences remove the state transitions along with the other animations.

### Itinerary Sheet

The paper sheet uses a 24px/28px sticky header and 28px content inset, reduced to an 18px header and 20px content inset on mobile. The summary pairs a 120px photograph with stay details; mobile uses a 90px image column and 100px image height. Itemized amounts align to the right, the total gains a top rule and stronger type, and the local-only disclosure uses citron. Export actions wrap, followed by separate edit and delete actions.

The entrance lasts 0.42s with `cubic-bezier(.16, 1, .3, 1)`, moving from a 44px horizontal offset and a 12% left clip to its settled position. The photographic scene reveal uses the same easing over 0.6s. Reduced motion removes animations and transitions; the shared scroll helper chooses instant scrolling. Native dialog focus, Escape and backdrop closing remain part of the implementation.

## Do's and Don'ts

### Do:
- **Do** keep photographic subjects visible and use the existing dark overlay when text sits on an image.
- **Do** preserve the joined photograph/search edges and the open, ruled collection structure.
- **Do** carry clear fictional-demo and local-save disclosures into relevant planning surfaces.
- **Do** preserve visible keyboard focus, labeled native fields and the reduced-motion scroll choice.
- **Do** reuse the local typefaces and drawn SVG icon family.

### Don't:
- **Don't** apply card shadows or filled containers to every collection item.
- **Don't** turn the saved itinerary back into a centered dialog; retain its edge attachment.
- **Don't** replace meaningful selected, error or disabled states with decorative color alone.
- **Don't** use the generated sidecar tonal ramps as new production tokens without an explicit system change.
