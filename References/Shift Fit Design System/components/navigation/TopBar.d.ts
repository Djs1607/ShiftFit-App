import * as React from 'react';
export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  /** Uppercase context line above the title, e.g. "NIGHT 3 OF 4". */
  eyebrow?: string;
  back?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  sticky?: boolean;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
