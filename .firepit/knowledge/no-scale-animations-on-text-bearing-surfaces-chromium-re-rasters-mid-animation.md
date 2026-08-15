# No scale animations on text-bearing surfaces — Chromium re-rasters mid-animation

Kit-wide rule, learned 2026-08-15 fixing the launcher tile hover ("text jitter" report).

**Symptom:** text on a hover-zoomed tile jitters continuously during the animation, "as if switching between CPU and GPU rendering". None of the classic layer tricks fix it (`will-change: transform`, `translateZ(0)`, `backface-visibility: hidden`, `transform-style: preserve-3d`).

**Cause:** Chromium deliberately re-rasterizes text layers while their scale factor animates (raster-scale adaption, to keep text sharp). Layer promotion tricks prevent promote/demote flicker but not this — it is by design and not suppressible via CSS.

**Rule:** never animate `scale` on an element that contains text. Guaranteed raster-stable animated properties: `translate`, `rotate`, `opacity`. The kit's `.tile` hover therefore lifts (`translateY`) + shadow/glow/border only; the zoom feel may come from scaling text-free children (the tile's SVG icon scales/rotates fine). If a real background zoom is wanted, scale a `::before` layer that carries glass+border while the content only translates.

Also applied on `.tile`: persistent compositor layer (`will-change: transform`, `translateZ(0)`, `backface-visibility: hidden`) and explicit transition properties instead of `transition: all`.
