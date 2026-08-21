Blocking decision or focused input. Renders inside the nearest positioned ancestor, so wrap it in a `position:relative` phone frame.

```jsx
<Dialog title="End session?" description="You have two sets left in this block."
  actions={<><Button variant="secondary" fullWidth>Keep going</Button><Button fullWidth>End</Button></>} />
```

Scrim is 72% ink-950 plus 6px blur. Sheet rises over 420ms; centre variant fades.
