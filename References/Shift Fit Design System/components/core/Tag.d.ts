import * as React from 'react';
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  onRemove?: () => void;
  icon?: string;
}
export declare function Tag(props: TagProps): JSX.Element;
