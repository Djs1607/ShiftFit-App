import * as React from 'react';
export interface RadioProps extends Omit<React.HTMLAttributes<HTMLLabelElement>,'onChange'> {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  description?: string;
  name?: string;
  disabled?: boolean;
}
export declare function Radio(props: RadioProps): JSX.Element;
