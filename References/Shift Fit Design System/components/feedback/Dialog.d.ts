import * as React from 'react';
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: string;
  description?: string;
  /** Buttons row, primary action last. */
  actions?: React.ReactNode;
  onClose?: () => void;
  /** "sheet" rises from the bottom (mobile default); "center" for desktop. */
  variant?: 'sheet' | 'center';
}
export declare function Dialog(props: DialogProps): JSX.Element;
