import * as React from 'react';
export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>,'onChange'> {
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  /** Unit suffix shown next to the readout (kg, reps). */
  unit?: string;
  label?: string;
  onChange?: (next: number) => void;
}
export declare function Stepper(props: StepperProps): JSX.Element;
