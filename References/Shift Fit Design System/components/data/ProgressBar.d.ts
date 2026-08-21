import * as React from 'react';
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  tone?: 'primary' | 'accent' | 'success' | 'danger';
  height?: number;
  label?: string;
  /** Right-aligned mono readout, e.g. "3 / 5 sets". */
  valueLabel?: string;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
