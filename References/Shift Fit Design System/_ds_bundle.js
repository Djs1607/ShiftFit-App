/* @ds-bundle: {"format":4,"namespace":"ShiftFitDesignSystem_f921d2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"FatigueGauge","sourcePath":"components/data/FatigueGauge.jsx"},{"name":"MetricTile","sourcePath":"components/data/MetricTile.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"ShiftRibbon","sourcePath":"components/data/ShiftRibbon.jsx"},{"name":"SparkBars","sourcePath":"components/data/SparkBars.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"ListRow","sourcePath":"components/navigation/ListRow.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"d8a687f4240d","components/core/Button.jsx":"ad1ec74e4314","components/core/Card.jsx":"34512446ed95","components/core/Icon.jsx":"18330fdfef52","components/core/IconButton.jsx":"cd2d8d886701","components/core/Tag.jsx":"0f93788d182a","components/data/FatigueGauge.jsx":"e3c6f6909702","components/data/MetricTile.jsx":"921efe67cd4e","components/data/ProgressBar.jsx":"a58794ba143f","components/data/ShiftRibbon.jsx":"226380641cff","components/data/SparkBars.jsx":"45f14a1836f2","components/feedback/Dialog.jsx":"433c3226c822","components/feedback/EmptyState.jsx":"8faae955a443","components/feedback/Toast.jsx":"c9e1aaf8bec9","components/feedback/Tooltip.jsx":"d00f4d1e6357","components/forms/Checkbox.jsx":"f9463d777ab7","components/forms/Input.jsx":"ad791f3da54b","components/forms/Radio.jsx":"5ad84051262c","components/forms/Select.jsx":"766fe0571f34","components/forms/Stepper.jsx":"89beaea19461","components/forms/Switch.jsx":"e1865bdf74ad","components/navigation/ListRow.jsx":"c5109d5c5c46","components/navigation/SegmentedControl.jsx":"45086e4fc045","components/navigation/TabBar.jsx":"e49ca117778a","components/navigation/TopBar.jsx":"c28123cd2abc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ShiftFitDesignSystem_f921d2 = window.ShiftFitDesignSystem_f921d2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Base container. Elevation in Shift Fit is surface value + hairline, not shadow. */
function Card({
  tone = 'default',
  padding = 'md',
  interactive,
  header,
  footer,
  children,
  style,
  ...rest
}) {
  const bg = {
    default: 'var(--surface-card)',
    raised: 'var(--surface-raised)',
    inset: 'var(--surface-inset)',
    accent: 'var(--action-accent-quiet)',
    primary: 'var(--action-primary-quiet)'
  }[tone];
  const pad = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--gutter-card)',
    lg: 'var(--gutter-card-lg)'
  }[padding];
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      background: bg,
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      padding: pad,
      boxShadow: tone === 'inset' ? 'none' : 'var(--shadow-sm)',
      cursor: interactive ? 'pointer' : undefined,
      transition: 'var(--transition-control)',
      ...style
    }
  }), header && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 'var(--space-4)'
    }
  }, header), children, footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)',
      paddingTop: 'var(--space-4)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CDN = 'https://unpkg.com/lucide-static@0.544.0/icons/';
const SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};
const CACHE = {};

/** Lucide icon inlined as SVG so it survives DOM-based capture (screenshots, PPTX,
 *  card thumbnails) as well as normal rendering. Strokes inherit currentColor. */
function Icon({
  name = 'activity',
  size = 'md',
  color,
  style,
  ...rest
}) {
  const px = SIZES[size] || size;
  const [markup, setMarkup] = React.useState(CACHE[name] || null);
  React.useEffect(() => {
    if (CACHE[name]) {
      setMarkup(CACHE[name]);
      return;
    }
    let live = true;
    fetch(CDN + name + '.svg').then(r => r.ok ? r.text() : '').then(t => {
      if (!t) return;
      const inner = t.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '');
      CACHE[name] = inner;
      if (live) setMarkup(inner);
    }).catch(() => {});
    return () => {
      live = false;
    };
  }, [name]);
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true"
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: px,
      height: px,
      flex: '0 0 auto',
      color: color || 'currentColor',
      ...style
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: px,
    height: px,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block'
    },
    dangerouslySetInnerHTML: markup ? {
      __html: markup
    } : undefined
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: ['var(--surface-raised)', 'var(--text-secondary)', 'var(--border-default)'],
  primary: ['var(--action-primary-quiet)', 'var(--sf-blue-300)', 'rgba(74,122,158,.35)'],
  accent: ['var(--action-accent-quiet)', 'var(--sf-amber-400)', 'rgba(224,164,88,.35)'],
  success: ['var(--feedback-success-quiet)', 'var(--sf-green-400)', 'rgba(94,158,126,.35)'],
  warning: ['var(--feedback-warning-quiet)', 'var(--sf-amber-400)', 'rgba(224,164,88,.35)'],
  danger: ['var(--feedback-danger-quiet)', 'var(--sf-red-400)', 'rgba(196,97,79,.35)']
};

