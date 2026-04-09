# @forgedevstack/rail

<p align="center">
  <strong>Rail</strong> — A powerful, modular carousel engine for React.<br/>
  Touch-ready, accessible, infinitely extensible.<br/>
  The motion layer of <a href="https://forgedevstack.dev">ForgeStack</a>.
</p>

## Features

### Core
- **Touch & Drag** — Native touch and simulated mouse drag with configurable angle, ratio, and threshold
- **Snap Physics** — Momentum, resistance, and snap-to-slide with customizable easing
- **Loop Mode** — Infinite loop with seamless duplicate slides
- **Responsive** — Breakpoint-based options override (slidesPerView, spaceBetween, direction, etc.)
- **CSS Mode** — Native scroll-snap for maximum performance
- **Auto Height** — Container height adapts to active slide
- **Vertical** — Full vertical slider support

### Modules (25+)
- **Navigation** — Previous/next arrows with disabled states
- **Pagination** — Bullets, fraction, progressbar, or custom
- **Scrollbar** — Draggable scrollbar with auto-hide
- **Autoplay** — Timer, pause on hover, stop on interaction
- **Keyboard** — Arrow keys, Home/End, PageUp/Down
- **Mousewheel** — Scroll wheel with axis forcing and sensitivity
- **Virtual** — Render only visible slides for large datasets
- **Parallax** — Data-attribute driven parallax effects
- **FreeMode** — Momentum-based free scrolling
- **Grid** — Multi-row layout with row/column fill
- **Manipulation** — Programmatic add/remove/reorder slides
- **Zoom** — Double-click zoom with max/min ratio
- **Controller** — Synchronize multiple Rail instances
- **A11y** — Full ARIA carousel accessibility
- **History** — Browser history navigation
- **HashNavigation** — URL hash-based navigation
- **Thumbs** — Thumbnail gallery synchronization

### Effects (7)
- **Fade** — Cross-fade transition
- **Cube** — 3D cube rotation
- **Flip** — 3D card flip
- **Coverflow** — 3D coverflow with rotate, depth, scale
- **Cards** — Stacked cards with offset and rotation
- **Creative** — Fully custom prev/next transforms
- **StoryMode** — Instagram-style stories with progress bars

## Installation

```bash
npm i @forgedevstack/rail
```

### Import CSS

```tsx
import '@forgedevstack/rail/styles.css';
```

## Quick Start

```tsx
import { Rail, RailSlide, Navigation, Pagination } from '@forgedevstack/rail';
import '@forgedevstack/rail/styles.css';

function App() {
  return (
    <Rail
      slidesPerView={1}
      spaceBetween={20}
      navigation
      pagination={{ clickable: true }}
      modules={[Navigation, Pagination]}
    >
      <RailSlide>Slide 1</RailSlide>
      <RailSlide>Slide 2</RailSlide>
      <RailSlide>Slide 3</RailSlide>
    </Rail>
  );
}
```

## Modules

Import only what you need — every module is tree-shakeable:

```tsx
import {
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
  Keyboard,
  Mousewheel,
  Virtual,
  Parallax,
  FreeMode,
  Grid,
  Zoom,
  Controller,
  A11y,
  History,
  HashNavigation,
  Thumbs,
  EffectFade,
  EffectCube,
  EffectFlip,
  EffectCoverflow,
  EffectCards,
  EffectCreative,
  StoryMode,
} from '@forgedevstack/rail';
```

## Effects

```tsx
<Rail
  effect="fade"
  modules={[EffectFade]}
  fadeEffect={{ crossFade: true }}
>
  <RailSlide>...</RailSlide>
</Rail>
```

Available effects: `slide` (default), `fade`, `cube`, `flip`, `coverflow`, `cards`, `creative`.

## Autoplay

```tsx
<Rail
  autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
  modules={[Autoplay]}
>
  ...
</Rail>
```

## Story Mode

```tsx
<Rail
  storyMode={{ duration: 5000, showProgress: true, pauseOnTap: true }}
  modules={[StoryMode]}
>
  <RailSlide>Story 1</RailSlide>
  <RailSlide>Story 2</RailSlide>
</Rail>
```

## Responsive

