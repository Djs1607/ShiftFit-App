import * as React from 'react';
export interface SparkBarsProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: number[];
  height?: number;
  color?: string;
  /** Paint the final bar amber — "this is now". */
  highlightLast?: boolean;
  labels?: string[];
}
export declare function SparkBars(props: SparkBarsProps): JSX.Element;
