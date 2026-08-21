import * as React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Leading Lucide glyph. */
  icon?: string;
  /** Trailing unit, rendered in mono (kg, reps, hrs). */
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  wrapperStyle?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