```tsx
<Rail
  slidesPerView={1}
  breakpoints={{
    640: { slidesPerView: 2, spaceBetween: 16 },
    1024: { slidesPerView: 3, spaceBetween: 24 },
  }}
>
  ...
</Rail>
```

## useRail Hook

```tsx
import { useRail } from '@forgedevstack/rail';

function SlideCounter() {
  const { activeIndex, slidesCount, slideNext, slidePrev } = useRail();
  return (
    <div>
      <span>{activeIndex + 1} / {slidesCount}</span>
      <button onClick={() => slidePrev()}>Prev</button>
      <button onClick={() => slideNext()}>Next</button>
    </div>
  );
}
```

## Thumbs Gallery

```tsx
import { Rail, RailSlide, Thumbs } from '@forgedevstack/rail';

function Gallery() {
  const [thumbsRail, setThumbsRail] = useState(null);

  return (
    <>
      <Rail modules={[Thumbs]} thumbs={{ rail: thumbsRail }}>
        <RailSlide><img src="/photo-1.jpg" /></RailSlide>
        <RailSlide><img src="/photo-2.jpg" /></RailSlide>
      </Rail>

      <Rail onRail={setThumbsRail} slidesPerView={4} spaceBetween={8}>
        <RailSlide><img src="/photo-1-thumb.jpg" /></RailSlide>
        <RailSlide><img src="/photo-2-thumb.jpg" /></RailSlide>
      </Rail>
    </>
  );
}
```

## Vertical

```tsx
<Rail direction="vertical" style={{ height: 400 }}>
  <RailSlide>Slide 1</RailSlide>
  <RailSlide>Slide 2</RailSlide>
</Rail>
```

## Grid / Multi-Row

```tsx
<Rail
  slidesPerView={3}
  grid={{ rows: 2, fill: 'row' }}
  modules={[Grid]}
>
  {Array.from({ length: 12 }, (_, i) => (
    <RailSlide key={i}>Slide {i + 1}</RailSlide>
  ))}
</Rail>
```

## Events

```tsx
<Rail
  on={{
    slideChange: (index, prev) => console.log('Slide:', index),
    reachEnd: () => console.log('Reached end'),
    touchStart: (data) => console.log('Touch:', data),
  }}
>
  ...
</Rail>
```

## API Reference

### Rail Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slide direction |
| `slidesPerView` | `number \| 'auto'` | `1` | Visible slides |
| `spaceBetween` | `number` | `0` | Gap between slides (px) |
| `slidesPerGroup` | `number` | `1` | Slides to advance per swipe |
| `speed` | `number` | `300` | Transition duration (ms) |
| `loop` | `boolean` | `false` | Infinite loop |
| `centeredSlides` | `boolean` | `false` | Center active slide |
| `initialSlide` | `number` | `0` | Starting slide index |
| `grabCursor` | `boolean` | `false` | Show grab cursor |
| `effect` | `RailEffect` | `'slide'` | Transition effect |
| `breakpoints` | `RailBreakpoints` | — | Responsive overrides |
| `modules` | `RailModuleFactory[]` | `[]` | Active modules |
| `on` | `Partial<RailEvents>` | — | Event handlers |
| `onRail` | `(instance) => void` | — | Instance callback |

### Exports

```tsx
import {
  // Components
  Rail, RailSlide, RailNavigation, RailPagination,
  // Context
  RailContext, useRailContext,
  // Hooks
  useRail,
  // Core
  createRail, EventEmitter,
  // 25 Modules
  Navigation, Pagination, Scrollbar, Autoplay, Keyboard,
  Mousewheel, Virtual, Parallax, FreeMode, Grid,
  Manipulation, Zoom, Controller, A11y, History,
  HashNavigation, Thumbs,
  EffectFade, EffectCube, EffectFlip, EffectCoverflow,
  EffectCards, EffectCreative, StoryMode,
  // Manipulation utils
  appendSlide, prependSlide, addSlide, removeSlide, removeAllSlides,
  // Constants
  DEFAULTS, CSS_CLASSES,
} from '@forgedevstack/rail';
```

## Portal

Documentation and the demo site live in the separate **[rail-portal](https://github.com/yaghobieh/rail-portal)** repository. Clone that repo, then install and run the Vite app there (`npm install`, `npm run dev`). This package does not ship or script the portal.

## License

MIT
