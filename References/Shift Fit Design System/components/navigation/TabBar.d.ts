import * as React from 'react';
export interface TabItem { id: string; label: string; icon: string }
export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  items?: TabItem[];
  active?: string;
  onChange?: (id: string) => void;
}
export declare function TabBar(props: TabBarProps): JSX.Element;
