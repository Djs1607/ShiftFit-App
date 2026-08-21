import * as React from 'react';
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>,'onChange'> {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