/** Small status marker. Reads state, never navigates. */
function Badge({
  tone = 'neutral',
  icon,
  dot,
  uppercase = true,
  children,
  style,
  ...rest
}) {
  const [bg, fg, bd] = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 8px',
      background: bg,
      color: fg,
      border: `1px solid ${bd}`,
      borderRadius: 'var(--radius-pill)',
      font: 'var(--fw-semibold) var(--fs-micro)/1.4 var(--font-body)',
      letterSpacing: 'var(--ls-label)',
      textTransform: uppercase ? 'uppercase' : 'none',
      ...style
    }
  }), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: fg
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const H = {
  sm: 32,
  md: 40,
  lg: 48
};
const FS = {
  sm: 'var(--fs-body-sm)',
  md: 'var(--fs-body-md)',
  lg: 'var(--fs-body-lg)'
};
const PAD = {
  sm: '0 12px',
  md: '0 16px',
  lg: '0 20px'
};
function skin(variant, state) {
  const on = {
    primary: {
      bg: 'var(--action-primary)',
      fg: 'var(--text-on-primary)',
      bd: 'transparent'
    },
    accent: {
      bg: 'var(--action-accent)',
      fg: 'var(--text-on-accent)',
      bd: 'transparent'
    },
    secondary: {
      bg: 'transparent',
      fg: 'var(--text-primary)',
      bd: 'var(--border-strong)'
    },
    ghost: {
      bg: 'transparent',
      fg: 'var(--text-secondary)',
      bd: 'transparent'
    },
    danger: {
      bg: 'var(--feedback-danger-quiet)',
      fg: 'var(--feedback-danger)',
      bd: 'rgba(196,97,79,.4)'
    }
  }[variant] || {};
  if (state === 'hover') {
    if (variant === 'primary') on.bg = 'var(--action-primary-hover)';
    if (variant === 'accent') on.bg = 'var(--action-accent-hover)';
    if (variant === 'secondary') {
      on.bg = 'var(--surface-hover)';
      on.bd = 'var(--border-focus)';
    }
    if (variant === 'ghost') {
      on.bg = 'var(--surface-hover)';
      on.fg = 'var(--text-primary)';
    }
    if (variant === 'danger') on.bg = 'rgba(196,97,79,.22)';
  }
  if (state === 'press') {
    if (variant === 'primary') on.bg = 'var(--action-primary-press)';
    if (variant === 'accent') on.bg = 'var(--action-accent-press)';
    if (variant !== 'primary' && variant !== 'accent') on.bg = 'var(--surface-press)';
  }
  return on;
}

/** Primary action control. Amber = effort/commit, blue = navigation/confirm. */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  fullWidth,
  disabled,
  children,
  style,
  onClick,
  ...rest
}) {
  const [s, setS] = useState('rest');
  const k = skin(variant, disabled ? 'rest' : s);
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setS('hover'),
    onMouseLeave: () => setS('rest'),
    onMouseDown: () => setS('press'),
    onMouseUp: () => setS('hover'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: H[size],
      padding: PAD[size],
      width: fullWidth ? '100%' : undefined,
      font: `var(--fw-semibold) ${FS[size]}/1 var(--font-body)`,
      letterSpacing: '-0.005em',
      whiteSpace: 'nowrap',
      background: k.bg,
      color: k.fg,
      border: `1px solid ${k.bd}`,
      borderRadius: 'var(--radius-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .4 : 1,
      transform: s === 'press' && !disabled ? 'scale(var(--press-scale))' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'lg' ? 'lg' : 'sm'
  }), children, iconAfter && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconAfter,
    size: size === 'lg' ? 'lg' : 'sm'
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const H = {
  sm: 32,
  md: 40,
  lg: 48
};

