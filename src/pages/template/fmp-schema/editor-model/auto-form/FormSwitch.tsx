import { Switch } from 'antd';
import * as React from 'react';

export default function (props: any) {

  const { value, label, onChange } = props;

  return (
    <>
      <Switch
        checked={value}
        onChange={onChange} />
    </>
  );
}