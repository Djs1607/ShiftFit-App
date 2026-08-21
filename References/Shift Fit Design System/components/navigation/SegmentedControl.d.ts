import * as React from 'react';
export interface SegmentOption { value: string; label: string }
export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: Array<string | SegmentOption>;
  value?: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
