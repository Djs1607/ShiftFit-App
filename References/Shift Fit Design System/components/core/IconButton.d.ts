import * as React from 'react';
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'filled';
  /** Required for a11y — becomes aria-label. */
  label?: string;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
