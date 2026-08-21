import * as React from 'react';
/**
 * Shift Fit button.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide slug rendered before the label. */
  icon?: string;
  /** Lucide slug rendered after the label. */
  iconAfter?: string;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