/** Square, label-free control for toolbars and cards. */
function IconButton({
  icon = 'more-horizontal',
  size = 'md',
  variant = 'ghost',
  label,
  disabled,
  style,
  ...rest
}) {
  const [h, setH] = useState(false),
    [p, setP] = useState(false);
  const filled = variant === 'filled';
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: H[size],
      height: H[size],
      background: filled ? 'var(--surface-raised)' : p ? 'var(--surface-press)' : h ? 'var(--surface-hover)' : 'transparent',
      color: h || filled ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: filled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      borderRadius: 'var(--radius-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .4 : 1,
      transform: p ? 'scale(var(--press-scale))' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 'sm' : 'md'
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Selectable/removable chip — filters, muscle groups, session labels. */
function Tag({
  selected,
  onRemove,
  icon,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 28,
      padding: '0 10px',
      background: selected ? 'var(--surface-selected)' : 'var(--surface-raised)',
      color: selected ? 'var(--sf-blue-300)' : 'var(--text-secondary)',
      border: `1px solid ${selected ? 'rgba(74,122,158,.45)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-sm)',
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)',
      cursor: 'pointer',
      transition: 'var(--transition-control)',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }), children, onRemove && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14,
    onClick: onRemove,
    style: {
      opacity: .6,
      cursor: 'pointer'
    }
  }));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/FatigueGauge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BANDS = [{
  max: 20,
  label: 'Fresh',
  c: 'var(--sf-fatigue-1)'
}, {
  max: 40,
  label: 'Ready',
  c: 'var(--sf-fatigue-2)'
}, {
  max: 65,
  label: 'Elevated',
  c: 'var(--sf-fatigue-3)'
}, {
  max: 85,
  label: 'High',
  c: 'var(--sf-fatigue-4)'
}, {
  max: 101,
  label: 'Critical',
  c: 'var(--sf-fatigue-5)'
}];

/** 240° arc gauge for the fatigue/readiness score. Band colour carries meaning. */
function FatigueGauge({
  value = 0,
  size = 180,
  label = 'Fatigue',
  caption,
  thickness = 12,
  style,
  ...rest
}) {
  const band = BANDS.find(b => value < b.max) || BANDS[4];
  const r = (size - thickness) / 2,
    c = size / 2,
    sweep = 270,
    start = 135;
  const len = 2 * Math.PI * r * (sweep / 360);
  const pol = (a, rad) => [c + rad * Math.cos(a * Math.PI / 180), c + rad * Math.sin(a * Math.PI / 180)];
  const arc = (from, to) => {
    const [x1, y1] = pol(from, r),
      [x2, y2] = pol(to, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size * 0.82
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: arc(start, start + sweep),
    fill: "none",
    stroke: "var(--data-track)",
    strokeWidth: thickness,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: arc(start, start + sweep),
    fill: "none",
    stroke: band.c,
    strokeWidth: thickness,
    strokeLinecap: "round",
    strokeDasharray: `${len} ${len}`,
    strokeDashoffset: len * (1 - Math.min(100, value) / 100),
    style: {
      transition: 'stroke-dashoffset var(--dur-meter) var(--ease-mechanical), stroke var(--dur-base) var(--ease-standard)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: size * 0.04
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) ${size * 0.26}px/1 var(--font-mono)`,
      fontFeatureSettings: 'var(--font-numeric-feature)',
      color: 'var(--text-primary)',
      letterSpacing: '-0.03em'
    }
  }, Math.round(value)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 6,
      font: 'var(--fw-semibold) var(--fs-micro)/1 var(--font-body)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: band.c
    }
  }, band.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 2,
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 6,
      maxWidth: size + 40,
      textAlign: 'center',
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, caption));
}
Object.assign(__ds_scope, { FatigueGauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FatigueGauge.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TREND = {
  up: ['trending-up', 'var(--sf-green-400)'],
  down: ['trending-down', 'var(--sf-red-400)'],
  flat: ['minus', 'var(--text-tertiary)']
};

/** Single number readout: uppercase label, mono value, optional delta. */
function MetricTile({
  label,
  value,
  unit,
  delta,
  trend,
  size = 'md',
  icon,
  style,
  ...rest
}) {
  const fs = {
    sm: 'var(--fs-metric-md)',
    md: 'var(--fs-metric-lg)',
    lg: 'var(--fs-metric-xl)'
  }[size];
  const t = TREND[trend];
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13
  }), label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) ${fs}/1 var(--font-mono)`,
      fontFeatureSettings: 'var(--font-numeric-feature)',
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, unit)), (delta || t) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
      color: t ? t[1] : 'var(--text-tertiary)'
    }
  }, t && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t[0],
    size: 13
  }), delta));
}
Object.assign(__ds_scope, { MetricTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricTile.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Linear track — session completion, weekly targets, upload states. */
function ProgressBar({
  value = 0,
  max = 100,
  tone = 'primary',
  height = 8,
  label,
  valueLabel,
  style,
  ...rest
}) {
  const pct = Math.min(100, value / max * 100);
  const c = {
    primary: 'var(--action-primary)',
    accent: 'var(--action-accent)',
    success: 'var(--feedback-success)',
    danger: 'var(--feedback-danger)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), (label || valueLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
      fontFeatureSettings: 'var(--font-numeric-feature)',
      color: 'var(--text-secondary)'
    }
  }, valueLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      background: 'var(--data-track)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      background: c,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-mechanical)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/ShiftRibbon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const C = {
  day: 'var(--sf-shift-day)',
  swing: 'var(--sf-shift-swing)',
  night: 'var(--sf-shift-night)',
  off: 'var(--sf-shift-off)'
};

/** Horizontal circadian strip: one cell per day, coloured by shift phase. */
function ShiftRibbon({
  days = [],
  height = 32,
  showLabels = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: d.type,
    style: {
      flex: 1,
      height,
      background: C[d.type] || C.off,
      borderRadius: 'var(--radius-xs)',
      position: 'relative',
      outline: d.today ? '1px solid var(--text-primary)' : 'none',
      outlineOffset: 1
    }
  }, d.session && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 4,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: 'var(--sf-ink-100)'
    }
  })))), showLabels && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      font: 'var(--fw-medium) var(--fs-micro)/1 var(--font-mono)',
      color: d.today ? 'var(--text-primary)' : 'var(--text-tertiary)'
    }
  }, d.label))));
}
Object.assign(__ds_scope, { ShiftRibbon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ShiftRibbon.jsx", error: String((e && e.message) || e) }); }

// components/data/SparkBars.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Compact bar chart for weekly volume / sleep debt. No axes, no gridlines. */
function SparkBars({
  data = [],
  height = 64,
  color = 'var(--action-primary)',
  highlightLast,
  labels,
  style,
  ...rest
}) {
  const max = Math.max(1, ...data);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 4,
      height
    }
  }, data.map((v, i) => {
    const last = highlightLast && i === data.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        height: `${Math.max(3, v / max * 100)}%`,
        background: last ? 'var(--action-accent)' : color,
        opacity: last ? 1 : .62,
        borderRadius: '2px 2px 0 0',
        transition: 'height var(--dur-meter) var(--ease-mechanical)'
      }
    });
  })), labels && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      font: 'var(--fw-medium) var(--fs-micro)/1 var(--font-mono)',
      color: 'var(--text-tertiary)'
    }
  }, l))));
}
Object.assign(__ds_scope, { SparkBars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SparkBars.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Modal sheet. On mobile it rises from the bottom; on wide screens it centres. */
function Dialog({
  open = true,
  title,
  description,
  children,
  actions,
  onClose,
  variant = 'sheet',
  style,
  ...rest
}) {
  if (!open) return null;
  const sheet = variant === 'sheet';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: sheet ? 'flex-end' : 'center',
      justifyContent: 'center',
      background: 'var(--bg-scrim)',
      backdropFilter: 'blur(6px)',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "dialog",
    "aria-modal": "true",
    style: {
      width: '100%',
      maxWidth: sheet ? 'none' : 440,
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-default)',
      borderRadius: sheet ? 'var(--radius-sheet) var(--radius-sheet) 0 0' : 'var(--radius-lg)',
      boxShadow: sheet ? 'var(--shadow-sheet)' : 'var(--shadow-lg)',
      padding: 'var(--space-6)',
      animation: `sf-rise var(--dur-sheet) var(--ease-out)`,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--fs-title-lg)/1.2 var(--font-display)',
      letterSpacing: 'var(--ls-title)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, description)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    onClick: onClose
  })), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)'
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-7)'
    }
  }, actions)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Zero-data state: glyph, one line of plain talk, one action. */
function EmptyState({
  icon = 'inbox',
  title,
  message,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-9) var(--space-6)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "lg",
    color: "var(--text-tertiary)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-title-sm)/1.3 var(--font-display)',
      color: 'var(--text-primary)'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      maxWidth: 280,
      font: 'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, message)), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: ['info', 'var(--sf-blue-300)'],
  success: ['check-circle', 'var(--sf-green-400)'],
  warning: ['alert-triangle', 'var(--sf-amber-400)'],
  danger: ['alert-circle', 'var(--sf-red-400)']
};

/** Transient confirmation. One line, one optional action, auto-dismissing. */
function Toast({
  tone = 'info',
  title,
  message,
  action,
  onClose,
  style,
  ...rest
}) {
  const [icon, c] = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 12px 12px 14px',
      minWidth: 280,
      maxWidth: 420,
      background: 'var(--surface-overlay)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'sf-rise var(--dur-base) var(--ease-out)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "md",
    color: c,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.45 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, message), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    size: "sm",
    label: "Dismiss",
    onClick: onClose
  }));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Hover/focus hint for icon-only controls and metric definitions. */
function Tooltip({
  label,
  placement = 'top',
  children,
  style,
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const pos = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }), children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...pos,
      zIndex: 40,
      whiteSpace: 'nowrap',
      padding: '6px 9px',
      background: 'var(--sf-ink-700)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)',
      font: 'var(--fw-medium) var(--fs-body-sm)/1.2 var(--font-body)',
      animation: 'sf-rise var(--dur-fast) var(--ease-out)'
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-select control. 20px box, 4px radius, amber when checked. */
function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({}, rest, {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : 1,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      marginTop: 1,
      flex: '0 0 auto',
      background: checked ? 'var(--action-accent)' : 'var(--surface-inset)',
      border: `1px solid ${checked ? 'var(--action-accent)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-xs)',
      transition: 'var(--transition-control)'
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    color: "var(--text-on-accent)"
  })), (label || description) && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Text/number field. Inset well, hairline border, blue focus. */
