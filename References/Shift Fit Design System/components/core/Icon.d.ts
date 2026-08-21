import * as React from 'react';
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon slug, e.g. "dumbbell", "moon", "battery-low". */
  name?: string;
  /** Token sizes, or a raw px number. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Override colour; defaults to currentColor. */
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
