import * as React from 'react';
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
