# Motion recipes for appkit apps (zero dependencies)

The kit has no spring primitive yet, so a gesture release in app code uses these. They are plain
functions with no library and no build step: paste them into the app's own `app.js`. If the kit ever
ships one (a `sac.motion`), use that instead and delete the copy.

Use them only where a gesture lets go of something: a dragged panel, a sheet pulled down, a drawer
swiped, an item thrown. State changes nobody holds (hover, a menu opening) stay CSS transitions with
the `--ease-*` tokens.

## The pieces

```js
// Release velocity (units per second) from the samples of the last `windowMs`.
// A pointer that stopped before letting go reports 0, not its old speed.
function velocityTracker(windowMs = 100) {
    const samples = [];
    return {
        add(value, t = performance.now()) { samples.push({ value, t }); },
        velocity(now = performance.now()) {
            while (samples.length && now - samples[0].t > windowMs) samples.shift();
            if (samples.length < 2) return 0;
            const a = samples[0], b = samples[samples.length - 1];
            return b.t > a.t ? (b.value - a.value) / (b.t - a.t) * 1000 : 0;
        },
        reset() { samples.length = 0; },
    };
}

// A spring set by Apple's two parameters. damping: 1 = settles without
// overshoot, < 1 overshoots (0.8 is a slight bounce). response: seconds, how
// quickly it gets there (not a duration). It starts at `from` with `velocity`,
// so it can be re-aimed mid-flight: stop() it and start a new one from its
// .value and .velocity. restDelta / restSpeed are in the value's units
// (px by default; use e.g. 0.001 / 0.01 for a 0–1 opacity or scale).
function spring({ from, to, velocity = 0, damping = 1, response = 0.35,
                  restDelta = 0.5, restSpeed = 5, onUpdate, onDone }) {
    const k = (2 * Math.PI / response) ** 2;       // stiffness, for a mass of 1
    const c = 4 * Math.PI * damping / response;    // 2 · damping ratio · natural frequency
    let x = from - to, v = velocity, last = null, raf = 0;
    const handle = {
        get value() { return to + x; },
        get velocity() { return v; },
        stop() { cancelAnimationFrame(raf); },
    };
    const settle = () => { x = 0; v = 0; onUpdate(to, 0); onDone?.(); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { settle(); return handle; }
    const frame = (now) => {
        let dt = last === null ? 1 / 60 : Math.min((now - last) / 1000, 1 / 30);
        last = now;
        while (dt > 0) {                           // fixed sub-steps: same feel at 30–144 Hz
            const h = Math.min(dt, 1 / 240);
            v += (-k * x - c * v) * h;
            x += v * h;
            dt -= h;
        }
        if (Math.abs(x) < restDelta && Math.abs(v) < restSpeed) { settle(); return; }
        onUpdate(to + x, v);
        raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return handle;
}

// Where a flick would come to rest, using Apple's deceleration model.
// d = 0.998 feels like normal scrolling; 0.99 stops sooner.
const project = (velocity, d = 0.998) => (velocity / 1000) * d / (1 - d);

// Past a boundary the element follows less and less. overshoot = how far the
// finger is past the edge; dimension = the element's size on that axis.
const rubberband = (overshoot, dimension, c = 0.55) =>
    (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
```

Measured in Chromium:
- A damping-1.0 spring with a response of 0.35s settles a 300px move in about 0.55s with no
  overshoot, the same at 30, 60 and 120 Hz.
- At damping 0.8 / 0.3s it overshoots by about 1–1.5% and settles in about 0.43s.
- `project(1000)` is 499px.
- `rubberband` never exceeds the element's own size.

## Values

| Release | damping | response |
| --- | --- | --- |
| Reposition: a window snapped into place, a tile dropped | 1.0 | 0.4 |
| Sheet or drawer settling | 1.0; 0.8 only after a flick | 0.3 |
| Snapping back from a rubber-band | 1.0 | 0.3–0.4 |

Apple ships 0.8 for drawers across the board. The appkit default is 1.0, with bounce only when the
release had momentum. The cut-off between "flick" and "let go" (~500 px/s below) is a judgment value;
tune it by feel.

## Worked example: a panel pulled down to dismiss

An app's own bottom panel (`sac-dialog` does not drag yet). Style it with tokens:
`background: var(--glass-strong)`, `box-shadow: var(--shadow-2)`,
`border-radius: var(--radius-l) var(--radius-l) 0 0`, and give it `touch-action: none` (or put that
on a grab handle) so the browser does not scroll instead.

```js
const panel = document.querySelector(".my-panel");
const track = velocityTracker();
let grabY = 0, offset = 0, anim = null;

const place = (y) => { offset = y; panel.style.transform = `translateY(${y}px)`; };

panel.addEventListener("pointerdown", (e) => {
    anim?.stop();                                 // caught mid-flight: carry on from here
    panel.setPointerCapture(e.pointerId);
    grabY = e.clientY - offset;                   // keep the grab offset
    track.reset();
    track.add(offset);
});

panel.addEventListener("pointermove", (e) => {
    if (!panel.hasPointerCapture(e.pointerId)) return;
    const raw = e.clientY - grabY;                // > 0 = pulled down
    place(raw < 0 ? rubberband(raw, panel.offsetHeight) : raw);   // resists upwards
    track.add(offset);
});

const release = () => {
    const v = track.velocity();
    const h = panel.offsetHeight;
    const dismiss = offset + project(v) > h / 2;  // decide from where it is heading
    anim = spring({
        from: offset,
        to: dismiss ? h : 0,
        velocity: v,                              // no seam between finger and spring
        damping: !dismiss && Math.abs(v) > 500 ? 0.8 : 1,
        response: 0.3,
        onUpdate: place,
        onDone: () => { if (dismiss) closePanel(); },
    });
};
panel.addEventListener("pointerup", release);
panel.addEventListener("pointercancel", release);
```

For 2D motion (a thrown window), run one spring per axis with that axis's velocity. A single spring
on the distance loses the direction when the axes move at different speeds.

## Reduced motion

`spring()` jumps straight to the target under `prefers-reduced-motion: reduce`, so the result stays
right and only the travel disappears. Drag tracking itself is not motion the user didn't cause: keep
it 1:1 in every mode.
