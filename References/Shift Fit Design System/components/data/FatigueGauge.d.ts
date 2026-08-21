import * as React from 'react';
export interface FatigueGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 fatigue score. Band and colour are derived. */
  value?: number;
  size?: number;
  label?: string;
  /** Plain-language explanation under the gauge. */
  caption?: string;
  thickness?: number;
}
export declare function FatigueGauge(props: FatigueGaugeProps): JSX.Element;
