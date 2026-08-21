import * as React from 'react';
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message?: string;
  /** Usually a ghost Button — "Undo", "View". */
  action?: React.ReactNode;
  onClose?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
