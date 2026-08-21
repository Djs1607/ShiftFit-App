import * as React from 'react';
export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  /** Leading slot — icon capsule, day badge, thumbnail. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Right-aligned mono value, e.g. "4 × 8". */
  meta?: string;
  chevron?: boolean;
}
export declare function ListRow(props: ListRowProps): JSX.Element;
