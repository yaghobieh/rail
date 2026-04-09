# Changelog

All notable changes to Rail will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-24

### Added

- **Core Engine** — Framework-agnostic carousel engine with plugin architecture. Touch/drag, momentum, snap-to-slide, and resistance physics.
- **React Components** — `<Rail>`, `<RailSlide>`, `<RailNavigation>`, `<RailPagination>` components with TypeScript props.
- **useRail Hook** — Reactive hook exposing `activeIndex`, `progress`, `isBeginning`, `isEnd`, slide methods, and autoplay state.
- **Navigation Module** — Previous/next arrow buttons with automatic disabled state at boundaries. Custom elements supported.
- **Pagination Module** — Bullets, fraction, progressbar, and custom pagination types. Clickable bullets, dynamic sizing, custom render.
- **Scrollbar Module** — Draggable scrollbar track with auto-hide, snap on release, and custom drag size.
- **Autoplay Module** — Configurable delay, pause on hover, stop on interaction, reverse direction, wait for transition.
- **Keyboard Module** — Arrow key, Home/End, PageUp/PageDown navigation. Viewport-only or global mode.
- **Mousewheel Module** — Scroll wheel navigation with axis forcing, edge release, sensitivity, and delta threshold.
- **Virtual Module** — Virtual slides for massive datasets. Only renders visible + buffer slides. Optional caching.
- **Parallax Module** — Data-attribute driven parallax effects on any element inside slides. Configurable factor per element.
- **FreeMode Module** — Momentum-based free scrolling with configurable velocity ratio, bounce, and sticky snap.
- **Grid Module** — Multi-row grid layout with row/column fill modes. Automatic slide positioning.
- **Manipulation Module** — Programmatic `appendSlide`, `prependSlide`, `addSlide`, `removeSlide`, `removeAllSlides` utilities.
- **Zoom Module** — Double-click or pinch to zoom images within slides. Max/min ratio, auto-disable swipe when zoomed.
- **Controller Module** — Synchronize two or more Rail instances. By slide index or by container progress. Inverse mode.
- **A11y Module** — Full ARIA accessibility: `role="region"`, `aria-roledescription="carousel"`, `aria-live="polite"`, `aria-hidden`, `tabindex`, per-slide labels, navigation labels.
- **History Module** — Push/replace browser history state on slide change. `data-history` attribute for custom slugs.
- **HashNavigation Module** — URL hash-based navigation. `data-hash` attribute support, watch hash changes.
- **Thumbs Module** — Thumbnail gallery synchronization. Active thumb class, multi-active support, auto-scroll.
- **EffectFade** — Cross-fade transition between slides. Optional cross-fade mode.
- **EffectCube** — 3D cube rotation effect with perspective, backface-visibility, and shadow support.
- **EffectFlip** — 3D flip/card-flip transition with limited rotation and shadows.
- **EffectCoverflow** — 3D coverflow with configurable rotate, stretch, depth, modifier, and scale.
- **EffectCards** — Stacked card effect with per-slide offset, rotation, and scaling.
- **EffectCreative** — Fully custom prev/next transforms: translate, rotate, scale, opacity, origin. Perspective and progress-based shadows.
- **StoryMode** — Instagram/Snapchat-style stories with timed auto-advance, progress bars, pause-on-tap, and completion callback.
- **Breakpoints** — Responsive options per viewport width. Override slidesPerView, spaceBetween, direction, and more.
- **Loop Mode** — Infinite loop with duplicate slide management.
- **CSS Mode** — Native scroll-snap mode for maximum performance.
- **Grab Cursor** — Visual grab/grabbing cursor feedback.
- **Event System** — 30+ lifecycle events: init, destroy, slideChange, touchStart/Move/End, resize, breakpoint, progress, and more.
- **Rail CSS** — Complete stylesheet with navigation, pagination, scrollbar, zoom, story mode, and responsive styles.

### Portal

- **Home Page** — Hero section, feature grid, live demo, ecosystem banner.
- **Get Started** — Installation, quick start, module imports, configuration guide.
- **API Reference** — Complete props, events, and module options documentation.
- **Demos** — Basic, effects, story mode, gallery, and multi-row demos.
- **Changelog** — Version history timeline.
- **i18n** — English and Spanish translations.
- **SEO** — Meta tags, Open Graph, structured data.
- **Vercel** — SPA deployment configuration.

### Technical

- React 18+ compatible
- Full TypeScript definitions
- Tree-shakeable ESM and CJS builds
- Plugin architecture for custom modules
- Zero external dependencies
- ~8 kB gzipped (core)
