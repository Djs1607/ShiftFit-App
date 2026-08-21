import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  icon?: string;
  dot?: boolean;
  /** Default true — badges are uppercase micro-labels. */
  uppercase?: boolean;
}
export declare function Badge(props: BadgeProps): JSX.Element;
