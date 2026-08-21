import * as React from 'react';
export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLLabelElement>,'onChange'> {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
