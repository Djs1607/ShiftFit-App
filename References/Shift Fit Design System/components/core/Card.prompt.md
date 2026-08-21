The single container primitive — 14px radius, hairline border, surface fill. Every panel, metric block and list group is a Card.

```jsx
<Card header={<><h4>Fatigue</h4><Badge tone="warning">Elevated</Badge></>}>
  <MetricTile label="Readiness" value="62" unit="%" />
</Card>
```

Tones: default, raised (nested inside another card), inset (wells/tracks), accent/primary (tinted callout). Never add a coloured left border.
