import * as React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'raised' | 'inset' | 'accent' | 'primary';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
