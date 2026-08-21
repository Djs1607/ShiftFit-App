import * as React from 'react';
export interface ShiftDay {
  label: string;
  type: 'day' | 'swing' | 'night' | 'off';
  /** Dot marker — a workout was logged that day. */
  session?: boolean;
  today?: boolean;
}
export interface ShiftRibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  days?: ShiftDay[];
  height?: number;
  showLabels?: boolean;
}
export declare function ShiftRibbon(props: ShiftRibbonProps): JSX.Element;
