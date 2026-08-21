The standard action control — amber `accent` for starting/logging effort, blue `primary` for confirm and navigation, one per view.

```jsx
<Button variant="accent" size="lg" icon="dumbbell" fullWidth>Start session</Button>
<Button variant="secondary">Skip</Button>
```

Variants: primary, accent, secondary (hairline), ghost, danger (quiet tint). Sizes sm 32 / md 40 / lg 48 — use lg for the one full-width commit button at the bottom of a mobile screen. Press state shrinks to 0.97; never use two filled buttons side by side.
