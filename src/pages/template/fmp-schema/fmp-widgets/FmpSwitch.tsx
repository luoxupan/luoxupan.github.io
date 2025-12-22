import { Switch } from 'antd';
import * as React from 'react';

export function FmpSwitch(props: any) {
  const { value } = props;
  return (
    <Switch {...(props as any)} checked={value} />
  );
}