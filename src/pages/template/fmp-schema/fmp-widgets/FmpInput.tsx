import { Input } from 'antd';
import * as React from 'react';

export function FmpInput(props: any) {
  return (
    <Input {...(props as any)} autoComplete="off" />
  );
}