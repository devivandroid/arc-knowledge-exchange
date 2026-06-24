# Arc Knowledge Exchange Brand Guide

Arc Knowledge Exchange uses a premium dark Web3 identity built around a geometric isometric cube. The mark is inspired by the Option 4 reference direction, but it is a clean production vector and does not use or imply affiliation with Arc, Circle, or any official ecosystem logo.

## Logo Usage

Primary assets:

- `public/brand/logo-mark.svg`: standalone icon for app UI, avatars, favicons, and compact placements.
- `public/brand/logo-wordmark.svg`: horizontal lockup for documentation, README, and wider header placements.
- `public/brand/favicon.svg`: simplified icon for browser tabs and small sizes.
- `branding/option-4-reference.png`: visual reference only.

Use the logo on dark backgrounds whenever possible. Keep enough clear space around the mark so the cube remains legible at small sizes. Do not add text inside the cube.

## Color Palette

| Role       | Hex       |
| ---------- | --------- |
| Background | `#0B1020` |
| Surface    | `#0F172A` |
| Purple     | `#7C3AED` |
| Indigo     | `#5B21B6` |
| Blue       | `#2563EB` |
| Cyan       | `#06B6D4` |
| Text       | `#F8FAFC` |
| Muted text | `#94A3B8` |
| Border     | `#1E293B` |

## Gradients

Primary brand gradient:

```css
linear-gradient(135deg, #7C3AED 0%, #2563EB 52%, #06B6D4 100%)
```

Deep face gradient:

```css
linear-gradient(160deg, #7C3AED 0%, #5B21B6 55%, #2563EB 100%)
```

Accent glow:

```css
box-shadow: 0 0 44px rgba(37, 99, 235, 0.22);
```

## Typography

Use Inter where available. Fallback stack:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Headings should be high contrast, concise, and direct. Use sentence case for product copy and title case for major page titles.

## Dark UI Style

- Use `#0B1020` as the main app background.
- Use `#0F172A` for panels, cards, nav, and footer surfaces.
- Use thin `#1E293B` borders.
- Use subtle purple and cyan radial glows for depth.
- Keep layouts spacious and technical, similar to polished developer tooling.

## Button Style

Primary buttons use cyan or the purple-blue-cyan gradient on dark backgrounds. Labels should describe the action clearly:

- `Unlock Resource`
- `Publish Resource`
- `Submit Delivery`
- `View Receipt`
- `Connect Wallet`

Avoid vague labels such as `Start`, `Go`, or `Continue` when a blockchain action is involved.

## Card Style

- Radius: `8px`.
- Border: `1px solid #1E293B`.
- Background: `#0F172A` with subtle transparency when appropriate.
- Use clear metadata rows for price, license, seller, and access type.
- Avoid dense decorative effects that reduce readability.

## Icon Style

Icons should be simple, geometric, and high contrast. Prefer line icons or solid geometric forms. Avoid illustration-heavy marks.

## Do

- Use the cube mark as the primary brand symbol.
- Keep the mark readable at `16x16`, `32x32`, and `64x64`.
- Use the brand gradient for emphasis.
- Use strong contrast on dark surfaces.
- Keep Web3 cues subtle and professional.

## Don't

- Do not use Arc or Circle official marks.
- Do not imply official affiliation with Arc or Circle.
- Do not place text inside the icon.
- Do not use brains, robots, sparkles, neural networks, or other AI cliché symbols.
- Do not distort, rotate, outline, or recolor the logo outside the brand palette.
- Do not embed raster artwork inside SVG logo files.