function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  size = 'md',
  style,
  wrapperStyle,
  ...rest
}) {
  const [f, setF] = useState(false);
  const h = {
    sm: 32,
    md: 40,
    lg: 48
  }[size];
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      ...wrapperStyle
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 6,
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 12px',
      background: 'var(--surface-inset)',
      border: `1px solid ${error ? 'var(--feedback-danger)' : f ? 'var(--border-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-control)',
      boxShadow: f ? '0 0 0 3px rgba(74,122,158,.18)' : 'none',
      transition: 'var(--transition-control)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm",
    color: "var(--text-tertiary)"
  }), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setF(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setF(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      background: 'none',
      border: 'none',
      outline: 'none',
      color: 'var(--text-primary)',
      font: 'var(--text-body-md)',
      ...style
    }
  })), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
      color: 'var(--text-tertiary)'
    }
  }, suffix)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 6,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: error ? 'var(--feedback-danger)' : 'var(--text-tertiary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Single-choice row. */
function Radio({
  checked,
  onChange,
  label,
  description,
  name,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({}, rest, {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : 1,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(true),
    "data-name": name,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      marginTop: 1,
      flex: '0 0 auto',
      borderRadius: '50%',
      background: 'var(--surface-inset)',
      border: `1px solid ${checked ? 'var(--action-primary)' : 'var(--border-strong)'}`,
      transition: 'var(--transition-control)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--action-primary)'
    }
  })), (label || description) && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Native select with Shift Fit chrome. */
function Select({
  label,
  hint,
  options = [],
  size = 'md',
  style,
  ...rest
}) {
  const [f, setF] = useState(false);
  const h = {
    sm: 32,
    md: 40,
    lg: 48
  }[size];
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 6,
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      appearance: 'none',
      width: '100%',
      height: h,
      padding: '0 34px 0 12px',
      background: 'var(--surface-inset)',
      color: 'var(--text-primary)',
      border: `1px solid ${f ? 'var(--border-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-control)',
      font: 'var(--text-body-md)',
      outline: 'none',
      cursor: 'pointer',
      transition: 'var(--transition-control)',
      ...style
    }
  }), options.map(o => {
    const v = typeof o === 'string' ? o : o.value,
      l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: "sm",
    color: "var(--text-tertiary)",
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  })), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 6,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Numeric stepper for reps, sets and load — thumb-friendly, mono readout. */
function Stepper({
  value = 0,
  step = 1,
  min = 0,
  max = 999,
  unit,
  onChange,
  label,
  style,
  ...rest
}) {
  const set = v => onChange && onChange(Math.min(max, Math.max(min, +v.toFixed(2))));
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: 4,
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-control)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "minus",
    label: "Decrease",
    onClick: () => set(value - step)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'center',
      font: `var(--fw-medium) var(--fs-metric-md)/1 var(--font-mono)`,
      fontFeatureSettings: 'var(--font-numeric-feature)',
      color: 'var(--text-primary)'
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 4,
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-tertiary)'
    }
  }, unit)), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "plus",
    label: "Increase",
    onClick: () => set(value + step)
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Instant-effect setting toggle. */
function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      opacity: disabled ? .45 : 1,
      ...style
    }
  }), (label || description) && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, label), description && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, description)), /*#__PURE__*/React.createElement("button", {
    role: "switch",
    "aria-checked": !!checked,
    disabled: disabled,
    onClick: () => onChange && onChange(!checked),
    style: {
      position: 'relative',
      width: 44,
      height: 26,
      flex: '0 0 auto',
      padding: 0,
      background: checked ? 'var(--action-primary)' : 'var(--surface-raised)',
      border: `1px solid ${checked ? 'var(--action-primary)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color var(--dur-base) var(--ease-standard),border-color var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 20 : 2,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: checked ? '#F2F7FB' : 'var(--sf-ink-300)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Tappable row for lists of sessions, exercises, settings. */
function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  meta,
  chevron = true,
  onClick,
  style,
  ...rest
}) {
  const [h, setH] = useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      minHeight: 'var(--tap-min)',
      padding: '12px var(--gutter-card)',
      background: h && onClick ? 'var(--surface-hover)' : 'transparent',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background-color var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }), leading, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-tertiary)'
    }
  }, subtitle)), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
      fontFeatureSettings: 'var(--font-numeric-feature)',
      color: 'var(--text-secondary)'
    }
  }, meta), trailing, chevron && onClick && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: "sm",
    color: "var(--text-tertiary)"
  }));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 2–4 mutually exclusive views (Week / Month / Cycle). */
function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "tablist",
    style: {
      display: 'inline-flex',
      padding: 3,
      gap: 2,
      width: fullWidth ? '100%' : undefined,
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-control)',
      ...style
    }
  }), options.map(o => {
    const v = typeof o === 'string' ? o : o.value,
      l = typeof o === 'string' ? o : o.label;
    const on = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(v),
      style: {
        flex: 1,
        height: 32,
        padding: '0 12px',
        background: on ? 'var(--surface-overlay)' : 'transparent',
        color: on ? 'var(--text-primary)' : 'var(--text-tertiary)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        font: `${on ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`,
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition-control)'
      }
    }, l);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Bottom navigation, 4–5 destinations, active item in amber. */
function TabBar({
  items = [],
  active,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      height: 'var(--tabbar-h)',
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-subtle)',
      ...style
    }
  }), items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onChange && onChange(it.id),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: on ? 'var(--action-accent)' : 'var(--text-tertiary)',
        transition: 'color var(--dur-fast) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: "md"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: `${on ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-micro)/1 var(--font-body)`,
        letterSpacing: '.02em'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Screen header: 56px, hairline underline, optional eyebrow. */
function TopBar({
  title,
  eyebrow,
  back,
  onBack,
  actions,
  sticky,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      height: 'var(--nav-h)',
      padding: '0 var(--gutter-screen)',
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border-subtle)',
      position: sticky ? 'sticky' : 'relative',
      top: sticky ? 0 : undefined,
      zIndex: 20,
      ...style
    }
  }), back && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "chevron-left",
    label: "Back",
    onClick: onBack,
    style: {
      marginLeft: -8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-micro)/1 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      marginBottom: 3
    }
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-semibold) var(--fs-title-md)/1.15 var(--font-display)',
      letterSpacing: 'var(--ls-title)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, title)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      marginRight: -8
    }
  }, actions));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.FatigueGauge = __ds_scope.FatigueGauge;

__ds_ns.MetricTile = __ds_scope.MetricTile;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ShiftRibbon = __ds_scope.ShiftRibbon;

__ds_ns.SparkBars = __ds_scope.SparkBars;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
