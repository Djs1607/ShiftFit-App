The rota at a glance — one cell per day coloured by shift phase, with a dot where a session was logged.

```jsx
<ShiftRibbon days={[{label:'M',type:'night',session:true},{label:'T',type:'night'},{label:'W',type:'off',today:true}]} />
```

Phase colours are fixed: day = steel blue, swing = amber, night = deep blue, off = grey. Never recolour by fatigue here — that's FatigueGauge's job.
