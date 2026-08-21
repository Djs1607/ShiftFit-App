import * as React from 'react';
export interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  /** Comparison string, e.g. "+4.2 vs last week". */
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}
export declare function MetricTile(props: MetricTileProps): JSX.Element;
